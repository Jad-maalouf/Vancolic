const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Supabase requires SSL; a local Postgres (e.g. for testing) typically
// doesn't support it at all, so only enable it for non-local hosts.
const isLocalHost = /(^|@)(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL);

// Small max pool size: on Netlify Functions each invocation is a short-lived,
// separate process, so there's no benefit to a large pool, and a big pool
// across many concurrent invocations can exhaust Supabase's connection limit.
// Use Supabase's pooled ("Transaction" mode, port 6543) connection string here.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 30_000,
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
