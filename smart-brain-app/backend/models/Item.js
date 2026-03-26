const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
  text: { type: String, required: true },
  note: { type: String, default: '' },
  color: { type: String, default: '#f59e0b' },
  createdAt: { type: Date, default: Date.now },
});

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['article', 'tweet', 'image', 'youtube', 'pdf', 'note', 'link'],
      default: 'link',
    },
    content: { type: String, default: '' },       // excerpt / description
    fileUrl: { type: String, default: '' },        // ImageKit URL (for uploads)
    thumbnailUrl: { type: String, default: '' },   // og:image or YouTube thumb

    tags: [{ type: String, lowercase: true, trim: true }],
    topics: [{ type: String, lowercase: true, trim: true }],
    highlights: [HighlightSchema],

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
    },

    metadata: {
      author: { type: String, default: '' },
      publishDate: { type: String, default: '' },
      siteName: { type: String, default: '' },
      favicon: { type: String, default: '' },
      duration: { type: String, default: '' },   // YouTube video duration
      wordCount: { type: Number, default: 0 },
    },

    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    lastViewed: { type: Date, default: null },
  },
  { timestamps: true }
);

// Full-text index for semantic search
ItemSchema.index({ title: 'text', content: 'text', tags: 'text', topics: 'text' });

module.exports = mongoose.model('Item', ItemSchema);
