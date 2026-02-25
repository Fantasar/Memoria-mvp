// backend/routes/users.js
const express         = require('express');
const router          = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middlewares/admin-auth');

// PUT /api/users/profile — Mise à jour des infos personnelles
router.put('/profile',  authenticateToken, usersController.updateProfile);

// PUT /api/users/password — Changement de mot de passe
router.put('/password', authenticateToken, usersController.updatePassword);

module.exports = router;