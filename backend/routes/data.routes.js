// backend/routes/data.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @route   GET /api/data
 * @desc    Route de test pour lire des données depuis PostgreSQL
 * @access  Public (pour le moment)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.status(200).json({
      success: true,
      message: 'Lecture PostgreSQL réussie',
      data: {
        timestamp: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version
      }
    });
  } catch (error) {
    console.error('Erreur lecture PostgreSQL:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la lecture en base de données'
    });
  }
});

module.exports = router;