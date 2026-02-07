const { Pool } = require('pg');

let pool;

/**
 * Strictly lazy-loads the database pool at runtime.
 * This prevents Railpack from erroring during build.
 */
function getDb() {
  if (!pool) {
    // Priority 1: Use full connection URL if available
    let connectionString =
      process.env.DATABASE_PUBLIC_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;

    // Priority 2: Construct from individual variables (Railway format: PGHOST)
    if (!connectionString && process.env.PGHOST) {
      connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;
    }

    // Priority 3: Construct from local variables (Local format: DB_HOST)
    if (!connectionString && process.env.DB_HOST) {
      connectionString = `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;
    }

    if (!connectionString) {
      console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('POSTGRES') || k.includes('PG')));
      throw new Error('Database configuration missing. Please check your .env file or Railway variables.');
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('railway') || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    });

    // Logging to verify connection target
    const dbHost = connectionString.split('@')[1]?.split(':')[0] || 'localhost';
    console.log(`📡 Database connecting to: ${dbHost}`);

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

module.exports = { getDb };
