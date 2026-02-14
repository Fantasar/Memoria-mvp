const providerService = require('../services/providerService');

/**
 * @desc    Récupérer les prestataires en attente
 * @route   GET /api/providers/pending
 * @access  Private (Admin uniquement)
 */
const getPendingProviders = async (req, res) => {
  try {
    const providers = await providerService.getPendingProviders(req.user.userId);

    return res.status(200).json({
      success: true,
      data: providers,
      count: providers.length
    });

  } catch (error) {
    console.error('Erreur récupération prestataires:', error);

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
        message: 'Erreur lors de la récupération des prestataires'
      }
    });
  }
};

/**
 * @desc    Valider un prestataire
 * @route   PATCH /api/providers/:id/approve
 * @access  Private (Admin uniquement)
 */
const approveProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const result = await providerService.approveProvider(providerId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Prestataire validé avec succès'
    });

  } catch (error) {
    console.error('Erreur validation prestataire:', error);

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
        message: 'Erreur lors de la validation'
      }
    });
  }
};

/**
 * @desc    Rejeter un prestataire
 * @route   PATCH /api/providers/:id/reject
 * @access  Private (Admin uniquement)
 */
const rejectProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    const result = await providerService.rejectProvider(providerId, req.user.userId, reason);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Prestataire rejeté'
    });

  } catch (error) {
    console.error('Erreur rejet prestataire:', error);

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
        message: 'Erreur lors du rejet'
      }
    });
  }
};

module.exports = {
  getPendingProviders,
  approveProvider,
  rejectProvider
};