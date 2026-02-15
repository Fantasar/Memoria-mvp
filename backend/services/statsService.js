const statsRepository = require('../repositories/statsRepository');
const userRepository = require('../repositories/userRepository');

/**
 * Récupérer les statistiques (admin uniquement)
 */
const getPlatformStats = async (adminId) => {
  // Vérifier que c'est un admin
  const admin = await userRepository.findById(adminId);
  
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  return await statsRepository.getPlatformStats();
};

module.exports = {
  getPlatformStats
};