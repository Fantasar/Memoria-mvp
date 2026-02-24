// frontend/src/components/layout/AuthLayout.jsx
import logoMemoria from '../../assets/Logos-Mémoria.jpeg';

/**
 * Layout partagé pour les pages d'authentification (Login, Register).
 * Centre le contenu verticalement avec logo, titre et formulaire.
 *
 * @param {string}          title    - Titre de la page (ex: "Connexion")
 * @param {string}          subtitle - Sous-titre descriptif
 * @param {React.ReactNode} children - Formulaire à afficher
 */
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">

        {/* En-tête : logo + titre regroupés */}
        <div className="text-center mb-8">
          <img
            src={logoMemoria}
            alt="Logo Mémoria"
            className="w-20 h-20 object-contain drop-shadow-lg mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;