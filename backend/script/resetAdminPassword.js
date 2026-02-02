// backend/scripts/resetAdminPassword.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const pool = require('../config/db');

const resetAdminPassword = async () => {
  const newPassword = 'Admin2026!Memoria';
  
  try {
    console.log('🔧 Réinitialisation du mot de passe admin...');
    
    // ============ ÉTAPE 1 : Vérifier que l'admin existe ============
    const checkQuery = `
      SELECT u.id, u.email
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = 'admin@memoria.com' AND r.name = 'admin'
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Admin non trouvé avec cet email');
      await pool.end();
      process.exit(1);
    }
    
    console.log('✅ Admin trouvé:', checkResult.rows[0].email);
    
    // ============ ÉTAPE 2 : Hasher le nouveau mot de passe ============
    console.log('🔐 Hashage du nouveau mot de passe...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Hash généré:', hashedPassword.substring(0, 20) + '...');
    
    // ============ ÉTAPE 3 : Mettre à jour le mot de passe ============
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'admin@memoria.com'
      RETURNING id, email
    `;
    
    const result = await pool.query(updateQuery, [hashedPassword]);
    
    console.log('\n✅ Mot de passe admin réinitialisé avec succès !');
    console.log('📧 Email:', result.rows[0].email);
    console.log('🔑 Nouveau mot de passe:', newPassword);
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
};

resetAdminPassword();