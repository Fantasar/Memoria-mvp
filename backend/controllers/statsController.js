const statsService = require('../services/statsService');

/**
 * @desc    Récupérer les statistiques de la plateforme
 * @route   GET /api/stats
 * @access  Private (Admin uniquement)
 */
const getPlatformStats = async (req, res) => {
  try {
    const stats = await statsService.getPlatformStats(req.user.userId);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération stats:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des statistiques'
      }
    });
  }
};

/**
 * @desc    Récupérer les statistiques d'un prestataire
 * @route   GET /api/stats/provider
 * @access  Private (Prestataire uniquement)
 */
const getProviderStats = async (req, res) => {
  try {
    const stats = await statsService.getProviderStats(req.user.userId, req.user.role);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération stats prestataire:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des statistiques'
      }
    });
  }
};

module.exports = {
  getPlatformStats,
  getProviderStats
};