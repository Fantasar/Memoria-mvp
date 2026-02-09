// backend/controllers/cemeteryController.js
const cemeteryRepository = require('../repositories/cemeteryRepository');

/**
 * CONTROLLER : Gestion des cimetières
 * Responsabilité : Recevoir req, appeler repository, formatter res
 */

/**
 * @desc    Récupérer tous les cimetières actifs
 * @route   GET /api/cemeteries
 * @access  Public (ou Private selon ton choix)
 */
const getAllCemeteries = async (req, res) => {
  try {
    const cemeteries = await cemeteryRepository.findAllActive();

    return res.status(200).json({
      success: true,
      data: cemeteries,
      count: cemeteries.length
    });

  } catch (error) {
    console.error('Erreur récupération cimetières:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des cimetières'
      }
    });
  }
};

module.exports = {
  getAllCemeteries
};