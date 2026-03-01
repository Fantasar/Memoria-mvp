// backend/services/passwordResetService.js
const bcrypt                   = require('bcrypt');
const userRepository           = require('../repositories/userRepository');
const passwordResetRepository  = require('../repositories/passwordResetRepository');
const { sendPasswordResetSMS } = require('./smsService');

/**
 * Service de réinitialisation de mot de passe par SMS.
 * Responsabilité : orchestrer la génération du code, l'envoi SMS et la mise à jour du mot de passe.
 * Appelé exclusivement par passwordResetController.
 */

/**
 * Convertit un numéro français local en format international Twilio
 * Ex: 0612345678 → +33612345678
 * @param {string} tel
 * @returns {string}
 */
const formatTelephoneForSMS = (tel) => {
  return tel.replace(/\s/g, '').replace(/^0/, '+33');
};

/**
 * @desc    Étape 1 — Génère un code à 6 chiffres et l'envoie par SMS
 *          Répond de manière identique si le numéro est inconnu (sécurité anti-énumération)
 * @param   {string} telephone - Numéro au format stocké en base (ex: 0612345678)
 * @returns {void}
 */
const requestReset = async (telephone) => {
  const users = await userRepository.findByTelephone(telephone);

  // Réponse silencieuse si le numéro n'existe pas — évite l'énumération de comptes
  if (!users || users.length === 0) return;

  const user = users[0];

  // Génère un code à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await passwordResetRepository.create(user.id, code);

  // Envoi SMS avec le format international requis par Twilio
  const telephoneFormatted = formatTelephoneForSMS(telephone);
  console.log('Envoi SMS vers:', telephoneFormatted);
  await sendPasswordResetSMS(telephoneFormatted, code);
};

/**
 * @desc    Étape 2 — Vérifie le code et met à jour le mot de passe
 * @param   {string} telephone  - Numéro au format stocké en base
 * @param   {string} code       - Code à 6 chiffres reçu par SMS
 * @param   {string} newPassword - Nouveau mot de passe en clair (min. 8 caractères)
 * @returns {void}
 * @throws  {Error} CODE_INVALID si le code est invalide ou expiré
 */
const resetPassword = async (telephone, code, newPassword) => {
  const resetToken = await passwordResetRepository.verify(telephone, code);

  if (!resetToken) {
    const error = new Error('Code invalide ou expiré');
    error.code = 'INVALID_CODE';
    error.statusCode = 400;
    throw error;
  }

  // Hash du nouveau mot de passe et mise à jour en base
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(resetToken.user_id, passwordHash);

  // Invalide le token pour éviter toute réutilisation
  await passwordResetRepository.markAsUsed(resetToken.id);
};

module.exports = { requestReset, resetPassword };