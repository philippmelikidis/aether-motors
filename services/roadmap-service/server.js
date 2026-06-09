const app = require('./src/app');
const { PORT } = require('./src/config');
const { ensurePresentationRoute } = require('./src/services/presentation.service');

ensurePresentationRoute().catch(() => null);

app.listen(PORT, () => {
  console.log(`Roadmap Service running on port ${PORT}`);
});
