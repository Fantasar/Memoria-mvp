// backend/routes/providerRoutes.js
const express              = require('express');
const router               = express.Router();
const providerController   = require('../controllers/providerController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

/**
 * Routes des prestataires
 * Base : /api/providers
 *
 * ⚠️ ORDRE CRITIQUE : /zone/stats doit être avant /zone
 * et toutes les routes statiques avant /:id
 */

// ─── ROUTES STATIQUES ─────────────────────────────────────────────────────────

// GET   /api/providers/pending      — Prestataires en attente de validation (admin)
router.get('/pending', authenticateToken, authenticateAdmin, providerController.getPendingProviders);

// GET   /api/providers/finances     — Statistiques financières du prestataire connecté
router.get('/finances', authenticateToken, providerController.getProviderFinances);

// GET   /api/providers/zone/stats   — Statistiques géographiques de la zone (prestataire)
// ⚠️ Doit être avant /zone pour ne pas être intercepté comme un sous-paramètre
router.get('/zone/stats', authenticateToken, providerController.getZoneStats);

// PATCH /api/providers/zone         — Met à jour la zone d'intervention (prestataire)
router.patch('/zone', authenticateToken, providerController.updateZone);

// ─── ROUTES DYNAMIQUES (avec :id) ─────────────────────────────────────────────

// PATCH /api/providers/:id/approve  — Valide un prestataire (admin)
router.patch('/:id/approve', authenticateToken, authenticateAdmin, providerController.approveProvider);

// PATCH /api/providers/:id/reject   — Rejette un prestataire avec motif (admin)
router.patch('/:id/reject', authenticateToken, authenticateAdmin, providerController.rejectProvider);

module.exports = router;