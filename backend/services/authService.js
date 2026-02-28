// backend/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');
const notificationRepository = require('../repositories/notificationRepository');


/**
 * Service d'authentification.
 * Gère l'inscription, la connexion et la création de comptes admin.
 * Orchestre userRepository et roleRepository,
 * hash les mots de passe via bcrypt et génère les tokens JWT.
 */

// Nombre de passes de hachage bcrypt — 10 est le standard recommandé
const SALT_ROUNDS = 10;

/**
 * Génère un token JWT pour un utilisateur authentifié
 * Factorisé pour éviter la duplication entre registerUser et loginUser
 * @param {Object} user - { id, email, role }
 * @returns {string} - Token JWT signé
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Inscrit un nouvel utilisateur (client ou prestataire)
 * Connecte automatiquement l'utilisateur après inscription via JWT
 * @param {Object} userData - { email, password, role, prenom, nom, zone_intervention, siret }
 * @returns {Object} - { token, user }
 */
const registerUser = async (userData) => {
  const { email, password, role, zone_intervention, siret, prenom, nom, telephone } = userData;

  // Vérifie que l'email n'est pas déjà utilisé
  const emailAlreadyExists = await userRepository.emailExists(email);
  if (emailAlreadyExists) {
    const error = new Error('Cet email est déjà utilisé');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // Vérifie que le rôle demandé existe en base
  const roleData = await roleRepository.findByName(role);
  if (!roleData) {
    const error = new Error('Rôle invalide');
    error.code = 'INVALID_ROLE';
    error.statusCode = 400;
    throw error;
  }

  // Hash le mot de passe et crée l'utilisateur
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await userRepository.create({
    email,
    password_hash: hashedPassword,
    role_id: roleData.id,
    prenom,
    nom,
    telephone,
    zone_intervention,
    siret
  });

  //Notification si prestataire
  if (role === 'prestataire') {
    await notificationRepository.create({
      user_id: newUser.id,
      type: 'account_pending',
      title: 'Compte en attente de validation',
      message: 'Votre compte prestataire a bien été créé. Un administrateur va examiner votre dossier et valider votre inscription sous 24-48h.',
    });
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: roleData.name
  });

  return {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      prenom: newUser.prenom,
      nom: newUser.nom,
      role: roleData.name,
      telephone: newUser.telephone,
      zone_intervention: newUser.zone_intervention,
      siret: newUser.siret,
      created_at: newUser.created_at
    }
  };
};

/**
 * Connecte un utilisateur existant
 * @param {Object} credentials - { email, password }
 * @returns {Object} - { token, user }
 */
const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Vérifie que l'utilisateur existe — message volontairement générique pour la sécurité
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Email ou mot de passe incorrect');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  // Vérifie le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      zone_intervention: user.zone_intervention,
      siret: user.siret
    }
  };
};

/**
 * Crée un compte administrateur
 * Réservé aux admins existants — traçabilité via log de sécurité
 * @param {Object} adminData - { email, password }
 * @param {string} creatorEmail - Email de l'admin qui crée le compte
 * @returns {Object} - { admin_id, email, role, created_at }
 */
const createAdminUser = async (adminData, creatorEmail) => {
  const { email, password } = adminData;

  // Vérifie que l'email n'est pas déjà utilisé
  const emailAlreadyExists = await userRepository.emailExists(email);
  if (emailAlreadyExists) {
    const error = new Error('Cet email est déjà utilisé');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // Récupère le rôle admin — erreur 500 si absent car c'est une donnée de référence
  const adminRole = await roleRepository.findByName('admin');
  if (!adminRole) {
    const error = new Error('Rôle admin introuvable en base de données');
    error.code = 'ROLE_NOT_FOUND';
    error.statusCode = 500;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newAdmin = await userRepository.create({
    email,
    password_hash: hashedPassword,
    role_id: adminRole.id,
    zone_intervention: null,
    siret: null
  });

  // Log de sécurité — toute création d'admin doit être tracée
  console.log(`[SECURITY] Nouvel admin créé par ${creatorEmail} :`, {
    new_admin_id: newAdmin.id,
    new_admin_email: newAdmin.email,
    created_by: creatorEmail,
    created_at: new Date().toISOString()
  });

  return {
    admin_id: newAdmin.id,
    email: newAdmin.email,
    role: 'admin',
    created_at: newAdmin.created_at
  };
};

/**
 * Récupère tous les utilisateurs de la plateforme (hors admins)
 * Utilisé par le dashboard admin pour la gestion des comptes
 * @returns {Array}
 */
const getAllUsers = async () => {
  return await userRepository.getAllUsers();
};

const toggleBlockUser = async (userId) => {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Utilisateur introuvable');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return await userRepository.toggleBlock(userId, !user.is_blocked);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`adminService.toggleBlockUser : ${error.message}`);
  }
};

const deleteUser = async (userId, adminId) => {
  try {
    if (userId == adminId) {
      const error = new Error('Impossible de supprimer votre propre compte');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Utilisateur introuvable');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return await userRepository.deleteById(userId);
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`adminService.deleteUser : ${error.message}`);
  }
};

/**
 * Met à jour le profil d'un utilisateur connecté
 * @param {string} userId
 * @param {Object} profileData - { prenom, nom, email, telephone }
 * @returns {Object} - L'utilisateur mis à jour
 */
const updateProfile = async (userId, profileData) => {
  const updated = await userRepository.update(userId, profileData);
  if (!updated) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

/**
 * Met à jour le mot de passe d'un utilisateur connecté
 * Vérifie l'ancien mot de passe avant d'appliquer le nouveau
 * @param {string} userId
 * @param {string} currentPassword - Mot de passe actuel en clair
 * @param {string} newPassword     - Nouveau mot de passe en clair
 * @returns {void}
 */
const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Vérifie que l'ancien mot de passe est correct
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    const error = new Error('Mot de passe actuel incorrect');
    error.code = 'INVALID_PASSWORD';
    error.statusCode = 400;
    throw error;
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updatePassword(userId, newHash);
};

module.exports = {
  registerUser,
  loginUser,
  createAdminUser,
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  updateProfile,
  updatePassword
};