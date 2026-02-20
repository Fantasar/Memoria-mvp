const cemeteryRepository = require('../repositories/cemeteryRepository');
const geocodingService = require('./geocodingService');

const createCemetery = async (data) => {
  if (!data.name || !data.city || !data.postal_code) {
    const error = new Error('Nom, ville et code postal sont obligatoires');
    error.statusCode = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }

  // ✅ Géocoder l'adresse automatiquement
  const geocoded = await geocodingService.geocodeAddress(
    data.address || data.name, // Utilise l'adresse si fournie, sinon le nom du cimetière
    data.city,
    data.postal_code
  );

  // Préparer les données avec coordonnées GPS
  const cemeteryData = {
    name: data.name,
    city: data.city,
    postal_code: data.postal_code,
    department: data.department || null,
    latitude: geocoded?.latitude || null,
    longitude: geocoded?.longitude || null,
    address: geocoded?.formatted_address || data.address || null
  };

  return await cemeteryRepository.createCemetery(cemeteryData);
};

module.exports = {
  createCemetery
};