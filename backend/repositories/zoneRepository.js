const pool = require('../config/db');

/**
 * Récupérer les cimetières dans une zone
 */
async function getCemeteriesInZone(zone) {
  const query = `
    SELECT 
      c.*,
      COUNT(DISTINCT o.id) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days') as missions_last_month
    FROM cemeteries c
    LEFT JOIN orders o ON o.cemetery_id = c.id
    WHERE c.department ILIKE $1 OR c.city ILIKE $1 OR c.postal_code ILIKE $1
    GROUP BY c.id
    ORDER BY c.city, c.name
  `;
  
  const result = await pool.query(query, [`%${zone}%`]);
  return result.rows;
}

/**
 * Compter les missions potentielles dans une zone (ce mois-ci)
 */
async function countPotentialMissions(zone) {
  const query = `
    SELECT COUNT(*) as count
    FROM orders o
    JOIN cemeteries c ON o.cemetery_id = c.id
    WHERE (c.department ILIKE $1 OR c.city ILIKE $1 OR c.postal_code ILIKE $1)
    AND o.created_at > NOW() - INTERVAL '30 days'
  `;
  
  const result = await pool.query(query, [`%${zone}%`]);
  return parseInt(result.rows[0].count);
}

/**
 * Récupérer les villes principales dans une zone
 */
async function getMainCitiesInZone(zone) {
  const query = `
    SELECT 
      c.city,
      COUNT(DISTINCT cem.id) as cemetery_count
    FROM cemeteries cem
    LEFT JOIN orders o ON o.cemetery_id = cem.id
    JOIN cemeteries c ON c.id = cem.id
    WHERE c.department ILIKE $1 OR c.city ILIKE $1 OR c.postal_code ILIKE $1
    GROUP BY c.city
    ORDER BY cemetery_count DESC
    LIMIT 5
  `;
  
  const result = await pool.query(query, [`%${zone}%`]);
  return result.rows;
}

module.exports = {
  getCemeteriesInZone,
  countPotentialMissions,
  getMainCitiesInZone
};