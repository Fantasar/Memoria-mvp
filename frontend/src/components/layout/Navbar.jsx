// frontend/src/components/layout/Navbar.jsx
import { Link } from 'react-router-dom';

/**
 * Barre de navigation publique — affichée sur la page d'accueil uniquement.
 * Les liens "Services", "À propos" et "Contact" scrollent vers les sections
 * de la page d'accueil via leurs IDs HTML.
 */

/**
 * Navigue vers la page d'accueil puis scrolle vers la section cible.
 * Fonctionne que l'utilisateur soit déjà sur "/" ou non.
 */
const scrollToSection = (sectionId) => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                <span className="text-2xl font-serif font-bold">M</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full" />
              </div>
            </div>
            <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
          </div>

          {/* Liens de navigation desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-900 hover:text-blue-600 font-medium transition"
            >
              Accueil
            </Link>
            <button
              onClick={() => scrollToSection('comment-ca-marche-section')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              À propos
            </button>
            <button
              onClick={() => scrollToSection('team-section')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Contact
            </button>
          </div>

          {/* Connexion / Inscription */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              S'inscrire
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}