// backend/routes/serviceCategories.js
const express                    = require('express');
const router                     = express.Router();
const serviceCategoryController  = require('../controllers/serviceCategoryController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes du catalogue des prestations
 * Base : /api/service-categories
 */

// GET /api/service-categories        — Services actifs uniquement (public — formulaire de commande)
router.get('/', serviceCategoryController.getAllActiveServiceCategories);

// GET /api/service-categories/admin  — Tous les services avec compteur (admin uniquement)
router.get('/admin', authenticateToken, authenticateAdmin, serviceCategoryController.getAllServiceCategoriesAdmin);

// POST /api/service-categories       — Crée une nouvelle catégorie de service (admin uniquement)
router.post('/', authenticateToken, authenticateAdmin, serviceCategoryController.createServiceCategory);

module.exports = router;