const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');

const getAllActiveServiceCategories = async () => {
  return await serviceCategoryRepository.findAllActive();
};

const getAllServiceCategoriesWithCount = async () => {
  return await serviceCategoryRepository.findAll();
};

const createServiceCategory = async (data) => {
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
};

module.exports = {
  getAllActiveServiceCategories,
  getAllServiceCategoriesWithCount,
  createServiceCategory
};