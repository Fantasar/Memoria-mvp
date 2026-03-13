const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool de connexions PostgreSQL.
 * En production (Render) : utilise DATABASE_URL
 * En local : utilise les variables séparées DB_HOST, DB_PORT, etc.
 */
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Requis par Render
      }
    : {
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
);

// Vérifie la connexion au démarrage et libère immédiatement le client
pool.connect((err, client, release) => {
  if (err) {
    console.error(' Erreur connexion PostgreSQL:', err.stack);
    return;
  }
  release();
  console.log(' Pool PostgreSQL initialisé');
});

module.exports = pool;