const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Item = require('../models/Item');

// GET all collections (with item count)
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().sort('-isPinned -createdAt');
    // Attach item count to each
    const withCounts = await Promise.all(
      collections.map(async (col) => {
        const count = await Item.countDocuments({ collectionId: col._id, isArchived: false });
        return { ...col.toObject(), itemCount: count };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create collection
router.post('/', async (req, res) => {
  try {
    const col = await Collection.create(req.body);
    res.status(201).json(col);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update collection
router.put('/:id', async (req, res) => {
  try {
    const col = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    res.json(col);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE collection (unlink items)
router.delete('/:id', async (req, res) => {
  try {
    await Item.updateMany({ collectionId: req.params.id }, { collectionId: null });
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
