const app = require('./src/app');
const { PORT, PRODUCT_SERVICE_URL, MEDIA_PUBLIC_URL } = require('./src/config');

app.listen(PORT, () => {
  console.log(`Configurator Service running on port ${PORT}`);
  console.log(`  PRODUCT_SERVICE_URL: ${PRODUCT_SERVICE_URL}`);
  console.log(`  MEDIA_PUBLIC_URL:    ${MEDIA_PUBLIC_URL}`);
});
