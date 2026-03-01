// backend/scripts/seed-users.js
// ============================================================
// Seed des 3 profils de test — client, prestataire, admin
// Les credentials sont lus depuis le .env (jamais en dur)
// Usage : node scripts/seed-users.js
// ============================================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool   = require('../config/db');

const users = [
  {
    prenom:            'Client',
    nom:               'Test',
    email:             process.env.SEED_CLIENT_EMAIL,
    password:          process.env.SEED_CLIENT_PASSWORD,
    role_id:           1,
    is_verified:       true,
    telephone:         '0600000001',
    siret:             null,
    zone_intervention: null
  },
  {
    prenom:            'Prestataire',
    nom:               'Test',
    email:             process.env.SEED_PROVIDER_EMAIL,
    password:          process.env.SEED_PROVIDER_PASSWORD,
    role_id:           2,
    is_verified:       true,
    telephone:         '0600000002',
    siret:             '12345678901234',
    zone_intervention: 'Gironde'
  },
  {
    prenom:            'Admin',
    nom:               'Mémoria',
    email:             process.env.SEED_ADMIN_EMAIL,
    password:          process.env.SEED_ADMIN_PASSWORD,
    role_id:           3,
    is_verified:       true,
    telephone:         '0600000003',
    siret:             null,
    zone_intervention: null
  }
];

const run = async () => {
  console.log('🌱 Démarrage du seed utilisateurs...\n');

  // Vérifie que toutes les variables d'environnement sont définies
  const requiredEnvVars = [
    'SEED_CLIENT_EMAIL',   'SEED_CLIENT_PASSWORD',
    'SEED_PROVIDER_EMAIL', 'SEED_PROVIDER_PASSWORD',
    'SEED_ADMIN_EMAIL',    'SEED_ADMIN_PASSWORD'
  ];

  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Variables manquantes dans le .env :', missing.join(', '));
    process.exit(1);
  }

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO users
        (prenom, nom, email, password_hash, role_id, is_verified, siret, zone_intervention, telephone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      [
        user.prenom,
        user.nom,
        user.email,
        password_hash,
        user.role_id,
        user.is_verified,
        user.siret,
        user.zone_intervention,
        user.telephone
      ]
    );

    const roleLabel = { 1: 'client', 2: 'prestataire', 3: 'admin' }[user.role_id];
    console.log(`✅ ${roleLabel.padEnd(12)} — ${user.email}`);
  }

  console.log('\n✅ Seed terminé.');
  await pool.end();
};

run().catch(err => {
  console.error('❌ Erreur seed :', err.message);
  process.exit(1);
});