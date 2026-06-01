const { client } = require('../db/cache');
const express = require('express');
const router = express.Router();

// GET /:code — redirect
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  const cacheKey = `url:${code}`;

  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    logClick(code);               // still track the click
    return res.redirect(301, cached);
  }

  // Cache miss: hit the database
  const row = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });

  // Store in Redis with 1 hour TTL
  await client.setEx(cacheKey, 3600, row.original_url);

  logClick(code);
  return res.redirect(301, row.original_url);
});

// Delete
router.delete('/:code', async (req, res) => {
  const { code } = req.params;

  const row = db.prepare('SELECT id FROM urls WHERE short_code = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });

  db.prepare('DELETE FROM urls WHERE short_code = ?').run(code);
  await client.del(`url:${code}`);   // remove from cache

  res.json({ message: 'Deleted' });
});

module.exports = router;