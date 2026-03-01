// backend/services/crispMessageService.js
const crispMessageRepository = require('../repositories/crispMessageRepository');

/**
 * Service de gestion des messages Crisp.
 * Responsabilité : orchestrer les opérations sur les messages reçus via le webhook Crisp.
 * Appelé exclusivement par crispMessageController.
 */

/**
 * @desc    Enregistre un nouveau message reçu depuis le webhook Crisp
 * @param   {Object} data - Données brutes du webhook Crisp
 * @returns {void}
 */
const receiveWebhook = async (data) => {
  await crispMessageRepository.create(
    data?.session_id || 'unknown',
    data?.user?.email || null,
    data?.user?.nickname || 'Visiteur',
    data?.content || ''
  );
};

/**
 * @desc    Récupère tous les messages Crisp avec le compteur de non-lus
 * @returns {Object} - { messages, unread }
 */
const getMessages = async () => {
  const messages = await crispMessageRepository.findAll();
  const unread   = await crispMessageRepository.countUnread();
  return { messages, unread };
};

/**
 * @desc    Marque un message spécifique comme lu
 * @param   {number} id - Identifiant du message
 * @returns {void}
 */
const markAsRead = async (id) => {
  await crispMessageRepository.markAsRead(id);
};

/**
 * @desc    Marque tous les messages comme lus
 * @returns {void}
 */
const markAllAsRead = async () => {
  await crispMessageRepository.markAllAsRead();
};

/**
 * @desc    Supprime un message spécifique
 * @param   {number} id - Identifiant du message
 * @returns {void}
 */
const deleteOne = async (id) => {
  await crispMessageRepository.deleteOne(id);
};

/**
 * @desc    Supprime tous les messages Crisp
 * @returns {void}
 */
const deleteAll = async () => {
  await crispMessageRepository.deleteAll();
};

module.exports = {
  receiveWebhook,
  getMessages,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAll
};