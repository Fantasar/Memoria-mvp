// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Middleware pour vérifier qu'un utilisateur est authentifié
 * Extrait le token JWT du header Authorization
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token d\'authentification manquant'
        }
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours en base
    const userQuery = 'SELECT id, email, role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur non trouvé'
        }
      });
    }

    // Attacher les infos user à la requête pour les middlewares suivants
    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role
    };

    next(); // Passer au middleware suivant

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token invalide'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expiré, veuillez vous reconnecter'
        }
      });
    }

    console.error('Erreur authentification:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'authentification'
      }
    });
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur authentifié est Admin
 * DOIT être utilisé APRÈS authenticateToken
 */
const authenticateAdmin = (req, res, next) => {
  // authenticateToken a déjà attaché req.user
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentification requise'
      }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux administrateurs'
      }
    });
  }

  next(); // L'utilisateur est bien admin, on continue
};

module.exports = {
  authenticateToken,
  authenticateAdmin
};