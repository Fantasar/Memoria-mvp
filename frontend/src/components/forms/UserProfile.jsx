// frontend/src/components/forms/UserProfile.jsx
import { useAuth } from '../../hooks/useAuth';

/**
 * Affiche les informations de profil de l'utilisateur connecté.
 * Utilisé comme composant utilitaire — non affiché si non authentifié.
 */
export function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const roleLabel = {
    client:      'Client',
    prestataire: 'Prestataire',
    admin:       'Administrateur'
  };

  return (
    <div>
      <h2>Bienvenue {user.prenom} {user.nom}</h2>
      <p>Email : {user.email}</p>
      <p>Rôle : {roleLabel[user.role] ?? user.role}</p>
    </div>
  );
}

export default UserProfile;