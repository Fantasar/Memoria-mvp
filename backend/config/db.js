const { Pool } = require('pg');
const { useInsertionEffect } = require('react');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,        // → 'localhost'
  port: process.env.DB_PORT,        // → 5432
  database: process.env.DB_NAME,    // → 'memoria_db'
  user: process.env.DB_USER,        // → 'memoria_user'
  password: process.env.DB_PASSWORD // → 'papy-thomas'
});

// Test de connexion
pool.connect((err, client, release) => {
    if(err) {
        return console.error('Erreur connexion PostgreSQL:', err.stack);
    }
    console.log('Connexion PostgreSQL réussie !');
    release();
});

module.exports = pool;