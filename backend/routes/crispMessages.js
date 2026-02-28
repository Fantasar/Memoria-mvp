const express = require('express');
const router  = express.Router();
const { getMessages, markAsRead } = require('../controllers/crispMessageController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

// Protégé admin uniquement
router.get('/',        authenticateToken, authenticateAdmin, getMessages);
router.patch('/:id',   authenticateToken, authenticateAdmin, markAsRead);

module.exports = router;