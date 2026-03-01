// backend/controllers/contactController.js
const contactService = require('../services/Contactservice');

/**
 * Contrôleur du formulaire de contact public.
 * Responsabilité : valider les champs, appeler contactService, formater la réponse.
 * Ne contient aucune logique métier — tout est délégué au service.
 */

/**
 * @desc    Reçoit et traite un message depuis le formulaire de contact public
 * @route   POST /api/contact
 * @access  Public
 */
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation des champs obligatoires
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    await contactService.sendContactMessage({ name, email, subject, message });

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