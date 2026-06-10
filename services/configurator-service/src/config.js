const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3008;

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

const MEDIA_PUBLIC_URL =
  process.env.MEDIA_PUBLIC_URL || 'http://localhost:9000/aether-images';

const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 4000;
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS) || 60 * 1000;

module.exports = {
  PORT,
  PRODUCT_SERVICE_URL,
  MEDIA_PUBLIC_URL,
  REQUEST_TIMEOUT_MS,
  CACHE_TTL_MS,
};
