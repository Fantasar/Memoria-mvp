// backend/controllers/usersController.js
const userRepository = require('../repositories/userRepository');
const bcrypt         = require('bcrypt');

const updateProfile = async (req, res) => {
  try {
    const { prenom, nom, email, telephone } = req.body;

    if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !telephone?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont obligatoires' }
      });
    }

    const updated = await userRepository.update(req.user.userId, { prenom, nom, email, telephone });

    // Retourne le user avec role (string) et non role_id
    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        role: req.user.role
      },
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

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

    // Récupère le hash actuel
    const user     = await userRepository.findById(req.user.userId);
    const isValid  = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Mot de passe actuel incorrect' }
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(req.user.userId, newHash);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur lors du changement de mot de passe' }
    });
  }
};

module.exports = { updateProfile, updatePassword };