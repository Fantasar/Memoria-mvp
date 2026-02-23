// backend/controllers/statsController.js
const statsService = require('../services/statsService');

/**
 * Contrôleur des statistiques.
 * Responsabilité : extraire les données de req, appeler statsService, formater res.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: fallbackMessage }
  });
};

/**
 * @desc    Récupère les statistiques globales de la plateforme
 * @route   GET /api/stats
 * @access  Admin uniquement
 */
const getPlatformStats = async (req, res) => {
  try {
    const stats = await statsService.getPlatformStats(req.user.userId);

    return res.status(200).json({
      success: true,
      data:    stats
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des statistiques');
  }
};

/**
 * @desc    Récupère les statistiques individuelles du prestataire connecté
 * @route   GET /api/stats/provider
 * @access  Prestataire uniquement
 */
const getProviderStats = async (req, res) => {
  try {
    const stats = await statsService.getProviderStats(req.user.userId, req.user.role);

    return res.status(200).json({
      success: true,
      data:    stats
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des statistiques prestataire');
  }
};

module.exports = {
  getPlatformStats,
  getProviderStats
};