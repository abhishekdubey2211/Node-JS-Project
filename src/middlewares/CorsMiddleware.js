require("dotenv").config();
// -------------------- CORS Configuration --------------------
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

const CORS_METHODS = process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS";

const CORS_ALLOWED_HEADERS = process.env.CORS_ALLOWED_HEADERS
  ? process.env.CORS_ALLOWED_HEADERS.split(",").map((h) => h.trim())
  : ["Content-Type", "Authorization"];

const CORS_EXPOSED_HEADERS = process.env.CORS_EXPOSED_HEADERS
  ? process.env.CORS_EXPOSED_HEADERS.split(",").map((h) => h.trim())
  : ["Content-Length", "X-Total-Count", "X-Correlation-Id"];

const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS === "true";
const CORS_PREFLIGHT_CONTINUE = false; // Express 5 should handle automatically
const CORS_OPTIONS_SUCCESS = parseInt(process.env.CORS_OPTIONS_SUCCESS || "204", 10);
const CORS_MAX_AGE = parseInt(process.env.CORS_MAX_AGE || "600", 10);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (
      CORS_ORIGINS.includes("*") ||
      CORS_ORIGINS.includes(origin) ||
      CORS_ORIGINS.some(
        (o) => o.startsWith("regex:") && new RegExp(o.replace("regex:", "")).test(origin)
      )
    ) {
      callback(null, true);
    } else {
      callback(null, false); // reject origin without throwing
    }
  },
  methods: CORS_METHODS,
  allowedHeaders: CORS_ALLOWED_HEADERS,
  exposedHeaders: CORS_EXPOSED_HEADERS,
  credentials: CORS_CREDENTIALS,
  preflightContinue: CORS_PREFLIGHT_CONTINUE,
  optionsSuccessStatus: CORS_OPTIONS_SUCCESS,
  maxAge: CORS_MAX_AGE,
};

module.exports = corsOptions;
