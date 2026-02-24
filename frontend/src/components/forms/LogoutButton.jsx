// frontend/src/components/forms/LogoutButton.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Bouton de déconnexion réutilisable.
 * Vide la session et redirige vers /login.
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
    >
      Déconnexion
    </button>
  );
}

export default LogoutButton;