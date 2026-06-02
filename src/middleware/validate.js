const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'URL must be a string' });
  }

  if (url.length > 2048) {
    return res.status(400).json({ error: 'URL too long' });
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'URL must start with http or https' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  next();
};

module.exports = { validateUrl };