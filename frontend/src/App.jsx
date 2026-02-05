import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/dashboards/DashboardClient';
import DashboardPrestataire from './pages/dashboards/DashboardPrestataire';
import DashboardAdmin from './pages/dashboards/DashboardAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        /*
        {/* Routes privées */}
        <Route path="/dashboard/client" element={<DashboardClient />} />
        <Route path="/dashboard/prestataire" element={<DashboardPrestataire />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />

        {/* Route 404 */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;