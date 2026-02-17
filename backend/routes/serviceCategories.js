// backend/routes/serviceCategories.js
const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');
const { authenticateToken } = require('../middlewares/admin-auth');

/**
 * @route   GET /api/service-categories
 * @desc    Récupérer la liste des catégories de services actives
 * @access  Public (ou Private si tu veux protéger)
 */
router.get('/', serviceCategoryController.getAllServiceCategories);

router.get(
  '/admin',
  authenticateToken,
  serviceCategoryController.getAllServiceCategories
);

module.exports = router;