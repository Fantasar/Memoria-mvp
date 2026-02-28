// ============================================
// IMPORTS
// ============================================
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ============================================
// CONFIGURATION
// ============================================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ============================================
// ROUTES
// ============================================
const authRoutes            = require('./routes/auth');
const adminRoutes           = require('./routes/admin');
const orderRoutes           = require('./routes/orders');
const cemeteryRoutes        = require('./routes/cemeteries');
const serviceCategoryRoutes = require('./routes/serviceCategories');
const paymentRoutes         = require('./routes/payments');
const photoRoutes           = require('./routes/photoRoutes');
const providerRoutes        = require('./routes/providerRoutes');
const statsRoutes           = require('./routes/statsRoutes');
const notificationRoutes    = require('./routes/notificationRoutes');
const reviewRoutes          = require('./routes/reviewRoutes');
const usersRoutes           = require('./routes/users');
const passwordResetRoutes   = require('./routes/passwordReset');
const webhookRoutes         = require('./routes/webhooks');
const crispMessageRoutes    = require('./routes/crispMessages');

app.use('/api/auth',               authRoutes);
app.use('/api/admin',              adminRoutes);
app.use('/api/orders',             orderRoutes);
app.use('/api/cemeteries',         cemeteryRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/payments',           paymentRoutes);
app.use('/api/photos',             photoRoutes);
app.use('/api/providers',          providerRoutes);
app.use('/api/stats',              statsRoutes);
app.use('/api/notifications',      notificationRoutes);
app.use('/api/reviews',            reviewRoutes);
app.use('/api/users',              usersRoutes);
app.use('/api/auth',               passwordResetRoutes);
app.use('/api/webhooks',           webhookRoutes);
app.use('/api/admin/messages',     crispMessageRoutes);



// ============================================
// ROUTES UTILITAIRES
// ============================================

// Documentation de l'API
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Mémoria",
    version: "1.0.0",
    endpoints: [
      { path: "/api/health",             description: "État du serveur" },
      { path: "/api/auth/register",      description: "Inscription utilisateur" },
      { path: "/api/auth/login",         description: "Connexion utilisateur" },
      { path: "/api/orders",             description: "Gestion des commandes" },
      { path: "/api/cemeteries",         description: "Liste des cimetières" },
      { path: "/api/service-categories", description: "Liste des services" },
      { path: "/api/providers",          description: "Gestion des prestataires" },
      { path: "/api/reviews",            description: "Avis et notations" },
      { path: "/api/notifications",      description: "Notifications utilisateur" },
      { path: "/api/stats",              description: "Statistiques" },
      { path: "/api/users",              description: "Gestion du profil utilisateur" },
    ]
  });
});

// Health check — utilisé par Render pour vérifier que le serveur est actif
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    message: "Serveur opérationnel",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GESTION DES ROUTES NON TROUVÉES
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.path
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
  console.log(`✅ Serveur Mémoria démarré sur le port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});