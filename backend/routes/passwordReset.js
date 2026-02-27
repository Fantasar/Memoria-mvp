// backend/routes/passwordReset.js
const express = require('express');
const router  = express.Router();
const { requestReset, resetPassword } = require('../controllers/passwordResetController');

// POST /api/auth/forgot-password  — demande le code SMS
router.post('/forgot-password', requestReset);

// POST /api/auth/reset-password   — vérifie le code + nouveau mdp
router.post('/reset-password', resetPassword);

module.exports = router;