// backend/services/contactService.js
const { sendEmail }           = require('./emailService');
const notificationRepository  = require('../repositories/notificationRepository');
const userRepository          = require('../repositories/userRepository');

/**
 * Service de gestion des messages de contact public.
 * Responsabilité : orchestrer l'envoi des emails et la création de la notification admin.
 * Appelé exclusivement par contactController.
 */

/**
 * @desc    Traite un message de contact :
 *          — Envoie un email à l'admin avec le contenu du message
 *          — Envoie un email de confirmation à l'expéditeur
 *          — Crée une notification interne pour l'admin dans le dashboard
 * @param   {Object} contactData - { name, email, subject, message }
 * @returns {void}
 */
const sendContactMessage = async ({ name, email, subject, message }) => {
  // Email à l'admin
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `[Mémoria Contact] ${subject || 'Nouveau message'}`,
    `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject || 'Non précisé'}</p>
      <p><strong>Message :</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `
  );

  // Email de confirmation à l'expéditeur
  await sendEmail(
    email,
    'Nous avons bien reçu votre message — Mémoria',
    `
      <h2>Bonjour ${name},</h2>
      <p>Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais.</p>
      <p>Cordialement,<br/>L'équipe Mémoria</p>
    `
  );

  // Notification interne — récupère le premier admin et crée une notification dans son dashboard
  const admins = await userRepository.findByRole('admin');
  if (admins?.length > 0) {
    await notificationRepository.create({
      user_id: admins[0].id,
      type:    'contact_message',
      title:   '📩 Nouveau message de contact',
      message: `${name} (${email}) : ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
    });
  }
};

module.exports = { sendContactMessage };