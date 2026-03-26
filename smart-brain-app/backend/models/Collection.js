const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#7c3aed' },
    icon: { type: String, default: '📁' },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', CollectionSchema);
