import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'client':      return '/dashboard/client';
      case 'prestataire': return '/dashboard/prestataire';
      case 'admin':       return '/dashboard/admin';
      default:            return '/';
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-[28px] w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black rounded-lg flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-serif font-bold">M</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full" />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-serif font-semibold tracking-tight">Mémoria</span>
          </Link>

          {/* ── Liens desktop ── */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/"          className="text-gray-900 hover:text-blue-600 font-medium transition">Accueil</Link>
            <Link to="/services"  className="text-gray-700 hover:text-blue-600 transition">Services</Link>
            <Link to="/a-propos"  className="text-gray-700 hover:text-blue-600 transition">À propos</Link>
            <Link to="/contact"   className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
          </div>

          {/* ── Boutons desktop ── */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="text-gray-700 hover:text-blue-600 font-medium transition">
                  Tableau de bord
                </Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">Connexion</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* ── Bouton hamburger mobile ── */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

        </div>
      </div>

      {/* ── Menu mobile déroulant ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-4">
          <Link to="/"         onClick={closeMenu} className="text-gray-800 font-medium py-2 border-b border-gray-100">Accueil</Link>
          <Link to="/services" onClick={closeMenu} className="text-gray-700 py-2 border-b border-gray-100">Services</Link>
          <Link to="/a-propos" onClick={closeMenu} className="text-gray-700 py-2 border-b border-gray-100">À propos</Link>
          <Link to="/contact"  onClick={closeMenu} className="text-gray-700 py-2 border-b border-gray-100">Contact</Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} onClick={closeMenu} className="text-blue-600 font-medium py-2 border-b border-gray-100">
                Tableau de bord
              </Link>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition w-full">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={closeMenu} className="text-gray-700 py-2 border-b border-gray-100">Connexion</Link>
              <Link to="/register" onClick={closeMenu} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-center">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}