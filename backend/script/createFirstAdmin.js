// backend/scripts/createFirstAdmin.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const pool = require('../config/db');

const createFirstAdmin = async () => {
  try {
    const email = 'admin@memoria.com';
    const password = 'Admin2026!Memoria';

    // Vérifier si un admin existe déjà
    const existingAdmin = await pool.query(
      `SELECT u.id, u.email 
       FROM users u 
       INNER JOIN roles r ON u.role_id = r.id 
       WHERE r.name = 'admin'`
    );

    if (existingAdmin.rows.length > 0) {
      process.exit(0);
    }

    // ============ RÉCUPÉRER LE ROLE_ID ADMIN ============
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['admin']
    );

    if (roleResult.rows.length === 0) {

      process.exit(1);
    }

    const adminRoleId = roleResult.rows[0].id;
    console.log('🔍 Role ID admin récupéré:', adminRoleId);

    // ============ HASHER LE MOT DE PASSE ============
    const hashedPassword = await bcrypt.hash(password, 10);

    // ============ CRÉER LE PREMIER ADMIN ============
    const insertQuery = `
      INSERT INTO users (email, password_hash, role_id, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, email, role_id, created_at
    `;
    //                                 ^^^^^^^ role_id (INTEGER)

    console.log('🔍 Insertion avec role_id:', adminRoleId);

    const result = await pool.query(insertQuery, [
      email,
      hashedPassword,
      adminRoleId  // ← NOMBRE, pas "admin"
    ]);

    const admin = result.rows[0];

    console.log('\n✅ Premier compte administrateur créé avec succès!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('🆔 ID:', admin.id);
    console.log('📅 Créé le:', admin.created_at);
    console.log('\n⚠️  SÉCURITÉ: Changez ce mot de passe après la première connexion!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la création du premier admin:', error);
    process.exit(1);
  }
};

createFirstAdmin();