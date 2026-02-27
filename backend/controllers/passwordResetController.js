// backend/controllers/passwordResetController.js
const pool                     = require('../config/db');
const bcrypt                   = require('bcrypt');
const passwordResetRepository  = require('../repositories/passwordResetRepository');
const { sendPasswordResetSMS } = require('../services/smsService');

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
 * Étape 1 : Demande de réinitialisation — envoie le code SMS
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

    // Recherche en base avec le format stocké (ex: 0612345678)
    const userResult = await pool.query(
      'SELECT id, prenom FROM users WHERE telephone = $1',
      [telephone]
    );

    // Réponse identique même si le numéro n'existe pas (sécurité)
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Si ce numéro est enregistré, un code vous a été envoyé'
      });
    }

    const user = userResult.rows[0];

    // Génère un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await passwordResetRepository.create(user.id, code);

    // Envoi SMS avec le format international requis par Twilio
    const telephoneFormatted = formatTelephoneForSMS(telephone);
    console.log('Envoi SMS vers:', telephoneFormatted); // ← ajoute ça
    await sendPasswordResetSMS(telephoneFormatted, code);

    return res.status(200).json({
      success: true,
      message: 'Si ce numéro est enregistré, un code vous a été envoyé'
    });

  } catch (error) {
    console.error('Erreur requestReset:', error.response?.data || error.message);
    console.error('Erreur requestReset:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de l\'envoi du code' }
    });
  }
};

/**
 * Étape 2 : Vérification du code + nouveau mot de passe
 */
const resetPassword = async (req, res) => {
  try {
    const { telephone, code, newPassword } = req.body;

    if (!telephone?.trim() || !code?.trim() || !newPassword?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Le mot de passe doit faire au moins 8 caractères' }
      });
    }

    // Vérifie le token en base (recherche par téléphone au format stocké)
    const resetToken = await passwordResetRepository.verify(telephone.trim(), code.trim());

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CODE', message: 'Code invalide ou expiré' }
      });
    }

    // Met à jour le mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, resetToken.user_id]
    );

    // Invalide le token pour éviter toute réutilisation
    await passwordResetRepository.markAsUsed(resetToken.id);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur resetPassword:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors de la réinitialisation' }
    });
  }
};

module.exports = { requestReset, resetPassword };