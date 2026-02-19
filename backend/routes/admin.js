// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * @route   POST /api/admin/create
 * @desc    Créer un nouveau compte administrateur
 * @access  Private (Admin only)
 * 
 * Middlewares chain:
 * 1. authenticateToken → Vérifie le JWT et extrait req.user
 * 2. authenticateAdmin → Vérifie que req.user.role === 'admin'
 * 3. adminController.createAdmin → Crée l'admin
 */
router.post('/', authenticateToken, authenticateAdmin, adminController.createAdmin);

/**
 * @route   GET /api/admin//users
 * @desc    Récupère la liste des utilisateurs inscrit sur la plateforme
 * @access  Private (Admin only)
 */
router.get('/users', authenticateToken, authenticateAdmin, adminController.getAllUsers);


module.exports = router;