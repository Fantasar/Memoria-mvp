// backend/services/emailService.js
const axios = require('axios');

/**
 * Envoie un email transactionnel via l'API REST Brevo
 * @param {string} to      - Email destinataire
 * @param {string} subject - Sujet
 * @param {string} html    - Corps HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender:      { name: 'Mémoria', email: process.env.BREVO_SENDER_EMAIL },
        to:          [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key':      process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { sendEmail };