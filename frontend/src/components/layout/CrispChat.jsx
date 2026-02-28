// frontend/src/components/CrispChat.jsx
import { useEffect } from 'react';

/**
 * Initialise le widget Crisp Chat et pré-remplit les infos utilisateur.
 * La session est réinitialisée à chaque changement d'utilisateur
 * pour éviter le mélange de conversations entre comptes.
 * @param {Object} user - L'utilisateur connecté depuis useAuth()
 */
function CrispChat({ user }) {
  useEffect(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = '0cf9eff8-05c8-4386-8dd9-5a113b050a4b';

    const script = document.createElement('script');
    script.src   = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (user?.email) {
        // Réinitialise la session pour cet utilisateur spécifique
        window.$crisp.push(['do', 'session:reset']);

        // Pré-remplit les infos pour identifier l'utilisateur dans Crisp
        window.$crisp.push(['set', 'user:email',    [user.email]]);
        window.$crisp.push(['set', 'user:nickname', [`${user.prenom} ${user.nom}`]]);
        window.$crisp.push(['set', 'session:data',  [[['role', user.role]]]]);
      }
    };

    return () => {
      // Réinitialise la session au démontage (déconnexion)
      if (window.$crisp) {
        window.$crisp.push(['do', 'session:reset']);
      }
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) document.head.removeChild(existingScript);
      delete window.$crisp;
      delete window.CRISP_WEBSITE_ID;
    };
  }, [user?.email]); // ← se déclenche à chaque changement d'utilisateur

  return null;
}

export default CrispChat;