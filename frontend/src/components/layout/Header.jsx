import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null; // Ne rien afficher si pas connecté
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Mémoria</h1>
          <span className="text-sm text-gray-600">
            {user?.role === 'client' && 'Espace Client'}
            {user?.role === 'prestataire' && 'Espace Prestataire'}
            {user?.role === 'admin' && 'Administration'}
          </span>
        </div>

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