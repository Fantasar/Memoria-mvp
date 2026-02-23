// backend/repositories/cemeteryRepository.js
const pool = require('../config/db');

/**
 * Repository de la table `cemeteries`.
 * Gère les cimetières de la zone pilote Nouvelle-Aquitaine.
 * Utilisé lors de la création de commande et dans les recherches géographiques.
 */

/**
 * Récupère tous les cimetières actifs, triés par département puis ville
 * @returns {Array} - [{ id, name, city, postal_code, department }, ...]
 */
const findAllActive = async () => {
  try {
    const result = await pool.query(
      `SELECT id, name, city, postal_code, department
       FROM cemeteries
       WHERE is_active = true
       ORDER BY department, city, name`
    );
    return result.rows;
  } catch (error) {
    throw new Error(`cemeteryRepository.findAllActive : ${error.message}`);
  }
};

/**
 * Récupère un cimetière par son ID
 * @param {number} cemeteryId
 * @returns {Object|undefined}
 */
const findById = async (cemeteryId) => {
  try {
    const result = await pool.query(
      `SELECT id, name, city, postal_code, department, address, latitude, longitude
       FROM cemeteries
       WHERE id = $1 AND is_active = true`,
      [cemeteryId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`cemeteryRepository.findById : ${error.message}`);
  }
};

/**
 * Vérifie qu'un cimetière existe et est actif
 * Utilisé pour valider l'id_cemetery avant création d'une commande
 * @param {number} cemeteryId
 * @returns {boolean}
 */
const existsById = async (cemeteryId) => {
  try {
    const result = await pool.query(
      `SELECT EXISTS(
         SELECT 1 FROM cemeteries
         WHERE id = $1 AND is_active = true
       ) AS exists`,
      [cemeteryId]
    );
    return result.rows[0].exists;
  } catch (error) {
    throw new Error(`cemeteryRepository.existsById : ${error.message}`);
  }
};

/**
 * Crée un nouveau cimetière (usage admin uniquement)
 * @param {Object} data - { name, city, postal_code, department, latitude, longitude, address }
 * @returns {Object} - Le cimetière créé
 */
const createCemetery = async ({ name, city, postal_code, department, latitude, longitude, address }) => {
  try {
    const result = await pool.query(
      `INSERT INTO cemeteries (name, city, postal_code, department, latitude, longitude, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, city, postal_code, department, address, latitude, longitude`,
      [
        name,
        city,
        postal_code,
        department || null,
        latitude   || null,
        longitude  || null,
        address    || null
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`cemeteryRepository.createCemetery : ${error.message}`);
  }
};

module.exports = {
  findAllActive,
  findById,
  existsById,
  createCemetery
};