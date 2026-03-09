const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY   = process.env.TMDB_API_KEY;

router.get('/*', async (req, res) => {
  try {
    const url = `${TMDB_BASE}${req.path}`;
    // Only inject api_key if we have it — never override with undefined
    const params = API_KEY
      ? { ...req.query, api_key: API_KEY }
      : req.query;
    const response = await axios.get(url, { params, timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    // Forward TMDB's own error body so frontend can display it
    const body = err.response?.data || { message: err.message };
    res.status(status).json(body);
  }
});

module.exports = router;
