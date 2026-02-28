// backend/controllers/contactController.js
const { sendEmail }            = require('../services/emailService');
const notificationRepository  = require('../repositories/notificationRepository');
const userRepository           = require('../repositories/userRepository');

const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

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

    // Notification interne pour l'admin
    const admins = await userRepository.findByRole('admin');
    if (admins?.length > 0) {
      await notificationRepository.create({
        user_id: admins[0].id,
        type:    'contact_message',
        title:   '📩 Nouveau message de contact',
        message: `${name} (${email}) : ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur contactController:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'envoi du message' }
    });
  }
};

module.exports = { sendContactMessage };