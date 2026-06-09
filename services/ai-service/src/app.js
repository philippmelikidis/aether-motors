const express = require('express');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(express.json());
app.use('/', aiRoutes);

module.exports = app;
