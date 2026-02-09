// backend/routes/cemeteries.js
const express = require('express');
const router = express.Router();
const cemeteryController = require('../controllers/cemeteryController');

/**
 * @route   GET /api/cemeteries
 * @desc    Récupérer la liste des cimetières actifs
 * @access  Public (ou Private si tu veux protéger)
 */
router.get('/', cemeteryController.getAllCemeteries);

module.exports = router;