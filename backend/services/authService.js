// backend/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');


/**
 * SERVICE : Logique métier pour l'authentification
 */

/**
 * Inscription d'un nouvel utilisateur
 */
const registerUser = async (userData) => {
  const { email, password, role, zone_intervention, siret } = userData;

  // ============ VÉRIFICATION MÉTIER ============
  
  // 1. Vérifier si l'email existe déjà
  const emailAlreadyExists = await userRepository.emailExists(email);
  if (emailAlreadyExists) {
    const error = new Error('Cet email est déjà utilisé');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // 2. Vérifier que le rôle existe
  const roleData = await roleRepository.findByName(role);
  if (!roleData) {
    const error = new Error('Rôle invalide');
    error.code = 'INVALID_ROLE';
    error.statusCode = 400;
    throw error;
  }

  // ============ TRAITEMENT MÉTIER ============

  // 3. Hasher le mot de passe
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Créer l'utilisateur en BDD
  const newUser = await userRepository.create({
    email,
    password_hash: hashedPassword,
    role_id: roleData.id,
    zone_intervention,
    siret
  });

  // 5. Récupérer le nom du rôle pour la réponse
  const roleInfo = await roleRepository.findById(newUser.role_id);

  // 6. Générer le JWT pour connexion automatique
  const token = jwt.sign(
    { 
    userId: newUser.id,
    email: newUser.email,
    role: roleInfo.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: roleInfo.name,
      zone_intervention: newUser.zone_intervention,
      siret: newUser.siret,
      created_at: newUser.created_at
    }
  };
};

/**
 * Connexion d'un utilisateur existant
 */
const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // 1. Vérifier que l'utilisateur existe
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Email ou mot de passe incorrect');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  // 2. Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  // 3. Générer le JWT
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // 4. Retourner les données
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      zone_intervention: user.zone_intervention,
      siret: user.siret
    }
  };
};

/**
 * Créer un compte administrateur
 */
const createAdminUser = async (adminData, creatorEmail) => {
  const { email, password } = adminData;

  // ============ VALIDATIONS MÉTIER ============

  // 1. Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error('Format email invalide');
    error.code = 'INVALID_EMAIL';
    error.statusCode = 400;
    throw error;
  }

  // 2. Validation password
  if (password.length < 8) {
    const error = new Error('Le mot de passe doit contenir au moins 8 caractères');
    error.code = 'INVALID_PASSWORD';
    error.statusCode = 400;
    throw error;
  }

  // 3. Vérifier si l'email existe déjà
  const emailAlreadyExists = await userRepository.emailExists(email);
  if (emailAlreadyExists) {
    const error = new Error('Cet email est déjà utilisé');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // 4. Récupérer le role_id admin
  const adminRole = await roleRepository.findByName('admin');
  if (!adminRole) {
    const error = new Error('Rôle admin introuvable');
    error.code = 'ROLE_NOT_FOUND';
    error.statusCode = 500;
    throw error;
  }

  // ============ TRAITEMENT MÉTIER ============

  // 5. Hasher le mot de passe
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 6. Créer l'admin
  const newAdmin = await userRepository.create({
    email,
    password_hash: hashedPassword,
    role_id: adminRole.id,
    zone_intervention: null,
    siret: null
  });

  // ============ LOG DE SÉCURITÉ ============
  console.log(`[SECURITY] Nouvel admin créé par ${creatorEmail}:`, {
    new_admin_id: newAdmin.id,
    new_admin_email: newAdmin.email,
    created_by: creatorEmail,
    created_at: new Date().toISOString()
  });

  // ============ RETOURNER LES DONNÉES ============
  return {
    admin_id: newAdmin.id,
    email: newAdmin.email,
    role: 'admin',
    created_at: newAdmin.created_at
  };
};

module.exports = {
  registerUser,
  loginUser,
  createAdminUser
};