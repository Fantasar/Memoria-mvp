// backend/routes/cemeteries.js
const express             = require('express');
const router              = express.Router();
const cemeteryController  = require('../controllers/cemeteryController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des cimetières
 * Base : /api/cemeteries
 */

// GET /api/cemeteries — Liste des cimetières actifs (public — utilisé dans le formulaire de commande)
router.get('/', cemeteryController.getAllCemeteries);

// POST /api/cemeteries — Ajoute un cimetière avec géocodage automatique (admin uniquement)
router.post('/', authenticateToken, authenticateAdmin, cemeteryController.createCemetery);

module.exports = router;