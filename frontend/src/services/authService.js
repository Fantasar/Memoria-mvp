import api from './api';

/**
 * Service d'authentification pour Mémoria
 * Gère les appels API pour l'inscription, la connexion et la déconnexion
 */

const authService = {
  /**
   * Inscription d'un nouveau utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @param {string} userData.email - Email de l'utilisateur
   * @param {string} userData.password - Mot de passe
   * @param {string} userData.role - Rôle (client, prestataire, admin)
   * @param {string} [userData.prenom] - Prénom (optionnel)
   * @param {string} [userData.nom] - Nom (optionnel)
   * @param {string} [userData.zone_intervention] - Zone pour les prestataires (optionnel)
   * @returns {Promise<Object>} - { token, user }
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Si l'inscription réussit, on stocke le token et les infos user
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Gestion des erreurs spécifiques à l'inscription
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Erreur lors de l\'inscription');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  },

  /**
   * Connexion d'un utilisateur existant
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - { token, user }
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Stockage du token et des infos utilisateur
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      // Gestion des erreurs spécifiques à la connexion
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Email ou mot de passe incorrect');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  },

  /**
   * Déconnexion de l'utilisateur
   * Supprime le token et les données utilisateur du localStorage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Récupère l'utilisateur actuellement connecté depuis le localStorage
   * @returns {Object|null} - Objet user ou null si non connecté
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Vérifie si un utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token; // Retourne true si le token existe
  },

  /**
   * Récupère le token JWT du localStorage
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;