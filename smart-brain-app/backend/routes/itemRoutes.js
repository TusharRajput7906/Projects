const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { upload } = require('../services/uploadService');

// ── Special routes FIRST (before /:id to avoid collision) ─────────────────────
router.get('/stats',     itemController.getStats);
router.get('/resurface', itemController.getResurfaceItems);
router.get('/graph',     itemController.getGraphData);

// ── File upload ────────────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), itemController.uploadFile);

// ── CRUD ───────────────────────────────────────────────────────────────────────
router.get('/',    itemController.getAllItems);
router.post('/',   itemController.createItem);
router.get('/:id', itemController.getItemById);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

// ── Sub-resources ──────────────────────────────────────────────────────────────
router.get('/:id/related',   itemController.getRelatedItems);
router.post('/:id/highlight', itemController.addHighlight);

module.exports = router;
