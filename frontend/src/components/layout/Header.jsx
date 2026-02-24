// frontend/src/components/layout/Header.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * En-tête de l'application — affiché uniquement pour les utilisateurs connectés.
 * Navigation adaptée selon le rôle (client, prestataire, admin).
 */
function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Invisible sur les pages publiques (login, register, home)
  if (!isAuthenticated) return null;

  const labelByRole = {
    client:      'Espace Client',
    prestataire: 'Espace Prestataire',
    admin:       'Administration'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Gauche : logo + navigation + label rôle */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Mémoria</h1>

          <nav className="flex items-center gap-4">
            {user?.role === 'client' && (
              <>
                <Link
                  to="/dashboard/client"
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Mes commandes
                </Link>
                <Link
                  to="/orders/new"
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Nouvelle commande
                </Link>
              </>
            )}

            {user?.role === 'prestataire' && (
              <>
                <Link
                  to="/dashboard/prestataire"
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Missions disponibles
                </Link>
                <Link
                  to="/mes-missions"
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Mes missions
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/dashboard/admin"
                className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Tableau de bord
              </Link>
            )}
          </nav>

          <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">
            {labelByRole[user?.role]}
          </span>
        </div>

        {/* Droite : nom utilisateur + déconnexion */}
        <div className="flex items-center gap-4">
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

      </div>
    </header>
  );
}

export default Header;