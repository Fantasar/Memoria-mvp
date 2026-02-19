// backend/routes/cemeteries.js
const express = require('express');
const router = express.Router();
const cemeteryController = require('../controllers/cemeteryController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * @route   GET /api/cemeteries
 * @desc    Récupérer la liste des cimetières actifs
 * @access  Public (ou Private si tu veux protéger)
 */
router.get('/', cemeteryController.getAllCemeteries);


/**
 * @route   POST /api/cemeteries
 * @desc    Ajouter un cimetières dans la liste.
 * @access  Admin
 */
router.post('/', authenticateToken, authenticateAdmin, cemeteryController.createCemetery);

module.exports = router;