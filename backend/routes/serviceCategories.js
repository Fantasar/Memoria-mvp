const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

// Route publique : services actifs (sans compteur)
router.get('/', serviceCategoryController.getAllActiveServiceCategories);

// Route admin : tous les services (avec compteur)
router.get('/admin', authenticateToken, serviceCategoryController.getAllServiceCategoriesAdmin);

// Créer un service (admin)
router.post('/', authenticateToken, authenticateAdmin, serviceCategoryController.createServiceCategory);

module.exports = router;