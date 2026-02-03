// backend/controllers/adminController.js
const authService = require('../services/authService');

/**
 * CONTROLLER : Orchestration admin
 */

/**
 * @desc    Créer un nouveau compte administrateur
 * @route   POST /api/admin/create
 * @access  Private (Admin only)
 */
const createAdmin = async (req, res) => {
  try {
    // Validation basique
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email et mot de passe sont obligatoires'
        }
      });
    }

    // Déléguer au service avec email du créateur
    const result = await authService.createAdminUser(
      req.body,
      req.user.email // Provient du middleware authenticateToken
    );

    // Formatter la réponse HTTP
    return res.status(201).json({
      success: true,
      data: {
        ...result,
        message: 'Compte administrateur créé avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création admin:', error);

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
        message: 'Erreur lors de la création du compte administrateur'
      }
    });
  }
};

module.exports = {
  createAdmin
};