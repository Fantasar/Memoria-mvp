// backend/controllers/providerController.js
const providerService = require('../services/providerService');

/**
 * Contrôleur des prestataires.
 * Responsabilité : extraire les données de req, appeler providerService, formater res.
 * Utilise next(error) pour déléguer la gestion d'erreur au middleware Express global.
 */

/**
 * @desc    Récupère les prestataires en attente de validation admin
 * @route   GET /api/providers/pending
 * @access  Admin uniquement
 */
const getPendingProviders = async (req, res, next) => {
  try {
    const providers = await providerService.getPendingProviders(req.user.userId);

    return res.status(200).json({
      success: true,
      count:   providers.length,
      data:    providers
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Valide un prestataire (activation du compte)
 * @route   PATCH /api/providers/:id/approve
 * @access  Admin uniquement
 */
const approveProvider = async (req, res, next) => {
  try {
    const result = await providerService.approveProvider(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Prestataire validé avec succès'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rejette un prestataire avec un motif obligatoire
 * @route   PATCH /api/providers/:id/reject
 * @access  Admin uniquement
 */
const rejectProvider = async (req, res, next) => {
  try {
    const { reason } = req.body;

    // Validation du motif ici car c'est une règle de format HTTP, pas métier
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_REASON',
          message: 'Le motif doit contenir au moins 10 caractères'
        }
      });
    }

    const result = await providerService.rejectProvider(
      req.params.id,
      req.user.userId,
      reason
    );

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Prestataire rejeté'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupère les statistiques financières du prestataire connecté
 * @route   GET /api/providers/finances
 * @access  Prestataire uniquement
 */
const getProviderFinances = async (req, res, next) => {
  try {
    const finances = await providerService.getProviderFinances(req.user.userId);

    return res.status(200).json({
      success: true,
      data:    finances
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Met à jour la zone d'intervention du prestataire connecté
 * @route   PATCH /api/providers/zone
 * @access  Prestataire uniquement
 */
const updateZone = async (req, res, next) => {
  try {
    const result = await providerService.updateZone(
      req.user.userId,
      req.body.zone_intervention
    );

    return res.status(200).json({
      success: true,
      data:    result,
      message: 'Zone d\'intervention mise à jour'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupère les statistiques géographiques de la zone du prestataire
 * @route   GET /api/providers/zone/stats
 * @access  Prestataire uniquement
 */
const getZoneStats = async (req, res, next) => {
  try {
    const stats = await providerService.getZoneStats(req.user.userId);

    return res.status(200).json({
      success: true,
      data:    stats
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getProviderFinances,
  updateZone,
  getZoneStats
};