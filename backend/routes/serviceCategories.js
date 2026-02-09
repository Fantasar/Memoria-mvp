// backend/routes/serviceCategories.js
const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');

/**
 * @route   GET /api/service-categories
 * @desc    Récupérer la liste des catégories de services actives
 * @access  Public (ou Private si tu veux protéger)
 */
router.get('/', serviceCategoryController.getAllServiceCategories);

module.exports = router;