// utils/jwtUtil.js
const jwt = require("jsonwebtoken");
const { getLogger } = require("./logger");
const logger = getLogger(__filename);

// Default JWT configuration from environment
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_ALGO = process.env.JWT_ALGO || "HS256"; // default algorithm
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h"; // default expiry

class JWTUtil {
  /**
   * Generate a JWT token
   * @param {Object} payload - Data to include in the token
   * @param {String} [expiresIn] - Optional token expiry override
   * @param {String} [algorithm] - Optional signing algorithm override
   * @returns {String} JWT token
   */
  static generateToken(payload, expiresIn = JWT_EXPIRY, algorithm = JWT_ALGO) {
    try {
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn, algorithm });
      logger.info(`JWT generated (alg: ${algorithm}) for payload: ${JSON.stringify(payload)}`);
      return token;
    } catch (err) {
      logger.error(`Error generating JWT: ${err.message}`);
      throw err;
    }
  }

  /**
   * Verify a JWT token
   * @param {String} token - JWT token
   * @param {String} [algorithm] - Optional algorithm override
   * @returns {Object} Decoded payload
   */
  static verifyToken(token, algorithm = JWT_ALGO) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [algorithm] });
      logger.info(`JWT verified successfully (alg: ${algorithm}).`);
      return decoded;
    } catch (err) {
      logger.warn(`JWT verification failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Decode JWT without verifying
   * @param {String} token
   * @returns {Object} decoded token
   */
  static decodeToken(token) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      logger.info(`JWT decoded successfully.`);
      return decoded;
    } catch (err) {
      logger.error(`JWT decode failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get payload only
   * @param {String} token
   * @returns {Object|null} payload
   */
  static getPayload(token) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.payload : null;
  }

  /**
   * Check if token is expired
   * @param {String} token
   * @returns {Boolean}
   */
  static isExpired(token) {
    const payload = this.getPayload(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Get issued-at timestamp
   * @param {String} token
   * @returns {Number|null} iat
   */
  static getIssuedAt(token) {
    const payload = this.getPayload(token);
    return payload ? payload.iat : null;
  }

  /**
   * Get expiration timestamp
   * @param {String} token
   * @returns {Number|null} exp
   */
  static getExpiration(token) {
    const payload = this.getPayload(token);
    return payload ? payload.exp : null;
  }

  /**
   * Get algorithm used in token
   * @param {String} token
   * @returns {String|null} algorithm
   */
  static getAlgorithm(token) {
    const decoded = this.decodeToken(token);
    return decoded && decoded.header ? decoded.header.alg : null;
  }

  /**
   * Extract JWT token from Express request
   * @param {Object} req - Express request object
   * @returns {String|null} token
   */
  static extractToken(req) {
    // 1️⃣ Authorization header
    if (req.headers?.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        return parts[1];
      }
    }

    // 2️⃣ Query parameter
    if (req.query?.token) return req.query.token;

    // 3️⃣ Cookies
    if (req.cookies?.token) return req.cookies.token;

    return null; // token not found
  }
}

module.exports = JWTUtil;
