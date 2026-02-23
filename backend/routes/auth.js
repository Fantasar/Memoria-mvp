// backend/routes/auth.js
const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');

/**
 * Routes d'authentification — accès public
 * Base : /api/auth
 */

// POST /api/auth/register — Inscription d'un nouvel utilisateur (client ou prestataire)
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login — Connexion et génération du token JWT
router.post('/login', validateLogin, authController.login);

module.exports = router;