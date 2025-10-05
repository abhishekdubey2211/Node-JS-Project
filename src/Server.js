require('dotenv').config(); // Load env first
const app = require('./Index');
const logger = require('./utils/Logger').getLogger(__filename);

/**
 * Start the HTTP server
 */
function startServer() {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running at http://localhost:${PORT}`);
  });
}

/**
 * Bootstrap function
 */
async function bootstrap() {
  startServer();
}

// Run bootstrap
bootstrap();
