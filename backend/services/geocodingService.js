// backend/services/geocodingService.js
const axios = require('axios');

/**
 * Service d'intégration Google Geocoding API.
 * Convertit une adresse textuelle en coordonnées GPS (latitude/longitude).
 * Utilisé par cemeteryService lors de la création d'un cimetière.
 *
 * Note : ce service retourne null en cas d'échec plutôt que de lancer une erreur —
 * un cimetière sans coordonnées GPS est préférable à un blocage de création.
 */

/**
 * Géocode une adresse et retourne ses coordonnées GPS
 * @param {string} address - Adresse complète ou nom du lieu
 * @param {string} city - Ville
 * @param {string} postalCode - Code postal
 * @returns {Object|null} - { latitude, longitude, formatted_address } ou null si échec
 */
const geocodeAddress = async (address, city, postalCode) => {
  try {
    const fullAddress = `${address || ''}, ${postalCode} ${city}, France`;

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: fullAddress,
        key:     process.env.GOOGLE_MAPS_API_KEY,
        region:  'fr'
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location         = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;

      return {
        latitude:          location.lat,
        longitude:         location.lng,
        formatted_address: formattedAddress
      };
    }

    // L'API a répondu mais n'a pas trouvé de résultat — comportement normal
    return null;

  } catch (error) {
    // Echec réseau ou clé API invalide — on ne bloque pas la création du cimetière
    console.error('❌ Geocoding indisponible:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress };