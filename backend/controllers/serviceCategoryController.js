// backend/controllers/serviceCategoryController.js
const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');
const serviceCategoryService = require('../services/serviceCategoryService');


/**
 * CONTROLLER : Gestion des catégories de services
 * Responsabilité : Recevoir req, appeler repository, formatter res
 */

/**
 * @desc    Récupérer toutes les catégories de services actives
 * @route   GET /api/service-categories
 * @access  Public (ou Private selon ton choix)
 */
const getAllActiveServiceCategories = async (req, res) => {
  try {
    const categories = await serviceCategoryService.getAllActiveServiceCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erreur service categories:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

// Pour l'admin (tous les services + compteur)
const getAllServiceCategoriesAdmin = async (req, res) => {
  try {
    const categories = await serviceCategoryService.getAllServiceCategoriesWithCount();
    return res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Erreur service categories admin:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

const createServiceCategory = async (req, res) => {
  try {
    const category = await serviceCategoryService.createServiceCategory(req.body);
    return res.status(201).json({
      success: true,
      data: category,
      message: 'Service ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur création service:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: { 
          code: 'DUPLICATE_SERVICE', 
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
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
};

module.exports = {
  getAllActiveServiceCategories,
  getAllServiceCategoriesAdmin,
  createServiceCategory
};