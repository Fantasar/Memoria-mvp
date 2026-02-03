// backend/controllers/authController.js
const authService = require('../services/authService');

/**
 * CONTROLLER : Orchestration des requêtes/réponses HTTP
 * Responsabilité : Recevoir req, appeler service, formatter res
 */

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Déléguer la logique au service
    const result = await authService.registerUser(req.body);

    // Formatter la réponse HTTP
    return res.status(201).json({
      success: true,
      data: {
        ...result,
        message: 'Inscription réussie'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);

    // Gestion des erreurs métier
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    // Erreur serveur inattendue
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'inscription'
      }
    });
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Validation basique (peut être faite en middleware)
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email et mot de passe sont obligatoires'
        }
      });
    }

    // Déléguer la logique au service
    const result = await authService.loginUser(req.body);

    // Formatter la réponse HTTP
    return res.status(200).json({
      success: true,
      data: {
        ...result,
        message: 'Connexion réussie'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);

    // Gestion des erreurs métier
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    // Erreur serveur inattendue
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