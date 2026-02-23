// backend/middlewares/validation.js

// Regex partagée pour la validation du format email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valide les données d'inscription.
 * Vérifie : email, password, role, et les champs spécifiques prestataire (siret, zone_intervention).
 */
const validateRegister = (req, res, next) => {
  const { email, password, role, zone_intervention, siret } = req.body;
  const errors = [];

  // Validation email
  if (!email) {
    errors.push('L\'email est obligatoire');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Le format de l\'email est invalide');
  }

  // Validation mot de passe
  if (!password) {
    errors.push('Le mot de passe est obligatoire');
  } else if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  // Validation rôle — la création de compte admin est bloquée sur cet endpoint
  if (!role) {
    errors.push('Le rôle est obligatoire');
  } else if (role === 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_NOT_ALLOWED',
        message: 'La création de compte administrateur via cet endpoint n\'est pas autorisée'
      }
    });
  } else if (!['client', 'prestataire'].includes(role)) {
    errors.push('Le rôle doit être : client ou prestataire');
  }

  // Validations supplémentaires pour le rôle prestataire
  if (role === 'prestataire') {
    if (!zone_intervention || zone_intervention.trim().length === 0) {
      errors.push('La zone d\'intervention est obligatoire pour les prestataires');
    }

    if (!siret) {
      errors.push('Le numéro SIRET est obligatoire pour les prestataires');
    } else if (!/^\d{14}$/.test(siret)) {
      errors.push('Le SIRET doit contenir exactement 14 chiffres');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: errors
      }
    });
  }

  next();
};

/**
 * Valide les données de connexion.
 * Vérifie : email, password.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('L\'email est obligatoire');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Le format de l\'email est invalide');
  }

  if (!password) {
    errors.push('Le mot de passe est obligatoire');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: errors
      }
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };