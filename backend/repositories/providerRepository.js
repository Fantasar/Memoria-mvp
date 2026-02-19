const pool = require('../config/db');

/**
 * Récupérer les statistiques financières d'un prestataire
 */
async function getProviderFinancialStats(prestatairId) {
  // CA total (missions completed)
  const totalQuery = await pool.query(
    `SELECT 
       COALESCE(SUM(price * 0.80), 0) as total_earned,
       COUNT(*) as missions_completed
     FROM orders
     WHERE prestataire_id = $1 AND status = 'completed'`,
    [prestatairId]
  );

  // En attente de validation
  const pendingQuery = await pool.query(
    `SELECT COALESCE(SUM(price * 0.80), 0) as pending_validation
     FROM orders
     WHERE prestataire_id = $1 AND status = 'awaiting_validation'`,
    [prestatairId]
  );

  // Répartition mensuelle (6 derniers mois)
  const monthlyQuery = await pool.query(
    `SELECT 
       TO_CHAR(completed_at, 'YYYY-MM') as month,
       COUNT(*) as count,
       SUM(price * 0.80) as revenue
     FROM orders
     WHERE prestataire_id = $1 
       AND status = 'completed'
       AND completed_at >= NOW() - INTERVAL '6 months'
     GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
     ORDER BY month DESC`,
    [prestatairId]
  );

  // Historique des paiements (missions validées)
  const paymentsQuery = await pool.query(
    `SELECT 
       o.id,
       o.price,
       (o.price * 0.80) as amount_received,
       o.completed_at,
       c.name as cemetery_name,
       c.city as cemetery_city,
       sc.name as service_name
     FROM orders o
     LEFT JOIN cemeteries c ON o.cemetery_id = c.id
     LEFT JOIN service_categories sc ON o.service_category_id = sc.id
     WHERE o.prestataire_id = $1 
       AND o.status = 'completed'
     ORDER BY o.completed_at DESC
     LIMIT 20`,
    [prestatairId]
  );

  const totalEarned = parseFloat(totalQuery.rows[0].total_earned);
  const missionsCompleted = parseInt(totalQuery.rows[0].missions_completed);
  const pendingValidation = parseFloat(pendingQuery.rows[0].pending_validation);

  return {
    total_earned: totalEarned,
    missions_completed: missionsCompleted,
    pending_validation: pendingValidation,
    average_per_mission: missionsCompleted > 0 ? totalEarned / missionsCompleted : 0,
    monthly_breakdown: monthlyQuery.rows.map(row => ({
      month: row.month,
      count: parseInt(row.count),
      revenue: parseFloat(row.revenue)
    })),
    recent_payments: paymentsQuery.rows.map(row => ({
      id: row.id,
      price: parseFloat(row.price),
      amount_received: parseFloat(row.amount_received),
      completed_at: row.completed_at,
      cemetery_name: row.cemetery_name,
      cemetery_city: row.cemetery_city,
      service_name: row.service_name
    }))
  };
}

module.exports = {
  getProviderFinancialStats
};