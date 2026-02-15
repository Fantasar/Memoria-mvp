// ============================================
// IMPORTS
// ============================================
const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");

// ============================================
// CONFIGURATION
// ============================================
// Charge les variables du fichier .env
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
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const cemeteryRoutes = require('./routes/cemeteries');
const serviceCategoryRoutes = require('./routes/serviceCategories');
const paymentRoutes = require('./routes/payments');
const photoRoutes = require('./routes/photoRoutes');
const providerRoutes = require('./routes/providerRoutes');
const statsRoutes = require('./routes/statsRoutes');

// ============================================
// UTILISATION DES ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cemeteries', cemeteryRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/stats', statsRoutes);

// ============================================
// ROUTES DE BASE (utilitaires uniquement)
// ============================================
// Route racine - Documentation API
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API Mémoria",
        version: "1.0.0",
        documentation: {
            endpoints: [
                { path: "/api/health", description: "Health check du serveur" },
                { path: "/api/auth/register", description: "Inscription utilisateur" },
                { path: "/api/auth/login", description: "Connexion utilisateur" },
                { path: "/api/admin", description: "Inscription d'un administrateur" },
                { path: "/api/orders", description: "Gestion des commandes" },
                { path: "/api/cemeteries", description: "Liste des cimetières" },
                { path: "/api/service-categories", description: "Liste des services" }
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

// Test de connexion PostgreSQL
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            status: "OK",
            message: "Connexion PostgreSQL réussie",
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Erreur PostgreSQL:', error);
        res.status(500).json({
            status: "ERROR",
            error: "Erreur de connexion à PostgreSQL",
            details: error.message
        });
    }
});

// ============================================
// GESTION DES ROUTES NON TROUVÉES (EN DERNIER)
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
    console.log(`\n[DEV] Serveur tourne sur le port ${PORT}!`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Test PostgreSQL: http://localhost:${PORT}/api/test-db`);
    console.log(`\nAuth endpoints:`);
    console.log(`  - POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  - POST http://localhost:${PORT}/api/auth/login`);
    console.log(`\nAdmin endpoints:`);
    console.log(`  - POST http://localhost:${PORT}/api/admin`);
    console.log(`\nOrder endpoints:`);
    console.log(`  - GET http://localhost:${PORT}/api/cemeteries`);
    console.log(`  - GET http://localhost:${PORT}/api/service-categories`);
    console.log(`  - POST http://localhost:${PORT}/api/orders\n`);
});