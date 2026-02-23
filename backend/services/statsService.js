// backend/services/statsService.js
const statsRepository = require('../repositories/statsRepository');
const userRepository  = require('../repositories/userRepository');

/**
 * Service de statistiques.
 * Agit comme garde-barrière devant statsRepository :
 * vérifie les droits d'accès selon le rôle avant de déléguer les calculs.
 */

/**
 * Récupère les statistiques globales de la plateforme
 * Vérifie en base que l'utilisateur est bien admin
 * @param {number} adminId
 * @returns {Object} - { users, orders, revenue, payments, monthly_orders, top_providers }
 */
const getPlatformStats = async (adminId) => {
  try {
    const admin = await userRepository.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      const error = new Error('Accès réservé aux administrateurs');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return await statsRepository.getPlatformStats();

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`statsService.getPlatformStats : ${error.message}`);
  }
};

/**
 * Récupère les statistiques individuelles d'un prestataire
 * Utilise le rôle déjà extrait du JWT par le middleware — pas de requête BDD supplémentaire
 * @param {number} userId
 * @param {string} userRole - Rôle issu de req.user (déjà vérifié par authenticateToken)
 * @returns {Object} - { missions, revenue, monthly, recent_missions }
 */
const getProviderStats = async (userId, userRole) => {
  try {
    if (userRole !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return await statsRepository.getProviderStats(userId);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`statsService.getProviderStats : ${error.message}`);
  }
};

module.exports = {
  getPlatformStats,
  getProviderStats
};