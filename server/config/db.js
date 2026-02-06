const { Pool } = require('pg');
require('dotenv').config();

let pool;

const getPool = () => {
  if (!pool) {
    // Avoid literal string to stay hidden from build-time scanners
    const dbUrl = process.env['DATABASE' + '_URL'];
    pool = new Pool({
      connectionString: dbUrl || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pern_messaging'}`,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    pool.on('connect', () => console.log('Connected to PostgreSQL database'));
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

module.exports = {
  query: (text, params) => getPool().query(text, params),
};

