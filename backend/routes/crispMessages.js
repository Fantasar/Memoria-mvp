// backend/routes/crispMessageRoutes.js
const express = require('express');
const router  = express.Router();
const { getMessages, markAsRead, markAllAsRead, deleteOne, deleteAll } = require('../controllers/crispMessageController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des messages Crisp
 * Base : /api/admin/messages
 * Toutes les routes sont protégées — accès admin uniquement
 */

// GET    /api/admin/messages       — Liste tous les messages avec compteur non lus
router.get('/',        authenticateToken, authenticateAdmin, getMessages);

// PATCH  /api/admin/messages/:id   — Marque un message spécifique comme lu
router.patch('/:id',   authenticateToken, authenticateAdmin, markAsRead);

// PATCH  /api/admin/messages       — Marque tous les messages comme lus
// ⚠️ Doit être après /:id pour ne pas être intercepté comme un paramètre
router.patch('/',      authenticateToken, authenticateAdmin, markAllAsRead);

// DELETE /api/admin/messages/:id   — Supprime un message spécifique
router.delete('/:id',  authenticateToken, authenticateAdmin, deleteOne);

// DELETE /api/admin/messages       — Supprime tous les messages
router.delete('/',     authenticateToken, authenticateAdmin, deleteAll);

module.exports = router;