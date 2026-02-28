const express = require('express');
const router  = express.Router();
const { getMessages, markAsRead, markAllAsRead, deleteOne, deleteAll } = require('../controllers/crispMessageController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

// Protégé admin uniquement
router.get('/',        authenticateToken, authenticateAdmin, getMessages);
router.patch('/:id',   authenticateToken, authenticateAdmin, markAsRead);
router.patch('/', authenticateToken, authenticateAdmin, markAllAsRead);
router.delete('/:id', authenticateToken, authenticateAdmin, deleteOne);
router.delete('/',    authenticateToken, authenticateAdmin, deleteAll);


module.exports = router;