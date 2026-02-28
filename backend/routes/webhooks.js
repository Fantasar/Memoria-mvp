const express    = require('express');
const router     = express.Router();
const { receiveWebhook } = require('../controllers/crispMessageController');

// Public — Crisp n'envoie pas de JWT
router.post('/crisp', receiveWebhook);

module.exports = router;