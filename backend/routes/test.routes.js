const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @route   GET /api/test-db
 * @desc    Tester la connexion à PostgreSQL
 * @access  Public (pour le moment)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Connexion PostgreSQL réussie',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Erreur test DB:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur connexion DB',
      error: error.message
    });
  }
});

module.exports = router;