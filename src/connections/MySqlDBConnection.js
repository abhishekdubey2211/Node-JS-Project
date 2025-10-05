// config/db.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");
const { DataSource } = require("typeorm");
const path = require("path");
const logger = require("../utils/Logger").getLogger(__filename);

// -------------------- Config --------------------
const maxRetries = parseInt(process.env.DB_RETRY_COUNT, 10) || 5;
const retryDelay = (parseInt(process.env.DB_RETRY_DELAY, 10) || 2) * 1000; // ms
const isProd = process.env.NODE_ENV === "production";

let connection; // mysql2 connection
let typeorm; // TypeORM datasource

// -------------------- MySQL2 --------------------
const connectWithRetry = async (retries = maxRetries) => {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
    });
    logger.info("✅ MySQL2 connected successfully!");
    return connection;
  } catch (error) {
    logger.error(
      `❌ MySQL2 connection failed. Retries left: ${retries} - ${error.message}`
    );
    if (retries > 0) {
      logger.warn(`⏳ Retrying in ${retryDelay / 1000}s...`);
      await new Promise((res) => setTimeout(res, retryDelay));
      return connectWithRetry(retries - 1);
    }
    process.exit(1);
  }
};

const getConnection = async () => {
  try {
    if (!connection) await connectWithRetry();
    await connection.ping();
    return connection;
  } catch (error) {
    logger.warn("⚠️ MySQL2 connection lost. Reconnecting...");
    await connectWithRetry();
    return connection;
  }
};

// -------------------- Sequelize --------------------
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: process.env.SEQUELIZE_LOGGING === "true" ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

const connectWithRetrySequelize = async (
  retries = maxRetries,
  delay = retryDelay
) => {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info("✅ Sequelize connected successfully.");
      return sequelize;
    } catch (err) {
      retries -= 1;
      logger.error(`❌ Sequelize connection failed: ${err.message}`);
      if (retries === 0) throw err;
      logger.warn(
        `🔄 Retrying in ${delay / 1000}s... (${retries} retries left)`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// -------------------- TypeORM --------------------
const typeormDataSource = new DataSource({
  type: "mysql", // change to 'postgres' if needed
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 3306, // 5432 if postgres
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "test",
  synchronize: !isProd, // Only auto-create tables in dev
  dropSchema: !isProd, // only in dev
  logging: process.env.TYPEORM_LOGGING === "true",
  entities: [path.join(__dirname, "../models/*.js")],
  subscribers: [],
  migrations: [],
});

const connectWithRetryTypeORM = async (
  retries = maxRetries,
  delay = retryDelay
) => {
  while (retries > 0) {
    try {
      await typeormDataSource.initialize();
      logger.info("✅ TypeORM connected successfully.");
      typeorm = typeormDataSource;
      return typeorm;
    } catch (err) {
      retries -= 1;
      logger.error(`❌ TypeORM connection failed: ${err.message}`);
      if (retries === 0) throw err;
      logger.warn(
        `🔄 Retrying in ${delay / 1000}s... (${retries} retries left)`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// -------------------- Unified Initialization --------------------
async function initializeDatabase() {
  try {
    const dbChoice = (process.env.DB_CLIENT || "sequelize").toLowerCase();

    if (dbChoice === "mysql2") {
      await connectWithRetry();
      const conn = await getConnection();
      const [rows] = await conn.query("SELECT NOW() AS currentTime");
      logger.info(`🕒 Current MySQL2 Time: ${rows[0].currentTime}`);
    } else if (dbChoice === "sequelize") {
      await connectWithRetrySequelize();
      await sequelize.sync({ alter: true }); // alter: true keeps existing tables safe
      logger.info("✅ Sequelize models synchronized.");
    } else if (dbChoice === "typeorm") {
      await connectWithRetryTypeORM();
    } else {
      logger.error(`❌ Unknown DB_CLIENT: ${dbChoice}`);
      process.exit(1);
    }
  } catch (err) {
    logger.error("❌ Database initialization failed", err);
    process.exit(1);
  }
}

// -------------------- Exports --------------------
module.exports = {
  connectWithRetry,
  getConnection,
  sequelize,
  connectWithRetrySequelize,
  typeormDataSource,
  connectWithRetryTypeORM,
  initializeDatabase,
};
