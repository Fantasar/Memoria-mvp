import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
}