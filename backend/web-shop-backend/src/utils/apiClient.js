const axios = require("axios");

function createApiClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

module.exports = createApiClient;