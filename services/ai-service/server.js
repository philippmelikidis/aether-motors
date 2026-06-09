const app = require('./src/app');
const { PORT, MODEL_NAME, aiEnabled } = require('./src/config');

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`  GEMINI_MODEL: ${MODEL_NAME}`);
  console.log(`  AI enabled:   ${aiEnabled}`);
});
