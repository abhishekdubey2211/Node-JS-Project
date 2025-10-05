// -------------------- Imports --------------------
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");
const corsOptions = require('./middlewares/CorsMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/GlobalErrorHandler');
const responseMiddleware = require('./middlewares/StandardResponseHandler');
const { initializeDatabase } = require('./connections/MySqlDBConnection');
const { auditorMiddleware } = require('./middlewares/AuditorMiddleware');
const logger = require('./utils/Logger').getLogger(__filename);
logger.info('🚀 Starting User Service...');


// Load environment variables
require('dotenv').config();

// -------------------- App Initialization --------------------
const app = express();

// -------------------- Initialize Database --------------------
initializeDatabase();
logger.info('--------------------Database initialized successfully.--------------------');

// -------------------- Middleware --------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(auditorMiddleware);   // 👈 plug it here

// -------------------- Logging --------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// -------------------- Response Middleware --------------------
app.use(responseMiddleware);

// -------------------- Routes --------------------
app.get('/api/version', (req, res) => {
  // logger.info(`Version route accessed by IP: ${req.ip}`);
  res.send('Welcome to User Service API').status(200);
});

app.use('/api/users', userRoutes);

// -------------------- 404 Middleware --------------------
app.use(notFoundHandler);

// -------------------- Global Error Middleware --------------------
app.use(errorHandler);

module.exports = app;
