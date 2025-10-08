const { v4: uuidv4 } = require("uuid");
const os = require("os");
const { getLogger } = require("../utils/Logger");
const logger = getLogger(__filename);

// ---------------- Helper: Generate timestamp-only requestId ----------------
const getTimestampPrefix = () => {
  const now = new Date();
  const pad = (n, width = 2) => n.toString().padStart(width, "0");

  const dd = pad(now.getDate());
  const MM = pad(now.getMonth() + 1);
  const yy = pad(now.getFullYear() % 100);
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const SSSS = pad(now.getMilliseconds(), 3);
  return `${dd}${MM}${yy}${HH}${mm}${ss}${SSSS}`;
};

// ---------------- Helper: Get client IP ----------------
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] || // if behind a proxy
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip
  );
}

const ipRange = (ip, mask = 24) => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return null;
  const maskBits = 32 - mask;
  const network = parts
    .map((octet, i) => {
      if (i === 3) return octet & ~((1 << maskBits) - 1);
      return octet;
    })
    .join(".");
  return network + `/${mask}`;
};

// ---------------- Read sensitive fields from env ----------------
const SENSITIVE_FIELDS = process.env.SENSITIVE_FIELDS
  ? process.env.SENSITIVE_FIELDS.split(",").map((f) => f.trim())
  : ["password", "pwd", "token", "auth"];

const maskSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const clone = { ...obj };
  SENSITIVE_FIELDS.forEach((key) => {
    if (clone[key] !== undefined) clone[key] = "***masked***";
  });
  return clone;
};

// ---------------- Helper: Get unique MAC addresses ----------------
const getMacAddresses = () => {
  const interfaces = os.networkInterfaces();
  const macs = new Set(); // use Set to remove duplicates

  Object.values(interfaces).forEach((ints) => {
    ints.forEach((i) => {
      if (i.mac && i.mac !== "00:00:00:00:00:00") macs.add(i.mac);
    });
  });

  return Array.from(macs); // convert back to array
};

// ---------------- Auditor Middleware ----------------
const auditorMiddleware = (req, res, next) => {
  try {
    // Ignore Chrome DevTools or other unwanted well-known requests
    const ignoredPaths = [/^\/\.well-known\/appspecific\/.*$/i];

    if (ignoredPaths.some((pattern) => pattern.test(req.originalUrl))) {
      return res.status(404).end();
    }

    // ---------------- Generate Request ID ----------------
    const requestId = req.headers["x-request-id"] || getTimestampPrefix();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    // ---------------- Inject requestId into body ----------------
    if (!req.body || typeof req.body !== "object") {
      req.body = {};
    }
    if (!req.body.requestId) {
      req.body.requestId = requestId;
    }

    // ---------------- Capture request received time ----------------
    const requestReceivedTime = new Date();
    req.requestReceivedTime = requestReceivedTime.toISOString();
    const start = Date.now();

    // ---------------- Async log incoming request ----------------
    (async () => {
      let ip = getClientIP(req);
      if (ip === "::1") ip = "127.0.0.1";

      try {
        const requestLog = {
          requestId,
          sessionId: req.headers.sessionid ? req.headers.sessionid : "", 
          requestReceivedTime: req.requestReceivedTime,
          method: req.method,
          url: req.originalUrl,
          headers: maskSensitive(req.headers),
          query: req.query,
          body: maskSensitive(req.body),
          ip: ip,
          ipSubnet: ipRange(ip),
          macAddress: getMacAddresses(),
          userAgent: req.headers["user-agent"],
          protocol: req.protocol,
          referrerOrOrigin: req.get("Referrer") || req.get("Origin") || "",
        };
        await logger.info(`➡️ Incoming Request: ${JSON.stringify(requestLog)}`);
      } catch (err) {
        console.error("Failed to log request:", err);
      }
    })();

    // ---------------- Capture response body ----------------
    let oldSend = res.send;
    let responseBody;
    res.send = function (data) {
      responseBody = data;
      return oldSend.apply(res, arguments);
    };

    // ---------------- Async log response on finish ----------------
    res.on("finish", async () => {
      try {
        const duration = Date.now() - start;
        const responseLog = {
          requestId,
          sessionId: req.headers.sessionid ? req.headers.sessionid : "", 
          status: res.statusCode < 400 ? "SUCCESS" : "ERROR",
          statusCode: res.statusCode,
          response: maskSensitive(responseBody),
          processingTimeMs: duration,
        };
        await logger.info(
          `⬅️ Completed Request: ${JSON.stringify(responseLog)}`
        );
      } catch (err) {
        console.error("Failed to log response:", err);
      }
    });
  } catch (err) {
    console.error("Auditor Middleware Error:", err);
  }
  next();
};
module.exports = { auditorMiddleware, getTimestampPrefix };
