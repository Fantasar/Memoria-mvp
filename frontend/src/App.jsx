// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages publiques
import Home               from './pages/Home';
import Login              from './pages/Login';
import Register           from './pages/Register';
import About              from './pages/About';
import Contact            from './pages/Contact';
import Services           from './pages/Services';

// Dashboards
import DashboardClient    from './pages/dashboards/DashboardClient';
import DashboardPrestataire from './pages/dashboards/DashboardPrestataire';
import DashboardAdmin     from './pages/dashboards/DashboardAdmin';

// Commandes
import NewOrder           from './pages/orders/NewOrder';
import Checkout           from './pages/orders/Checkout';
import OrderDetails       from './pages/orders/OrderDetails';

// Prestataire
import MesMissions     from './pages/orders/MesMissions';
import CompleteMission from './pages/orders/CompleteMission';

/**
 * Routeur principal de l'application Mémoria.
 * AuthProvider est géré dans main.jsx — ne pas le redéclarer ici.
 *
 * ⚠️ ORDRE CRITIQUE des routes :
 * Les routes statiques (/orders/new, /orders/checkout) doivent être
 * déclarées AVANT les routes dynamiques (/orders/:id)
 */
function App() {
  return (
    <Router>
      <Routes>

        {/* ── Routes publiques ───────────────────────────────────────── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/contact"   element={<Contact />} />
        <Route path="/services"  element={<Services />} />

        {/* ── Routes client ──────────────────────────────────────────── */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardClient />
            </ProtectedRoute>
          }
        />

        {/* ⚠️ Statiques avant dynamiques — /new et /checkout avant /:id */}
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <NewOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/checkout"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* ── Routes prestataire ─────────────────────────────────────── */}
        <Route
          path="/dashboard/prestataire"
          element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <DashboardPrestataire />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-missions"
          element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <MesMissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/missions/:id/complete"
          element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <CompleteMission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/prestataire/pending"
          element={
            <ProtectedRoute allowedRoles={['prestataire']}>
              <DashboardPrestataire />
            </ProtectedRoute>
          }
        />

        {/* ── Routes admin ───────────────────────────────────────────── */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback 404 ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;