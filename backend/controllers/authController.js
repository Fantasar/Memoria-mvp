// backend/controllers/authController.js
const authService = require('../services/authService');

/**
 * Contrôleur d'authentification.
 * Responsabilité : extraire les données de req, appeler authService, formater res.
 * Aucune logique métier ici — tout est délégué au service.
 */

/**
 * Gère les erreurs de façon uniforme pour tous les handlers de ce contrôleur
 * Distingue les erreurs métier (statusCode défini) des erreurs serveur inattendues
 * @param {Error} error
 * @param {Object} res
 * @param {string} fallbackMessage - Message générique si erreur serveur
 */
const handleError = (error, res, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code:    error.code,
        message: error.message
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code:    'SERVER_ERROR',
      message: fallbackMessage
    }
  });
};

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      data: {
        ...result,
        message: 'Inscription réussie'
      }
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de l\'inscription');
  }
};

/**
 * @desc    Connexion d'un utilisateur existant
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // La validation email/password est déjà assurée par le middleware validateLogin
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        message: 'Connexion réussie'
      }
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la connexion');
  }
};

module.exports = { register, login };