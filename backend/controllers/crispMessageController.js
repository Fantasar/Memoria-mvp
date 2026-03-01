// backend/controllers/crispMessageController.js
const crispMessageService = require('../services/crispmessageservice');

/**
 * Contrôleur des messages Crisp.
 * Responsabilité : extraire les données de req, appeler crispMessageService, formater res.
 * Ne contient aucune logique métier — tout est délégué au service.
 */

/**
 * @desc    Reçoit et enregistre un événement depuis le webhook Crisp
 * @route   POST /api/crisp/webhook
 * @access  Public (Crisp uniquement)
 */
const receiveWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    // On ne traite que les messages entrants depuis le chat
    if (event !== 'message:send') return res.status(200).json({ ok: true });
    if (data?.origin !== 'chat') return res.status(200).json({ ok: true });

    await crispMessageService.receiveWebhook(data);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erreur webhook Crisp:', error.message);
    return res.status(500).json({ ok: false });
  }
};

/**
 * @desc    Récupère tous les messages Crisp avec le compteur de non-lus
 * @route   GET /api/admin/messages
 * @access  Admin uniquement
 */
const getMessages = async (req, res) => {
  try {
    const data = await crispMessageService.getMessages();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Marque un message spécifique comme lu
 * @route   PATCH /api/admin/messages/:id
 * @access  Admin uniquement
 */
const markAsRead = async (req, res) => {
  try {
    await crispMessageService.markAsRead(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Marque tous les messages comme lus
 * @route   PATCH /api/admin/messages
 * @access  Admin uniquement
 */
const markAllAsRead = async (req, res) => {
  try {
    await crispMessageService.markAllAsRead();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Supprime un message spécifique
 * @route   DELETE /api/admin/messages/:id
 * @access  Admin uniquement
 */
const deleteOne = async (req, res) => {
  try {
    await crispMessageService.deleteOne(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * @desc    Supprime tous les messages Crisp
 * @route   DELETE /api/admin/messages
 * @access  Admin uniquement
 */
const deleteAll = async (req, res) => {
  try {
    await crispMessageService.deleteAll();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  receiveWebhook,
  getMessages,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAll
};