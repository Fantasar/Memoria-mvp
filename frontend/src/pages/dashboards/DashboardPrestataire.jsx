// frontend/src/pages/dashboards/DashboardPrestataire.jsx
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';

function DashboardPrestataire() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Header />
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Prestataire</h1>
        
        {user && (
          <div className="mb-6">
            <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>
            <p className="text-gray-600 text-sm">Email : {user.email}</p>
            <p className="text-gray-600 text-sm">Rôle : {user.role}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">🚧 Dashboard Prestataire en construction...</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPrestataire;