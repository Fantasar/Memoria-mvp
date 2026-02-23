// backend/repositories/zoneRepository.js
const pool = require('../config/db');

/**
 * Repository utilitaire pour les données géographiques.
 * Croise les tables cemeteries et orders pour fournir des statistiques
 * sur l'activité dans la zone d'intervention d'un prestataire.
 */

/**
 * Récupère les cimetières situés dans une zone avec leur activité du mois
 * La recherche s'applique sur le département, la ville ou le code postal
 * @param {string} zone - ex: 'Bordeaux', '33', 'Gironde'
 * @returns {Array}
 */
const getCemeteriesInZone = async (zone) => {
  try {
    const result = await pool.query(
      `SELECT
         c.*,
         COUNT(DISTINCT o.id)
           FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days')
           AS missions_last_month
       FROM cemeteries c
       LEFT JOIN orders o ON o.cemetery_id = c.id
       WHERE c.department ILIKE $1
          OR c.city       ILIKE $1
          OR c.postal_code ILIKE $1
       GROUP BY c.id
       ORDER BY c.city, c.name`,
      [`%${zone}%`]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`zoneRepository.getCemeteriesInZone : ${error.message}`);
  }
};

/**
 * Compte le nombre de commandes passées dans une zone sur les 30 derniers jours
 * Permet au prestataire d'estimer le potentiel de missions disponibles
 * @param {string} zone
 * @returns {number}
 */
const countPotentialMissions = async (zone) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM orders o
       JOIN cemeteries c ON o.cemetery_id = c.id
       WHERE (c.department  ILIKE $1
          OR  c.city        ILIKE $1
          OR  c.postal_code ILIKE $1)
         AND o.created_at > NOW() - INTERVAL '30 days'`,
      [`%${zone}%`]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    throw new Error(`zoneRepository.countPotentialMissions : ${error.message}`);
  }
};

/**
 * Récupère les 5 villes les plus actives dans une zone
 * Classées par nombre de cimetières présents
 * @param {string} zone
 * @returns {Array} - [{ city, cemetery_count }, ...]
 */
const getMainCitiesInZone = async (zone) => {
  try {
    // Correction : suppression de la double jointure redondante sur cemeteries
    const result = await pool.query(
      `SELECT
         c.city,
         COUNT(DISTINCT c.id) AS cemetery_count
       FROM cemeteries c
       WHERE c.department  ILIKE $1
          OR c.city        ILIKE $1
          OR c.postal_code ILIKE $1
       GROUP BY c.city
       ORDER BY cemetery_count DESC
       LIMIT 5`,
      [`%${zone}%`]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`zoneRepository.getMainCitiesInZone : ${error.message}`);
  }
};

module.exports = {
  getCemeteriesInZone,
  countPotentialMissions,
  getMainCitiesInZone
};