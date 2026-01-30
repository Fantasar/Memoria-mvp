// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const register = async (req, res) => {
  const { email, password, role, zone_intervention, siret } = req.body;

  try {
    // ============ ÉTAPE 1 : Vérifier si email existe déjà ============
    const emailCheckQuery = 'SELECT id FROM users WHERE email = $1';
    const emailCheckResult = await pool.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Cet email est déjà utilisé'
        }
      });
    }

    // ============ NOUVEAU : Récupérer le role_id depuis la table roles ============
    const roleQuery = 'SELECT id FROM roles WHERE name = $1';
    const roleResult = await pool.query(roleQuery, [role]);

    if (roleResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Rôle invalide'
        }
      });
    }

    const role_id = roleResult.rows[0].id;

    // ============ ÉTAPE 2 : Hasher le mot de passe ============
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ============ ÉTAPE 3 : Insérer l'utilisateur avec role_id ============
    const insertQuery = `
      INSERT INTO users (email, password_hash, role_id, zone_intervention, siret, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, email, role_id, zone_intervention, siret, created_at
    `;

    const insertValues = [
      email,
      hashedPassword,
      role_id,
      zone_intervention || null,
      siret || null
    ];

    const insertResult = await pool.query(insertQuery, insertValues);
    const newUser = insertResult.rows[0];

    // ============ ÉTAPE 4 : Récupérer le nom du rôle pour la réponse ============
    const roleNameQuery = 'SELECT name FROM roles WHERE id = $1';
    const roleNameResult = await pool.query(roleNameQuery, [newUser.role_id]);
    const roleName = roleNameResult.rows[0].name;

    // ============ ÉTAPE 5 : Retourner la réponse ============
    return res.status(201).json({
      success: true,
      data: {
        user_id: newUser.id,
        email: newUser.email,
        role: roleName,
        zone_intervention: newUser.zone_intervention,
        siret: newUser.siret,
        created_at: newUser.created_at,
        message: 'Inscription réussie'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'inscription'
      }
    });
  }
};

const login = async (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Endpoint login pas encore implémenté'
    }
  });
};

module.exports = { register, login };