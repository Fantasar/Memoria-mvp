import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ajustez le chemin selon votre structure

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth(); // Récupère l'état de connexion, la fonction de déconnexion et les infos utilisateur
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Détermine le chemin du tableau de bord en fonction du rôle de l'utilisateur
  const getDashboardPath = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'client':
        return '/dashboard/client';
      case 'prestataire':
        return '/dashboard/prestataire';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative">
              <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                <span className="text-2xl font-serif font-bold">M</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full" />
              </div>
            </div>
            <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
          </Link>

          {/* Liens de navigation desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-900 hover:text-blue-600 font-medium transition">
              Accueil
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <Link to="/a-propos" className="text-gray-700 hover:text-blue-600 transition">
              À propos
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
          </div>

          {/* Connexion / Inscription ou Tableau de bord + Déconnexion */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Tableau de bord
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Connexion
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
