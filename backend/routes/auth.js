// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {validateRegister, validateLogin} = require('../middlewares/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur (client, prestataire, admin)
 * @access  Public (pour le moment)
 */

router.post('/register',validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur et génération JWT
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;