// frontend/src/components/layout/CrispChat.jsx
import { useEffect } from 'react';

/**
 * Initialise le widget Crisp Chat une seule fois par session navigateur.
 * Met à jour les infos utilisateur à chaque changement de compte.
 * Ne détruit jamais le script — évite les flashs de disparition du widget.
 *
 * @param {Object} user - L'utilisateur connecté depuis useAuth()
 */
function CrispChat({ user }) {
  useEffect(() => {

    // Crisp déjà chargé — on met juste à jour l'utilisateur
    if (window.$crisp) {
      if (user?.email) {
        window.$crisp.push(['set', 'user:email',    [user.email]]);
        window.$crisp.push(['set', 'user:nickname', [`${user.prenom} ${user.nom}`]]);
        window.$crisp.push(['set', 'session:data',  [[['role', user.role]]]]);
      }
      return;
    }

    // Premier chargement uniquement
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = '0cf9eff8-05c8-4386-8dd9-5a113b050a4b';

    const script = document.createElement('script');
    script.src   = 'https://client.crisp.chat/l.js';
    script.async = true;

    script.onload = () => {
      if (user?.email) {
        // Nouvelle session pour cet utilisateur
        window.$crisp.push(['do', 'session:reset']);
        window.$crisp.push(['set', 'user:email',    [user.email]]);
        window.$crisp.push(['set', 'user:nickname', [`${user.prenom} ${user.nom}`]]);
        window.$crisp.push(['set', 'session:data',  [[['role', user.role]]]]);
      }
    };

    document.head.appendChild(script);

    // Pas de cleanup — Crisp doit rester actif toute la session
    // La session est réinitialisée au prochain changement de user?.email

  }, [user?.email]); // Se redéclenche uniquement si l'utilisateur change

  return null;
}

export default CrispChat;