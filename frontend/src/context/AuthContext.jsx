import { createContext, useState, useEffect } from 'react';

// Créer le Context
export const AuthContext = createContext(null);

// Créer le Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Pour éviter flash de contenu

  // Fonction login (après appel API réussi)
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Fonction logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Nettoyer localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Vérifier l'authentification au chargement de l'app
  const checkAuth = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  };

  // Exécuter checkAuth au montage du composant
  useEffect(() => {
    checkAuth();
  }, []);

  // Valeur fournie aux composants enfants
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}