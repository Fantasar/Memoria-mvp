// backend/services/providerService.js
const userRepository     = require('../repositories/userRepository');
const providerRepository = require('../repositories/providerRepository');
const zoneRepository     = require('../repositories/zoneRepository');
const notificationRepository = require('../repositories/notificationRepository');

/**
 * Service de gestion des prestataires.
 * Gère la validation admin, les finances, la zone d'intervention
 * et les statistiques géographiques des prestataires.
 */

/**
 * Vérifie qu'un utilisateur a le rôle admin
 * Factorisé car utilisé dans getPendingProviders, approveProvider et rejectProvider
 * @param {number} adminId
 */
const checkAdminAccess = async (adminId) => {
  const admin = await userRepository.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }
};

/**
 * Récupère les prestataires en attente de validation
 * @param {number} adminId
 * @returns {Array}
 */
const getPendingProviders = async (adminId) => {
  try {
    await checkAdminAccess(adminId);
    return await userRepository.findPendingProviders();
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.getPendingProviders : ${error.message}`);
  }
};

/**
 * Valide un prestataire (activation du compte)
 * Vérifie que le prestataire existe, a le bon rôle et n'est pas déjà validé
 * @param {number} providerId
 * @param {number} adminId
 * @returns {Object} - Le prestataire mis à jour
 */
const approveProvider = async (providerId, adminId) => {
  try {
    await checkAdminAccess(adminId);

    const provider = await userRepository.findById(providerId);
    if (!provider) {
      const error = new Error('Prestataire introuvable');
      error.code = 'PROVIDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (provider.role !== 'prestataire') {
      const error = new Error('Cet utilisateur n\'est pas un prestataire');
      error.code = 'INVALID_ROLE';
      error.statusCode = 400;
      throw error;
    }

    if (provider.is_verified) {
      const error = new Error('Ce prestataire est déjà validé');
      error.code = 'ALREADY_VERIFIED';
      error.statusCode = 400;
      throw error;
    }

    const updatedProvider = await userRepository.approveProvider(providerId);

    //Notification en cas de compte valider
    await notificationRepository.create({
      user_id: providerId,
      type:    'account_validated',
      title:   'Compte validé ✅',
      message: 'Votre compte a été validé par un administrateur. Vous pouvez maintenant accepter des missions !',
    });

    return updatedProvider;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.approveProvider : ${error.message}`);
  }
};

/**
 * Rejette un prestataire avec un motif
 * @param {number} providerId
 * @param {number} adminId
 * @param {string} reason - Motif du rejet communiqué au prestataire
 * @returns {Object} - Le prestataire mis à jour
 */
const rejectProvider = async (providerId, adminId, reason) => {
  try {
    await checkAdminAccess(adminId);

    const provider = await userRepository.findById(providerId);
    if (!provider) {
      const error = new Error('Prestataire introuvable');
      error.code = 'PROVIDER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const updatedProvider = await userRepository.rejectProvider(providerId, reason);

    //Notification en cas de compte refuser
    await notificationRepository.create({
      user_id: providerId,
      type:    'account_rejected',
      title:   'Compte non validé ❌',
      message: `Votre demande d'inscription a été refusée. Motif : ${reason}`,
    });

    return updatedProvider;

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.rejectProvider : ${error.message}`);
  }
};

/**
 * Récupère les statistiques financières d'un prestataire
 * @param {number} userId
 * @returns {Object} - { total_earned, missions_completed, monthly_breakdown, ... }
 */
const getProviderFinances = async (userId) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return await providerRepository.getProviderFinancialStats(userId);

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.getProviderFinances : ${error.message}`);
  }
};

/**
 * Met à jour la zone d'intervention d'un prestataire
 * @param {number} userId
 * @param {string} zone - Département ou ville (minimum 2 caractères)
 * @returns {Object} - { zone }
 */
const updateZone = async (userId, zone) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    if (!zone || zone.trim().length < 2) {
      const error = new Error('Zone invalide (minimum 2 caractères)');
      error.code = 'INVALID_ZONE';
      error.statusCode = 400;
      throw error;
    }

    await userRepository.updateZone(userId, zone.trim());
    return { zone: zone.trim() };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.updateZone : ${error.message}`);
  }
};

/**
 * Récupère les statistiques géographiques de la zone d'un prestataire
 * Les 3 requêtes sont indépendantes, exécutées en parallèle
 * @param {number} userId
 * @returns {Object} - { zone, cemeteries, cemetery_count, potential_missions, main_cities }
 */
const getZoneStats = async (userId) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'prestataire') {
      const error = new Error('Accès réservé aux prestataires');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Utilise la Gironde comme zone par défaut si non définie
    const zone = user.zone_intervention || 'Gironde';

    // Les 3 requêtes sont indépendantes — exécution parallèle
    const [cemeteries, potentialMissions, mainCities] = await Promise.all([
      zoneRepository.getCemeteriesInZone(zone),
      zoneRepository.countPotentialMissions(zone),
      zoneRepository.getMainCitiesInZone(zone)
    ]);

    return {
      zone,
      cemeteries,
      cemetery_count:     cemeteries.length,
      potential_missions: potentialMissions,
      main_cities:        mainCities.map(c => c.city)
    };

  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`providerService.getZoneStats : ${error.message}`);
  }
};

module.exports = {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getProviderFinances,
  updateZone,
  getZoneStats
};