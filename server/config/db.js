const { Pool } = require('pg');

let pool;

function initDb() {
  if (!pool) {
    // We access the env variable inside the function to ensure 
    // it's only touched at runtime when a query is actually made.
    const connectionString = process.env.DATABASE_URL;

    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}

module.exports = {
  query: (text, params) => initDb().query(text, params),
};
