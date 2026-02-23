// backend/services/serviceCategoryService.js
const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');

/**
 * Service de gestion du catalogue des prestations.
 * Expose les services disponibles aux clients (création de commande)
 * et permet à l'admin de gérer le catalogue complet.
 */

/**
 * Récupère les catégories actives uniquement
 * Utilisé dans le formulaire de création de commande côté client
 * @returns {Array} - [{ id, name, description, base_price }, ...]
 */
const getAllActiveServiceCategories = async () => {
  try {
    return await serviceCategoryRepository.findAllActive();
  } catch (error) {
    throw new Error(`serviceCategoryService.getAllActiveServiceCategories : ${error.message}`);
  }
};

/**
 * Récupère toutes les catégories y compris inactives avec compteur de commandes
 * Réservé au dashboard admin pour la gestion du catalogue
 * @returns {Array} - [{ id, name, base_price, is_active, orders_count }, ...]
 */
const getAllServiceCategoriesWithCount = async () => {
  try {
    return await serviceCategoryRepository.findAll();
  } catch (error) {
    throw new Error(`serviceCategoryService.getAllServiceCategoriesWithCount : ${error.message}`);
  }
};

/**
 * Crée une nouvelle catégorie de service
 * Réservé à l'admin — vérifie la présence des champs obligatoires et la validité du prix
 * @param {Object} data - { name, description, base_price }
 * @returns {Object} - La catégorie créée
 */
const createServiceCategory = async (data) => {
  try {
    if (!data.name || !data.base_price) {
      const error = new Error('Nom et prix sont obligatoires');
      error.statusCode = 400;
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    if (parseFloat(data.base_price) <= 0) {
      const error = new Error('Le prix doit être supérieur à 0');
      error.statusCode = 400;
      error.code = 'INVALID_PRICE';
      throw error;
    }

    return await serviceCategoryRepository.createServiceCategory(data);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`serviceCategoryService.createServiceCategory : ${error.message}`);
  }
};

module.exports = {
  getAllActiveServiceCategories,
  getAllServiceCategoriesWithCount,
  createServiceCategory
};