// ============================================
// IMPORTS
// ============================================
const express = require("express");
const dotenv = require("dotenv")

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
// Parse les requêtes JSON
app.use(express.json());

// ============================================
// ROUTES DE TEST
// ============================================
// Route racine
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API Mémoria",
        version: "1.0.0"
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
});