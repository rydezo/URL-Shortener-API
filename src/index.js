require('dotenv').config();
const express = require('express');
const db = require('./db/database');
const urlRoutes = require('./routes/urls');
const { connect } = require('./db/cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', urlRoutes);

const start = async () => {
  await connect();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

app.get('/', (req, res) => {
  res.json({
    name: 'URL Shortener API',
    endpoints: {
      shorten: 'POST /shorten',
      redirect: 'GET /:code',
      stats: 'GET /:code/stats'
    }
  });
});

// error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

start();