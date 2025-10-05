// middlewares/responseMiddleware.js
const { getLogger } = require("../utils/Logger");
const logger = getLogger(__filename);

/**
 * Standard response middleware
 * Usage: attach `res.sendResponse(data, message, statusCode)` in controllers
 */
const responseMiddleware = (req, res, next) => {
  /**
   * Send a standard success response
   * @param {any} data - Response data
   * @param {string} [message] - Optional message
   * @param {number} [statusCode] - HTTP status code (default 200)
   */
  res.sendResponse = (data, message, statusCode = 200) => {
    const response = {
      statusCode,
      statusDesc: "SUCCESS",
      path: req.originalUrl,
      data: data !== undefined ? data : null,
      timestamp: new Date().toISOString(),
    };

    // Only add message if provided
    if (message) {
      response.message = message;
    }

    // Log the response (optional)
    // logger.info(
      // `Response sent for ${req.method} ${req.originalUrl}: ${JSON.stringify(response)}`
    // );

    return res.status(statusCode).json(response);
  };

  next();
};

module.exports = responseMiddleware;
