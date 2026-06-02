const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const db = require('../db/database');
const { client } = require('../db/cache');
const { validateUrl } = require('../middleware/validate');

// POST /shorten
router.post('/shorten', validateUrl, (req, res) => {
  const { url } = req.body;
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

// GET /:code — redirect
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  const cacheKey = `url:${code}`;

  // Check Redis first
  const cached = await client.get(cacheKey);
  if (cached) {
    logClick(code, req.headers['user-agent']);
    return res.redirect(301, cached);
  }

  // Cache miss: hit the database
  const row = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });

  // Store in Redis with 1 hour TTL
  await client.setEx(cacheKey, 3600, row.original_url);

  logClick(code, req.headers['user-agent']);
  return res.redirect(301, row.original_url);
});

// GET /:code/stats
router.get('/:code/stats', (req, res) => {
  const { code } = req.params;

  const url = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(code);
  if (!url) return res.status(404).json({ error: 'Not found' });

  const clicks = db.prepare(`
    SELECT COUNT(*) as total_clicks,
           MAX(clicked_at) as last_clicked
    FROM clicks WHERE url_id = ?
  `).get(url.id);

  return res.json({
    short_code: code,
    short_url: `${process.env.BASE_URL}/${code}`,
    original_url: url.original_url,
    created_at: url.created_at,
    total_clicks: clicks.total_clicks,
    last_clicked: clicks.last_clicked,
  });
});

function logClick(code, userAgent) {
  const row = db.prepare('SELECT id FROM urls WHERE short_code = ?').get(code);
  if (row) {
    db.prepare(`
      INSERT INTO clicks (url_id, user_agent) VALUES (?, ?)
    `).run(row.id, userAgent || null);
  }
}

module.exports = router;