const mysql = require('mysql2/promise');

const fs = require('fs');

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SSL_CA) {
  const caPath = process.env.DB_SSL_CA;
  if (fs.existsSync(caPath)) {
    dbConfig.ssl = { ca: fs.readFileSync(caPath) };
  } else {
    console.warn(`DB_SSL_CA file not found: ${caPath}. Using SSL without CA verification.`);
    dbConfig.ssl = { rejectUnauthorized: false };
  }
} else if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'required') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
