import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards
import DashboardClient from './pages/dashboards/DashboardClient';
import DashboardPrestataire from './pages/dashboards/DashboardPrestataire';
import DashboardAdmin from './pages/dashboards/DashboardAdmin';

// Order
import NewOrder from './pages/orders/NewOrder';
import OrderDetails from './pages/orders/OrderDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées - Client */}
          <Route 
            path="/dashboard/client" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <DashboardClient />
              </ProtectedRoute>
            } 
          />

          {/* Route protégée - Nouvelle commande (Client uniquement) */}
          <Route 
            path="/orders/new" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <NewOrder />
              </ProtectedRoute>
            } 
          />
          
          {/* Route protégée - Détails commande (Client uniquement) */}
          <Route 
            path="/orders/:id" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />

          {/* Routes protégées - Prestataire */}
          <Route 
            path="/dashboard/prestataire" 
            element={
              <ProtectedRoute allowedRoles={['prestataire']}>
                <DashboardPrestataire />
              </ProtectedRoute>
            } 
          />

          {/* Routes protégées - Admin */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } 
          />

          {/* Route 404 - Redirection vers accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;