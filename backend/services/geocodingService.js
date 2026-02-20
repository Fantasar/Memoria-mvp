const axios = require('axios');

/**
 * Géocoder une adresse avec Google Geocoding API
 * @param {string} address - Adresse complète ou nom du lieu
 * @param {string} city - Ville
 * @param {string} postalCode - Code postal
 * @returns {object|null} - {latitude, longitude, formatted_address} ou null
 */
const geocodeAddress = async (address, city, postalCode) => {
  try {
    // Construire l'adresse complète
    const fullAddress = `${address || ''}, ${postalCode} ${city}, France`;
    
    console.log(`🗺️  Geocoding: ${fullAddress}`);

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
        region: 'fr'
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;
      
      console.log(`✅ Geocoding success: lat=${location.lat}, lng=${location.lng}`);
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: formattedAddress
      };
    }

    console.warn(`⚠️  Geocoding failed: ${response.data.status}`);
    return null;

  } catch (error) {
    console.error('❌ Erreur geocoding:', error.message);
    return null;
  }
};

module.exports = {
  geocodeAddress
};