// frontend/src/components/layout/Header.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * En-tête de l'application — affiché uniquement pour les utilisateurs connectés.
 * Navigation adaptée selon le rôle (client, prestataire, admin).
 */
function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  if (!isAuthenticated) return null;

  const labelByRole = {
    client:      'Espace Client',
    prestataire: 'Espace Prestataire',
    admin:       'Administration',
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">

        {/* ── Ligne principale ── */}
        <div className="flex justify-between items-center">

          {/* Gauche : logo + label rôle */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Mémoria</h1>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center gap-4 ml-4">
              {user?.role === 'client' && (
                <>
                  <Link to="/dashboard/client" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
                    Mes commandes
                  </Link>
                  <Link to="/orders/new" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
                    Nouvelle commande
                  </Link>
                </>
              )}
              {user?.role === 'prestataire' && (
                <>
                  <Link to="/dashboard/prestataire" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
                    Missions disponibles
                  </Link>
                  <Link to="/mes-missions" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
                    Mes missions
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/dashboard/admin" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
                  Tableau de bord
                </Link>
              )}
            </nav>

            <span className="hidden sm:block text-xs text-gray-500 border-l border-gray-300 pl-3 ml-1">
              {labelByRole[user?.role]}
            </span>
          </div>

          {/* Droite desktop : nom + déconnexion */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-700">
              👤 {user?.prenom} {user?.nom}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition"
            >
              Déconnexion
            </button>
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* ── Menu mobile déroulant ── */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 flex flex-col gap-3">

            <span className="text-xs text-gray-500">👤 {user?.prenom} {user?.nom} — {labelByRole[user?.role]}</span>

            {user?.role === 'client' && (
              <>
                <Link to="/dashboard/client" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 hover:text-blue-600 font-medium py-1">
                  Mes commandes
                </Link>
                <Link to="/orders/new" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 hover:text-blue-600 font-medium py-1">
                  Nouvelle commande
                </Link>
              </>
            )}
            {user?.role === 'prestataire' && (
              <>
                <Link to="/dashboard/prestataire" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 hover:text-blue-600 font-medium py-1">
                  Missions disponibles
                </Link>
                <Link to="/mes-missions" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 hover:text-blue-600 font-medium py-1">
                  Mes missions
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/dashboard/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700 hover:text-blue-600 font-medium py-1">
                Tableau de bord
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition w-full mt-1"
            >
              Déconnexion
            </button>
          </div>
        )}

      </div>
    </header>
  );
}

export default Header;