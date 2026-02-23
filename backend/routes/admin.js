// backend/routes/admin.js
const express          = require('express');
const router           = express.Router();
const adminController  = require('../controllers/adminController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes d'administration — accès restreint aux admins
 * Base : /api/admin
 * Chaîne de middlewares : authenticateToken → authenticateAdmin → controller
 */

// POST /api/admin/create — Crée un nouveau compte administrateur
router.post('/create', authenticateToken, authenticateAdmin, adminController.createAdmin);

// GET /api/admin/users — Récupère la liste de tous les utilisateurs inscrits
router.get('/users', authenticateToken, authenticateAdmin, adminController.getAllUsers);

module.exports = router;