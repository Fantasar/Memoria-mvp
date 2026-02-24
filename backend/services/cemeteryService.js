// backend/services/cemeteryService.js
const cemeteryRepository = require('../repositories/cemeteryRepository');
const geocodingService   = require('./geocodingService');

/**
 * Service de gestion des cimetières.
 * Gère la création avec géocodage automatique des coordonnées GPS.
 * Utilisé par le dashboard admin pour alimenter le catalogue de cimetières.
 */


/**
 * Récupère tous les cimetières actifs
 * @returns {Array}
 */
const getAllCemeteries = async () => {
  return await cemeteryRepository.findAllActive();
};

/**
 * Crée un nouveau cimetière avec ses coordonnées GPS
 * Tente un géocodage automatique — si l'API échoue, le cimetière
 * est quand même créé sans coordonnées (latitude/longitude = null)
 * @param {Object} data - { name, city, postal_code, department, address }
 * @returns {Object} - Le cimetière créé
 */
const createCemetery = async (data) => {
  try {
    if (!data.name || !data.city || !data.postal_code) {
      const error = new Error('Nom, ville et code postal sont obligatoires');
      error.statusCode = 400;
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    // Tente de récupérer les coordonnées GPS via l'API de géocodage
    // Utilise l'adresse complète si disponible, sinon le nom du cimetière
    const geocoded = await geocodingService.geocodeAddress(
      data.address || data.name,
      data.city,
      data.postal_code
    );

    const cemeteryData = {
      name:        data.name,
      city:        data.city,
      postal_code: data.postal_code,
      department:  data.department              || null,
      latitude:    geocoded?.latitude           || null,
      longitude:   geocoded?.longitude          || null,
      // Préfère l'adresse formatée retournée par le géocodeur
      address:     geocoded?.formatted_address  || data.address || null
    };

    return await cemeteryRepository.createCemetery(cemeteryData);

  } catch (error) {
    // Rethrow les erreurs métier telles quelles
    if (error.statusCode) throw error;
    throw new Error(`cemeteryService.createCemetery : ${error.message}`);
  }
};

module.exports = { createCemetery, getAllCemeteries };