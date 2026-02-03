// ============================================
// IMPORTS
// ============================================
const express = require("express");
const dotenv = require("dotenv")
const db = require("./config/db")
const cors = require("cors");

// ============================================
// CONFIGURATION
// ============================================
//Charge les variables du fichier .env
dotenv.config();

const app = express();
// Port depuis .env ou 5500 par défaut
const PORT = process.env.PORT || 5500;

// ============================================
// MIDDLEWARES
// ============================================
// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL du frontend Vite
  credentials: true
}));

// Parse les requêtes JSON
app.use(express.json());

// ============================================
// IMPORT DES ROUTES
// ============================================
const testRoutes = require('./routes/test.routes');
const dataRoutes = require('./routes/data.routes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

// ============================================
// UTILISATION DES ROUTES
// ============================================
app.use('/api/test', testRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// ROUTES DE BASE
// ============================================
// Route racine - Documentation API
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API Mémoria",
        version: "1.0.0",
        documentation: {
            endpoints: [
                { path: "/api/health", description: "Health check du serveur" },
                { path: "/api/test", description: "Test de connexion backend" },
                { path: "/api/data", description: "Test de lecture PostgreSQL"},
                { path:"/api/auth/register", description: "Inscription utilisateur"},
                { path: "/api/auth/login", description: "Connexion utilisateur"},
                { path: "/api/admin", description: "Inscription d'un administrateur"}
            ]
        }
    });
});

// Route de santé (health check)
app.get('/api/health', (req, res) => {
    res.json({
        status: "OK",
        message: "Le serveur fonctionne correctement",
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
  console.log(`[DEV] Serveur tourne sur le port ${PORT}!`);
  console.log(`URL: http://localhost:${PORT}!`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test PostgreSQL: http://localhost:${PORT}/api/data`);
  console.log(`Auth endpoints:`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Admin endpoints:`);
  console.log(`  - POST http://localhost:${PORT}/api/admin`);
});