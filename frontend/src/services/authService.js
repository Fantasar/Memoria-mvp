import api from './api';

const authService = {
  /**
   * Connexion d'un utilisateur existant
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      console.log('📥 Réponse Axios complète:', response);
      console.log('📥 response.data:', response.data);
      
      // Structure backend: { success: true, data: { token, user, message } }
      
      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        console.log('🔑 Token extrait:', token);
        console.log('👤 User extrait:', user);
        
        if (!token) {
          throw new Error('Token manquant dans la réponse');
        }
        
        if (!user) {
          throw new Error('Données utilisateur manquantes');
        }
        
        // Stockage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Stockage réussi');
        console.log('✅ User.role:', user.role);
        
        // IMPORTANT : Retourner { token, user }
        return { token, user };
      }
      
      throw new Error('Structure de réponse invalide');
      
    } catch (error) {
      console.error('❌ Erreur dans authService.login:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Email ou mot de passe incorrect');
      }
      
      throw new Error(error.message || 'Impossible de se connecter au serveur');
    }
  },

  /**
   * Inscription d'un nouveau utilisateur
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      console.log('📥 Réponse register:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        if (!token || !user) {
          throw new Error('Token ou utilisateur manquant');
        }
        
        // Stockage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // IMPORTANT : Retourner { token, user }
        return { token, user };
      }
      
      throw new Error('Structure de réponse invalide');
      
    } catch (error) {
      console.error('❌ Erreur dans authService.register:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || 'Erreur lors de l\'inscription');
      }
      
      throw new Error(error.message || 'Impossible de se connecter au serveur');
    }
  },

  /**
   * Déconnexion
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Récupère l'utilisateur connecté
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur parsing user:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Vérifie si connecté
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Récupère le token
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;