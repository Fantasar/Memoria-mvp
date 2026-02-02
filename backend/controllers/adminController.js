// backend/controllers/adminController.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');

/**
 * @desc    Créer un nouveau compte administrateur
 * @route   POST /api/admin/create
 * @access  Private (Admin only)
 */
const createAdmin = async (req, res) => {
  const { email, password, prenom, nom } = req.body;

  try {
    // ============ VALIDATION BASIQUE ============
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email et mot de passe sont obligatoires'
        }
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Format email invalide'
        }
      });
    }

    // Validation password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Le mot de passe doit contenir au moins 8 caractères'
        }
      });
    }

    // ============ VÉRIFIER SI EMAIL EXISTE ============
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

    // ============ RÉCUPÉRER LE ROLE_ID ADMIN ============
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['admin']  // ← On cherche le rôle "admin"
    );

    if (roleResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'ROLE_NOT_FOUND',
          message: 'Rôle admin introuvable'
        }
      });
    }

    const adminRoleId = roleResult.rows[0].id;  // ← Récupère l'ID (devrait être 3)
    console.log('🔍 [ADMIN] Role ID récupéré:', adminRoleId, typeof adminRoleId);

    // ============ HASHER PASSWORD ============
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ============ CRÉER L'ADMIN ============
    const insertQuery = `
      INSERT INTO users (email, password_hash, role_id, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, email, role_id, created_at
    `;

    const insertResult = await pool.query(insertQuery, [email, hashedPassword, adminRoleId]);
    const newAdmin = insertResult.rows[0];

    // ============ LOG DE SÉCURITÉ ============
    console.log(`[SECURITY] Nouvel admin créé par ${req.user.email}:`, {
      new_admin_id: newAdmin.id,
      new_admin_email: newAdmin.email,
      created_by: req.user.email,
      created_at: new Date().toISOString()
    });

    // ============ RETOURNER LA RÉPONSE ============
    return res.status(201).json({
      success: true,
      data: {
        admin_id: newAdmin.id,
        email: newAdmin.email,
        role: 'admin',
        created_at: newAdmin.created_at,
        message: 'Compte administrateur créé avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création admin:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la création du compte administrateur'
      }
    });
  }
};

module.exports = {
  createAdmin
};