// backend/routes/contact.js
const express  = require('express');
const router   = express.Router();
const { sendContactMessage } = require('../controllers/contactController');

// Public — pas besoin d'être connecté pour contacter
router.post('/', sendContactMessage);

module.exports = router;