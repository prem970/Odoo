const { Pool } = require('pg');

let pool;

/**
 * Strictly lazy-loads the database pool at runtime.
 * This prevents Railpack from erroring during build.
 */
function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
      if (process.env.NODE_ENV === 'production') process.exit(-1);
    });
  }
  return pool;
}

module.exports = { getDb };
