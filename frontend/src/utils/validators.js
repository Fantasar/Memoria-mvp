// Validation email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "L'email est requis";
  if (!emailRegex.test(email)) return "Format d'email invalide";
  return null;
};

// Validation mot de passe
export const validatePassword = (password) => {
  if (!password) return "Le mot de passe est requis";
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
  if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir au moins une majuscule";
  if (!/[a-z]/.test(password)) return "Le mot de passe doit contenir au moins une minuscule";
  if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir au moins un chiffre";
  return null;
};

// Validation confirmation mot de passe
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return "La confirmation du mot de passe est requise";
  if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
  return null;
};

// Validation rôle
export const validateRole = (role) => {
  if (!role) return "Veuillez sélectionner un rôle";
  return null;
};