// backend/controllers/usersController.js
const authService = require('../services/authService');

/**
 * Contrôleur de gestion du profil utilisateur.
 * Responsabilité : valider les champs, appeler authService, formater la réponse.
 */

/**
 * @desc    Met à jour le profil de l'utilisateur connecté
 * @route   PATCH /api/users/profile
 * @access  Privé
 */
const updateProfile = async (req, res) => {
  try {
    const { prenom, nom, email, telephone } = req.body;

    if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !telephone?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    const updated = await authService.updateProfile(req.user.userId, { prenom, nom, email, telephone });

    return res.status(200).json({
      success: true,
      data: { ...updated, role: req.user.role },
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * @desc    Met à jour le mot de passe de l'utilisateur connecté
 * @route   PATCH /api/users/password
 * @access  Privé
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Le mot de passe doit contenir au moins 8 caractères' }
      });
    }

    await authService.updatePassword(req.user.userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    if (error.code === 'INVALID_PASSWORD') {
      return res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors du changement de mot de passe' }
    });
  }
};

module.exports = { updateProfile, updatePassword };