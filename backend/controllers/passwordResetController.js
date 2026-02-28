// backend/controllers/passwordResetController.js
const passwordResetService = require('../services/passwordResetService');

/**
 * Contrôleur de réinitialisation de mot de passe par SMS.
 * Responsabilité : valider les champs, appeler passwordResetService, formater la réponse.
 */

/**
 * @desc    Étape 1 — Reçoit le numéro de téléphone et déclenche l'envoi du code SMS
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const requestReset = async (req, res) => {
  try {
    const telephone = req.body.telephone?.trim();

    if (!telephone) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELD', message: 'Numéro de téléphone requis' }
      });
    }

    await passwordResetService.requestReset(telephone);

    // Réponse identique même si le numéro n'existe pas (sécurité anti-énumération)
    return res.status(200).json({
      success: true,
      message: 'Si ce numéro est enregistré, un code vous a été envoyé'
    });

  } catch (error) {
    console.error('Erreur requestReset:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'envoi du code' }
    });
  }
};

/**
 * @desc    Étape 2 — Vérifie le code SMS et met à jour le mot de passe
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { telephone, code, newPassword } = req.body;

    // Validation des champs obligatoires
    if (!telephone?.trim() || !code?.trim() || !newPassword?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    // Validation de la force du mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Le mot de passe doit faire au moins 8 caractères' }
      });
    }

    await passwordResetService.resetPassword(telephone.trim(), code.trim(), newPassword);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    if (error.code === 'INVALID_CODE') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CODE', message: error.message }
      });
    }
    console.error('Erreur resetPassword:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de la réinitialisation' }
    });
  }
};

module.exports = { requestReset, resetPassword };