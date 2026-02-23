// backend/controllers/serviceCategoryController.js
const serviceCategoryService = require('../services/serviceCategoryService');

/**
 * Contrôleur du catalogue des prestations.
 * Responsabilité : extraire les données de req, appeler serviceCategoryService, formater res.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  // Contrainte d'unicité PostgreSQL — service déjà existant
  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code:    'DUPLICATE_SERVICE',
        message: 'Ce service existe déjà'
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
 * @desc    Récupère les catégories actives uniquement
 * @route   GET /api/service-categories
 * @access  Private (authentifié)
 */
const getAllActiveServiceCategories = async (req, res) => {
  try {
    const categories = await serviceCategoryService.getAllActiveServiceCategories();

    return res.status(200).json({
      success: true,
      count:   categories.length,
      data:    categories
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des services');
  }
};

/**
 * @desc    Récupère toutes les catégories avec compteur de commandes — admin uniquement
 * @route   GET /api/service-categories/admin
 * @access  Admin
 */
const getAllServiceCategoriesAdmin = async (req, res) => {
  try {
    const categories = await serviceCategoryService.getAllServiceCategoriesWithCount();

    return res.status(200).json({
      success: true,
      count:   categories.length,
      data:    categories
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des services admin');
  }
};

/**
 * @desc    Crée une nouvelle catégorie de service — admin uniquement
 * @route   POST /api/service-categories
 * @access  Admin
 */
const createServiceCategory = async (req, res) => {
  try {
    const category = await serviceCategoryService.createServiceCategory(req.body);

    return res.status(201).json({
      success: true,
      data:    category,
      message: 'Service ajouté avec succès'
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la création du service');
  }
};

module.exports = {
  getAllActiveServiceCategories,
  getAllServiceCategoriesAdmin,
  createServiceCategory
};