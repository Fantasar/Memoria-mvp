// frontend/src/services/authService.js
import api from './api';

const authService = {

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.success && response.data?.data) {
        const { token, user } = response.data.data;

        if (!token) throw new Error('Token manquant dans la réponse');
        if (!user)  throw new Error('Données utilisateur manquantes');

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
      }

      throw new Error('Structure de réponse invalide');

    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Email ou mot de passe incorrect');
      }
      throw new Error(error.message || 'Impossible de se connecter au serveur');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data?.success && response.data?.data) {
        const { token, user } = response.data.data;

        if (!token || !user) throw new Error('Token ou utilisateur manquant');

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
      }

      throw new Error('Structure de réponse invalide');

    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || "Erreur lors de l'inscription");
      }
      throw new Error(error.message || 'Impossible de se connecter au serveur');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getToken: () => localStorage.getItem('token'),
};

export default authService;