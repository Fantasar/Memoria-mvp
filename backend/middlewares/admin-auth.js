// backend/middlewares/admin-auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Middleware d'authentification JWT.
 * Vérifie la validité du token et attache les infos utilisateur à req.user.
 * Doit être placé en premier sur toutes les routes protégées.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format attendu : "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token d\'authentification manquant'
        }
      });
    }

    // Décode et vérifie la signature du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifie que l'utilisateur existe toujours en base de données
    const userResult = await pool.query(
      `SELECT u.id, u.email, r.name as role
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur non trouvé'
        }
      });
    }

    // Attache les infos utilisateur à la requête pour les couches suivantes
    req.user = {
      userId: userResult.rows[0].id,
      email:  userResult.rows[0].email,
      role:   userResult.rows[0].role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token invalide' }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token expiré, veuillez vous reconnecter' }
      });
    }

    console.error('❌ Erreur middleware authenticateToken:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'authentification' }
    });
  }
};

/**
 * Middleware de restriction au rôle admin.
 * Doit obligatoirement être utilisé APRÈS authenticateToken dans la chaîne de middlewares.
 */
const authenticateAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentification requise' }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' }
    });
  }

  next();
};

module.exports = { authenticateToken, authenticateAdmin };