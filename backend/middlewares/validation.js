// backend/middlewares/validation.js

/**
 * Middleware de validation pour l'inscription utilisateur
 * Valide : email, password, role, zone_intervention (si prestataire)
 */
const validateRegister = (req, res, next) => {
  const { email, password, role, zone_intervention, siret } = req.body;

  // Liste des erreurs à accumuler
  const errors = [];

  // ============ VALIDATION EMAIL ============
  if (!email) {
    errors.push('L\'email est obligatoire');
  } else {
    // Regex simple pour valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Le format de l\'email est invalide');
    }
  }

  // ============ VALIDATION PASSWORD ============
  if (!password) {
    errors.push('Le mot de passe est obligatoire');
  } else if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  // ============ VALIDATION ROLE ============
  const rolesValides = ['client', 'prestataire'];

  if (!role) {
    errors.push('Le rôle est obligatoire');
  } else if (role === 'admin') {
    // Retour immédiat si quelqu'un essaie de créer un admin
    return res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_NOT_ALLOWED',
        message: 'La création de compte administrateur via cet endpoint n\'est pas autorisée.'
      }
    });
  } else if (!rolesValides.includes(role)) {
    errors.push('Le rôle doit être: client ou prestataire');
  }

  // ============ VALIDATIONS SPÉCIFIQUES PRESTATAIRE ============
  if (role === 'prestataire') {
    // Validation zone d'intervention
    if (!zone_intervention) {
      errors.push('La zone d\'intervention est obligatoire pour les prestataires');
    } else if (zone_intervention.trim().length === 0) {
      errors.push('La zone d\'intervention ne peut pas être vide');
    }

    // Validation SIRET
    if (!siret) {
      errors.push('Le numéro SIRET est obligatoire pour les prestataires');
    } else if (siret.length !== 14) {
      errors.push('Le SIRET doit contenir exactement 14 chiffres');
    } else if (!/^\d{14}$/.test(siret)) {
      errors.push('Le SIRET doit contenir uniquement des chiffres');
    }
  }

  // ============ RETOUR ERREURS OU SUITE ============
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

  // Tout est valide, on passe au controller
  next();
};

/**
 * Middleware de validation pour la connexion
 * Valide : email, password
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // ============ VALIDATION EMAIL ============
  if (!email) {
    errors.push('L\'email est obligatoire');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Le format de l\'email est invalide');
    }
  }

  // ============ VALIDATION PASSWORD ============
  if (!password) {
    errors.push('Le mot de passe est obligatoire');
  }

  // ============ RETOUR ERREURS OU SUITE ============
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