
const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  err.statusDesc = "NOT_FOUND";
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const statusDesc =
    err.statusDesc || (statusCode >= 400 && statusCode < 500 ? "FAILURE" : "ERROR");

  const response = {
    statusCode,
    statusDesc,
    path: req.originalUrl,
    message: err.message || "Internal Server Error",
    data: err.data || null,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  };

  console.error("❌ Error:", response);

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
