const { Pool } = require('pg');

let pool;

/**
 * Strictly lazy-loads the database pool at runtime.
 * This prevents Railpack from erroring during build.
 */
function getDb() {
  if (!pool) {
    // Priority: Public URL > Private URL > Individual PG vars
    let connectionString =
      process.env.DATABASE_PUBLIC_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;

    // If no URL exists, try to construct one from individual Railway variables
    if (!connectionString && process.env.PGHOST) {
      connectionString = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;
    }

    if (!connectionString) {
      console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('POSTGRES') || k.includes('PG')));
      throw new Error('DATABASE_URL environment variable is not set. Please link your Postgres service in Railway Variables.');
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('railway') || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

module.exports = { getDb };
