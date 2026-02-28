// backend/controllers/adminController.js
const authService = require('../services/authService');
const orderService = require('../services/orderService');

/**
 * Contrôleur d'administration.
 * Responsabilité : extraire les données de req, appeler authService, formater res.
 * Restreint aux utilisateurs avec le rôle admin via le middleware authenticateAdmin.
 */

/**
 * Gestion d'erreur uniforme pour ce contrôleur
 */
const handleError = (error, res, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: fallbackMessage }
  });
};

/**
 * @desc    Crée un nouveau compte administrateur
 *          L'email du créateur est tracé dans le log de sécurité du service
 * @route   POST /api/admin/create
 * @access  Admin uniquement
 */
const createAdmin = async (req, res) => {
  try {
    const result = await authService.createAdminUser(
      req.body,
      req.user.email
    );

    return res.status(201).json({
      success: true,
      data: {
        ...result,
        message: 'Compte administrateur créé avec succès'
      }
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la création du compte administrateur');
  }
};

/**
 * @desc    Récupère la liste de tous les utilisateurs inscrits sur la plateforme
 * @route   GET /api/admin/users
 * @access  Admin uniquement
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      data:  users
    });

  } catch (error) {
    return handleError(error, res, 'Erreur lors de la récupération des utilisateurs');
  }
};

/**
 * @desc    Bloque ou débloque un compte utilisateur
 * @route   PATCH /api/admin/users/:id/block
 * @access  Admin uniquement
 */
const toggleBlockUser = async (req, res, next) => {
  try {
    const result = await authService.toggleBlockUser(req.params.id);
    return res.status(200).json({
      success: true,
      data:    result,
      message: result.is_blocked ? 'Compte bloqué' : 'Compte débloqué'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Supprime définitivement un compte utilisateur
 * @route   DELETE /api/admin/users/:id
 * @access  Admin uniquement
 */
const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.params.id, req.user.userId);
    return res.status(200).json({
      success: true,
      message: 'Compte supprimé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Récupère toutes les commandes d'un utilisateur spécifique
 * @route   GET /api/admin/users/:id/orders
 * @access  Admin uniquement
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.params.id, 'admin');
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Erreur dans getUserOrders:', error);
    return handleError(error, res, 'Erreur lors de la récupération des commandes');
  }
};

module.exports = {
  createAdmin,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getUserOrders
};