// backend/controllers/serviceCategoryController.js
const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');

/**
 * CONTROLLER : Gestion des catégories de services
 * Responsabilité : Recevoir req, appeler repository, formatter res
 */

/**
 * @desc    Récupérer toutes les catégories de services actives
 * @route   GET /api/service-categories
 * @access  Public (ou Private selon ton choix)
 */
const getAllServiceCategories = async (req, res) => {
  try {
    const categories = await serviceCategoryRepository.findAllActive();

    return res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Erreur récupération catégories de services:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des catégories de services'
      }
    });
  }
};

module.exports = {
  getAllServiceCategories
};