const express = require('express');
const roadmapRoutes = require('./routes/roadmap.routes');

const app = express();

app.use(express.json());
app.use('/', roadmapRoutes);

module.exports = app;
