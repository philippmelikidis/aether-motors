const express = require("express");
const cors = require("cors");

const proxyRoutes = require("./routes/proxy.routes");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    service: "web-shop-backend",
    status: "ok",
    description: "API Gateway for Aether Motors Web Shop"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "web-shop-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/", proxyRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;