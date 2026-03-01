/**
 * Point d'entrée de l'application Mémoria
 * Monte le composant racine dans le DOM et fournit le contexte d'authentification global
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Configure l'URL de base globale pour tous les appels axios directs (production Render)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider enveloppe toute l'application pour partager l'état d'authentification */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);