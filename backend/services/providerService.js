const userRepository = require('../repositories/userRepository');

/**
 * Récupérer les prestataires en attente
 */
const getPendingProviders = async (adminId) => {
  // Vérifier que c'est un admin
  const admin = await userRepository.findById(adminId);
  
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  return await userRepository.findPendingProviders();
};

/**
 * Valider un prestataire
 */
const approveProvider = async (providerId, adminId) => {
  // Vérifier que c'est un admin
  const admin = await userRepository.findById(adminId);
  
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // Vérifier que le prestataire existe
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

  return await userRepository.approveProvider(providerId);
};

/**
 * Rejeter un prestataire
 */
const rejectProvider = async (providerId, adminId, reason) => {
  // Vérifier que c'est un admin
  const admin = await userRepository.findById(adminId);
  
  if (!admin || admin.role !== 'admin') {
    const error = new Error('Accès réservé aux administrateurs');
    error.code = 'FORBIDDEN';
    error.statusCode = 403;
    throw error;
  }

  // Vérifier que le prestataire existe
  const provider = await userRepository.findById(providerId);
  
  if (!provider) {
    const error = new Error('Prestataire introuvable');
    error.code = 'PROVIDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return await userRepository.rejectProvider(providerId, reason);
};

module.exports = {
  getPendingProviders,
  approveProvider,
  rejectProvider
};