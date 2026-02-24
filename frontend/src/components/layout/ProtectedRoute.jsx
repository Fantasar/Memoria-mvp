// frontend/src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protège une route selon l'authentification et le rôle utilisateur.
 * - Affiche un spinner pendant la restauration de session (localStorage)
 * - Redirige vers /login si non authentifié
 * - Redirige vers le dashboard du rôle si accès non autorisé
 *
 * @param {React.ReactNode} children     - Page à afficher si accès autorisé
 * @param {string[]}        allowedRoles - Rôles autorisés (optionnel — si absent, tout utilisateur connecté passe)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Attend que localStorage soit lu avant de décider
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Non authentifié — redirige vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rôle non autorisé — redirige vers le dashboard approprié
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardByRole = {
      client:      '/dashboard/client',
      prestataire: '/dashboard/prestataire',
      admin:       '/dashboard/admin'
    };
    const redirectPath = dashboardByRole[user.role] ?? '/';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;