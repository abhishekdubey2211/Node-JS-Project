// utils/logger.js
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// -------------------- Load configuration from .env --------------------
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "../../logs");
const LOG_FILE_BASENAME = process.env.LOG_FILE_NAME || "combined";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_ROTATION = process.env.LOG_ROTATION || "daily"; // hourly | daily | weekly | monthly | yearly
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || "30"; // retention
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || "20m"; // max size per file
const LOG_TIMESTAMP_FORMAT = process.env.LOG_TIMESTAMP_FORMAT || "YYYY-MM-DD HH:mm:ss.SSSS";

// -------------------- Ensure log directory exists --------------------
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// -------------------- Map rotation options → date patterns --------------------
const rotationPatterns = {
  hourly: "YYYY-MM-DD-HH",
  daily: "YYYY-MM-DD",
  weekly: "YYYY-ww", // ISO week
  monthly: "YYYY-MM",
  yearly: "YYYY",
};
const datePattern = rotationPatterns[LOG_ROTATION] || rotationPatterns.daily;

// -------------------- Helper: Get caller file + line number --------------------
const getCallerInfo = () => {
  const stack = new Error().stack.split("\n");
  // Stack format varies, usually 3rd or 4th line is the caller
  const callerLine = stack[3] || stack[2]; 
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
  if (match) {
    return { file: path.basename(match[1]), line: match[2] };
  }
  return {};
};

// -------------------- Custom log format --------------------
const logFormat = format.combine(
  format.timestamp({ format: LOG_TIMESTAMP_FORMAT }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, packageName, line }) => {
    const pkg = packageName ? `${packageName}` : "";
    const lineInfo = line ? `-${line}` : "";
    return stack
      ? `${timestamp} [${level.toUpperCase()}] [${pkg}${lineInfo}] ${message} - ${stack}`
      : `${timestamp} [${level.toUpperCase()}] [${pkg}${lineInfo}] ${message}`;
  })
);

// -------------------- Base Winston logger --------------------
const baseLogger = createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports: [
    new transports.Console(), // Console logging
    new DailyRotateFile({
      filename: path.join(LOG_DIR, `${LOG_FILE_BASENAME}-%DATE%.log`),
      datePattern,
      zippedArchive: true,
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

// -------------------- Factory function like Java SLF4J logger --------------------
const getLogger = (filename) => {
  const packageName = path.basename(filename);
  const wrap = (level) => (msg) => {
    const { line } = getCallerInfo(); // Get caller line number dynamically
    baseLogger[level]({ message: msg, packageName, line });
  };
  return {
    query: wrap("info"),
    info: wrap("info"),
    warn: wrap("warn"),
    error: wrap("error"),
    debug: wrap("debug"),
  };
};
// -------------------- Graceful shutdown --------------------
process.on("beforeExit", async () => {
  baseLogger.end();
  await new Promise((resolve) => baseLogger.on("finish", resolve));
});

// -------------------- Export --------------------
module.exports = { getLogger };
