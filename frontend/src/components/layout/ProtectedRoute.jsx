import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Composant pour protéger les routes selon l'authentification et le rôle
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composant à rendre si autorisé
 * @param {string[]} props.allowedRoles - Rôles autorisés à accéder à cette route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification du token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si pas authentifié
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si le rôle de l'utilisateur est autorisé
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    const redirectPath = 
      user.role === 'client' ? '/dashboard/client' :
      user.role === 'prestataire' ? '/dashboard/prestataire' :
      user.role === 'admin' ? '/dashboard/admin' :
      '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  // Autoriser l'accès
  return children;
};

export default ProtectedRoute;