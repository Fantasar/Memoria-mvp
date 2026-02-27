// backend/services/smsService.js
const axios = require('axios');

/**
 * Envoie un SMS de réinitialisation de mot de passe via l'API REST Brevo
 * @param {string} telephone - Numéro destinataire au format international (+33612345678)
 * @param {string} code - Code à 6 chiffres
 */
const sendPasswordResetSMS = async (telephone, code) => {
  await axios.post(
    'https://api.brevo.com/v3/transactionalSMS/sms',
    {
      sender:    process.env.BREVO_SMS_SENDER,
      recipient: telephone,
      content:   `Memoria - Votre code de reinitialisation : ${code}\nValable 15 minutes. Ne le partagez pas.`,
      type:      'transactional',
    },
    {
      headers: {
        'api-key':      process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

module.exports = { sendPasswordResetSMS };