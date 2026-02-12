const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/admin-auth');

// GET : Liste prestataires en attente
router.get(
  '/pending',
  authenticateToken,
  authenticateAdmin,
  providerController.getPendingProviders
);

// PATCH : Valider prestataire
router.patch(
  '/:id/approve',
  authenticateToken,
  authenticateAdmin,
  providerController.approveProvider
);

// PATCH : Rejeter prestataire
router.patch(
  '/:id/reject',
  authenticateToken,
  authenticateAdmin,
  providerController.rejectProvider
);

module.exports = router;