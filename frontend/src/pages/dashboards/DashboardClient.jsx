// frontend/src/pages/dashboards/DashboardClient.jsx
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';

function DashboardClient() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard Client</h1>
          
          {user && (
            <div className="mb-6">
              <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>
              <p className="text-gray-600 text-sm">Email : {user.email}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">🚧 Dashboard Client en construction...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardClient;