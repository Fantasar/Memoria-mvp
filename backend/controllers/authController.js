// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
  const { email, password } = req.body;

  try {
    // ============ ÉTAPE 1 : VALIDATION DES DONNÉES ============
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email et mot de passe sont obligatoires'
        }
      });
    }

    // ============ ÉTAPE 2 : VÉRIFIER SI L'UTILISATEUR EXISTE ============
    const userQuery = `
      SELECT 
        u.id, 
        u.email, 
        u.password_hash, 
        r.name as role,
        u.zone_intervention, 
        u.siret 
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Message générique pour ne pas révéler si l'email existe
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect'
        }
      });
    }

    const user = userResult.rows[0];

    // ============ ÉTAPE 3 : VÉRIFIER LE MOT DE PASSE ============
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect'
        }
      });
    }

    // ============ ÉTAPE 4 : GÉNÉRER LE TOKEN JWT ============
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // ============ ÉTAPE 5 : RETOURNER LA RÉPONSE ============
    return res.status(200).json({
      success: true,
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          zone_intervention: user.zone_intervention,
          siret: user.siret
        },
        message: 'Connexion réussie'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la connexion'
      }
    });
  }
};

module.exports = { register, login };