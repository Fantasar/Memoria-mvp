import axios from 'axios';

// Configuration de base de l'instance Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL de votre backend
  timeout: 10000, // 10 secondes max pour une requête
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requêtes : ajoute automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    // Récupère le token depuis le localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponses : gestion centralisée des erreurs
api.interceptors.response.use(
  (response) => {
    // Si la réponse est OK (2xx), on la retourne directement
    return response;
  },
  (error) => {
    // Gestion des erreurs HTTP
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      switch (error.response.status) {
        case 401:
          // Token invalide ou expiré
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès interdit');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error('Erreur:', error.response.data.error?.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse reçue
      console.error('Pas de réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;