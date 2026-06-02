const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const db = require('../db/database');
const { client } = require('../db/cache');

// POST /shorten
router.post('/shorten', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const short_code = nanoid(6);

  try {
    db.prepare(`
      INSERT INTO urls (short_code, original_url) VALUES (?, ?)
    `).run(short_code, url);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save URL' });
  }

  return res.status(201).json({
    short_code,
    short_url: `${process.env.BASE_URL}/${short_code}`,
    original_url: url,
  });
});

module.exports = router;