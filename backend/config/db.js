const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool de connexions PostgreSQL.
 * Réutilise les connexions existantes pour optimiser les performances.
 * Toutes les variables de connexion sont chargées depuis le fichier .env
 */
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Vérifie la connexion au démarrage et libère immédiatement le client
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err.stack);
    return;
  }
  release();
  console.log('✅ Pool PostgreSQL initialisé');
});

module.exports = pool;