// backend/controllers/cemeteryController.js
const cemeteryService = require('../services/cemeteryService');

/**
 * Contrôleur des cimetières.
 * Responsabilité : extraire les données de req, appeler cemeteryService, formater res.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  // Contrainte d'unicité PostgreSQL (nom + ville déjà existants)
  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code:    'DUPLICATE_CEMETERY',
        message: 'Ce cimetière existe déjà dans cette ville'
      }
    });
  }

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
 * @desc    Récupère tous les cimetières actifs
 * @route   GET /api/cemeteries
 * @access  Private (authentifié)
 */
const getAllCemeteries = async (req, res) => {
  try {
    const cemeteries = await cemeteryService.getAllCemeteries();

    return res.status(200).json({
      success: true,
      count:   cemeteries.length,
      data:    cemeteries
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des cimetières');
  }
};

/**
 * @desc    Crée un nouveau cimetière avec géocodage automatique
 * @route   POST /api/cemeteries
 * @access  Admin uniquement
 */
const createCemetery = async (req, res) => {
  try {
    const cemetery = await cemeteryService.createCemetery(req.body);

    return res.status(201).json({
      success: true,
      data:    cemetery,
      message: 'Cimetière ajouté avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la création du cimetière');
  }
};

module.exports = {
  getAllCemeteries,
  createCemetery
};