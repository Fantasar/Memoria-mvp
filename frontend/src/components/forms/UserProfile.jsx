import { useAuth } from '../../hooks/useAuth';

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Non connecté</p>;
  }

  return (
    <div>
      <h2>Bienvenue {user.prenom} {user.nom}</h2>
      <p>Email : {user.email}</p>
      <p>Rôle : {user.role}</p>
    </div>
  );
}