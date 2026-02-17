const serviceCategoryRepository = require('../repositories/serviceCategoryRepository');

const getAllServiceCategories = async () => {
  return await serviceCategoryRepository.getAllServiceCategories();
};

module.exports = { getAllServiceCategories };