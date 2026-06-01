require('dotenv').config();
const express = require('express');
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

start();