// backend/controllers/cemeteryController.js
const cemeteryRepository = require('../repositories/cemeteryRepository');
const cemeteryService = require('../services/cemeteryService');

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

const createCemetery = async (req, res) => {
  try {
    const cemetery = await cemeteryService.createCemetery(req.body);
    return res.status(201).json({
      success: true,
      data: cemetery,
      message: 'Cimetière ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur création cimetière:', error);
    
    // Gestion erreur contrainte UNIQUE (nom + ville)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: { 
          code: 'DUPLICATE_CEMETERY', 
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
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

module.exports = {
  getAllCemeteries,
  createCemetery
};