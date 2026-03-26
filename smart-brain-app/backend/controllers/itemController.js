const Item = require('../models/Item');
const Collection = require('../models/Collection');
const { extractKeywords, inferTopics, detectTypeFromUrl, jaccardSimilarity } = require('../services/autoTagService');
const { fetchMetadata } = require('../services/scrapeService');
const { uploadToImageKit } = require('../services/uploadService');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items  — list with filters & search
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllItems = async (req, res) => {
  try {
    const { search, type, tag, collectionId, favorite, archived, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    if (collectionId) filter.collectionId = collectionId;
    if (favorite === 'true') filter.isFavorite = true;
    filter.isArchived = archived === 'true';

    // Full-text search via MongoDB text index
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(search ? { score: { $meta: 'textScore' }, ...parseSortParam(sort) } : parseSortParam(sort))
        .skip(skip)
        .limit(Number(limit))
        .populate('collectionId', 'name color icon'),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items/stats
// ─────────────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, byType, recentCount, tagAgg] = await Promise.all([
      Item.countDocuments({ isArchived: false }),
      Item.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Item.countDocuments({
        isArchived: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Item.aggregate([
        { $match: { isArchived: false } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const types = {};
    byType.forEach(({ _id, count }) => { types[_id] = count; });

    res.json({ total, types, recentCount, topTags: tagAgg.map(t => ({ tag: t._id, count: t.count })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items/resurface  — items saved 6–10 weeks ago, not recently viewed
// ─────────────────────────────────────────────────────────────────────────────
exports.getResurfaceItems = async (req, res) => {
  try {
    const now = new Date();
    const weeksAgo10 = new Date(now - 70 * 24 * 60 * 60 * 1000);
    const weeksAgo6  = new Date(now - 42 * 24 * 60 * 60 * 1000);

    const items = await Item.find({
      isArchived: false,
      createdAt: { $gte: weeksAgo10, $lte: weeksAgo6 },
      $or: [{ lastViewed: null }, { lastViewed: { $lte: weeksAgo6 } }],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('collectionId', 'name color icon');

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items/graph  — nodes + edges for D3 visualization
// ─────────────────────────────────────────────────────────────────────────────
exports.getGraphData = async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false }, 'title type tags topics').limit(200);

    const nodes = [];
    const links = [];
    const tagSet = new Map(); // tag -> node index

    // Item nodes
    items.forEach((item) => {
      nodes.push({ id: item._id.toString(), label: item.title.slice(0, 40), type: item.type, group: 'item' });
    });

    // Tag nodes + links
    items.forEach((item) => {
      const itemId = item._id.toString();
      (item.tags || []).forEach((tag) => {
        if (!tagSet.has(tag)) {
          tagSet.set(tag, nodes.length);
          nodes.push({ id: `tag:${tag}`, label: tag, type: 'tag', group: 'tag' });
        }
        links.push({ source: itemId, target: `tag:${tag}` });
      });
    });

    res.json({ nodes, links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('collectionId', 'name color icon');
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Update lastViewed
    await Item.findByIdAndUpdate(req.params.id, { lastViewed: new Date() });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/items/:id/related
// ─────────────────────────────────────────────────────────────────────────────
exports.getRelatedItems = async (req, res) => {
  try {
    const source = await Item.findById(req.params.id);
    if (!source) return res.status(404).json({ error: 'Item not found' });

    const candidates = await Item.find({
      _id: { $ne: source._id },
      isArchived: false,
    }, 'title type tags thumbnailUrl url createdAt').limit(100);

    const scored = candidates
      .map((item) => ({
        item,
        score: jaccardSimilarity(source.tags, item.tags),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.item);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/items  — create item (URL → auto-scrape + auto-tag)
// ─────────────────────────────────────────────────────────────────────────────
exports.createItem = async (req, res) => {
  try {
    let { title, url, type, content, tags, topics, collectionId, thumbnailUrl } = req.body;

    // Auto-detect type from URL if not provided
    if (!type || type === 'link') type = detectTypeFromUrl(url);

    // Auto-scrape metadata if URL provided and title is missing
    let metadata = {};
    if (url && (!title || !content)) {
      const scraped = await fetchMetadata(url);
      title = title || scraped.title || url;
      content = content || scraped.description || '';
      thumbnailUrl = thumbnailUrl || scraped.thumbnailUrl || '';
      metadata = {
        author: scraped.author || '',
        publishDate: scraped.publishDate || '',
        siteName: scraped.siteName || '',
        favicon: scraped.favicon || '',
        wordCount: scraped.wordCount || 0,
      };
      // Auto-tag from scraped body text if no tags given
      if (!tags || tags.length === 0) {
        const text = `${title} ${content} ${scraped.bodyText || ''}`;
        tags = extractKeywords(text, 8);
        topics = inferTopics(tags);
      }
    }

    if (!tags || tags.length === 0) {
      const text = `${title} ${content}`;
      tags = extractKeywords(text, 8);
      topics = inferTopics(tags);
    }

    const item = await Item.create({
      title,
      url,
      type,
      content,
      tags: tags || [],
      topics: topics || [],
      thumbnailUrl: thumbnailUrl || '',
      metadata,
      collectionId: collectionId || null,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/items/upload  — file upload via Multer → ImageKit
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file attached' });

    const { title, collectionId } = req.body;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const isImage = /jpg|jpeg|png|gif|webp|svg/.test(ext);
    const isPdf = ext === 'pdf';
    const type = isImage ? 'image' : isPdf ? 'pdf' : 'link';

    // Upload to ImageKit
    const result = await uploadToImageKit(req.file.buffer, req.file.originalname);

    const tags = extractKeywords(title || req.file.originalname, 5);
    const topics = inferTopics(tags);

    const item = await Item.create({
      title: title || req.file.originalname,
      type,
      fileUrl: result.url,
      thumbnailUrl: isImage ? result.url : '',
      tags,
      topics,
      metadata: { siteName: 'Upload' },
      collectionId: collectionId || null,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/items/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/items/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/items/:id/highlight
// ─────────────────────────────────────────────────────────────────────────────
exports.addHighlight = async (req, res) => {
  try {
    const { text, note, color } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $push: { highlights: { text, note, color } } },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function parseSortParam(sort) {
  if (!sort) return { createdAt: -1 };
  const order = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  return { [field]: order };
}
