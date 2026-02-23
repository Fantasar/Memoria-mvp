// backend/repositories/providerRepository.js
const pool = require('../config/db');

/**
 * Repository des statistiques prestataire.
 * Calcule les revenus en appliquant la commission plateforme de 20%
 * (le prestataire perçoit 80% du prix de chaque commande validée).
 * Utilisé par le dashboard prestataire pour l'onglet statistiques financières.
 */

/**
 * Récupère les statistiques financières complètes d'un prestataire
 * @param {number} prestataireId
 * @returns {Object} - { total_earned, missions_completed, pending_validation,
 *                       average_per_mission, monthly_breakdown, recent_payments }
 */
const getProviderFinancialStats = async (prestataireId) => {
  try {
    // Les 4 requêtes sont indépendantes — on les exécute en parallèle
    const [totalResult, pendingResult, monthlyResult, paymentsResult] = await Promise.all([

      // Revenus totaux sur les missions terminées et validées
      pool.query(
        `SELECT
           COALESCE(SUM(price * 0.80), 0) AS total_earned,
           COUNT(*)                        AS missions_completed
         FROM orders
         WHERE prestataire_id = $1
           AND status = 'completed'`,
        [prestataireId]
      ),

      // Revenus en attente de validation admin
      pool.query(
        `SELECT COALESCE(SUM(price * 0.80), 0) AS pending_validation
         FROM orders
         WHERE prestataire_id = $1
           AND status = 'awaiting_validation'`,
        [prestataireId]
      ),

      // Répartition des revenus sur les 6 derniers mois
      pool.query(
        `SELECT
           TO_CHAR(completed_at, 'YYYY-MM') AS month,
           COUNT(*)                          AS count,
           SUM(price * 0.80)                 AS revenue
         FROM orders
         WHERE prestataire_id = $1
           AND status = 'completed'
           AND completed_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
         ORDER BY month DESC`,
        [prestataireId]
      ),

      // Historique des 20 derniers paiements reçus
      pool.query(
        `SELECT
           o.id,
           o.price,
           (o.price * 0.80) AS amount_received,
           o.completed_at,
           c.name           AS cemetery_name,
           c.city           AS cemetery_city,
           sc.name          AS service_name
         FROM orders o
         LEFT JOIN cemeteries c        ON o.cemetery_id = c.id
         LEFT JOIN service_categories sc ON o.service_category_id = sc.id
         WHERE o.prestataire_id = $1
           AND o.status = 'completed'
         ORDER BY o.completed_at DESC
         LIMIT 20`,
        [prestataireId]
      )
    ]);

    const totalEarned       = parseFloat(totalResult.rows[0].total_earned);
    const missionsCompleted = parseInt(totalResult.rows[0].missions_completed);
    const pendingValidation = parseFloat(pendingResult.rows[0].pending_validation);

    return {
      total_earned:        totalEarned,
      missions_completed:  missionsCompleted,
      pending_validation:  pendingValidation,
      // Évite la division par zéro si aucune mission terminée
      average_per_mission: missionsCompleted > 0
        ? Math.round((totalEarned / missionsCompleted) * 100) / 100
        : 0,
      monthly_breakdown: monthlyResult.rows.map(row => ({
        month:   row.month,
        count:   parseInt(row.count),
        revenue: parseFloat(row.revenue)
      })),
      recent_payments: paymentsResult.rows.map(row => ({
        id:             row.id,
        price:          parseFloat(row.price),
        amount_received: parseFloat(row.amount_received),
        completed_at:   row.completed_at,
        cemetery_name:  row.cemetery_name,
        cemetery_city:  row.cemetery_city,
        service_name:   row.service_name
      }))
    };

  } catch (error) {
    throw new Error(`providerRepository.getProviderFinancialStats : ${error.message}`);
  }
};

module.exports = { getProviderFinancialStats };