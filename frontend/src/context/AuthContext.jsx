// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * Fournit le contexte d'authentification à toute l'application.
 * Persiste la session dans localStorage et la restaure au démarrage.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true le temps de lire localStorage

  /**
   * Connecte l'utilisateur et persiste la session dans localStorage
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Déconnecte l'utilisateur et vide la session
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Restaure la session depuis localStorage au démarrage de l'app.
   * Le try/catch protège contre un JSON corrompu en localStorage
   * qui ferait crasher toute l'application.
   */
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Session corrompue — on repart proprement
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: user !== null, // Déduit de user, pas d'état séparé
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook d'accès au contexte d'authentification.
 * Doit être utilisé dans un composant enfant de AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};