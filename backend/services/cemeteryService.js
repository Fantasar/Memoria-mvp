const cemeteryRepository = require('../repositories/cemeteryRepository');

const createCemetery = async (data) => {
  if (!data.name || !data.city || !data.postal_code) {
    const error = new Error('Nom, ville et code postal sont obligatoires');
    error.statusCode = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }
  return await cemeteryRepository.createCemetery(data);
};

module.exports = {
  createCemetery
};