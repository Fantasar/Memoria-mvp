const pool = require('../config/db');

/**
 * Obtenir les statistiques globales de la plateforme
 */
const getPlatformStats = async () => {
  // 1. Nombre total d'utilisateurs par rôle
  const usersQuery = `
    SELECT 
      r.name as role_name,
      COUNT(u.id) as count
    FROM roles r
    LEFT JOIN users u ON u.role_id = r.id
    GROUP BY r.name
  `;
  const usersResult = await pool.query(usersQuery);

  // 2. Nombre total de commandes par statut
  const ordersQuery = `
    SELECT 
      status,
      COUNT(*) as count
    FROM orders
    GROUP BY status
  `;
  const ordersResult = await pool.query(ordersQuery);

  // 3. Chiffre d'affaires total (commandes payées)
  const revenueQuery = `
    SELECT 
      COALESCE(SUM(price), 0) as total_revenue,
      COUNT(*) as paid_orders_count
    FROM orders
    WHERE status IN ('paid', 'accepted', 'awaiting_validation', 'completed')
  `;
  const revenueResult = await pool.query(revenueQuery);

  // 4. Statistiques paiements
  const paymentsQuery = `
    SELECT 
      payment_type,
      status,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total_amount
    FROM payments
    GROUP BY payment_type, status
  `;
  const paymentsResult = await pool.query(paymentsQuery);

  // 5. Commandes par mois (3 derniers mois)
  const monthlyOrdersQuery = `
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COUNT(*) as count,
      COALESCE(SUM(price), 0) as revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '3 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC
  `;
  const monthlyOrdersResult = await pool.query(monthlyOrdersQuery);

  // 6. Top prestataires
  const topProvidersQuery = `
    SELECT 
      u.prenom,
      u.nom,
      COUNT(o.id) as missions_completed,
      COALESCE(SUM(o.price), 0) as total_earned
    FROM users u
    LEFT JOIN orders o ON o.prestataire_id = u.id AND o.status = 'completed'
    WHERE u.role_id = (SELECT id FROM roles WHERE name = 'prestataire')
    GROUP BY u.id, u.prenom, u.nom
    ORDER BY missions_completed DESC
    LIMIT 5
  `;
  const topProvidersResult = await pool.query(topProvidersQuery);

  // Formatter les résultats
  return {
    users: {
      total: usersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      by_role: usersResult.rows.reduce((acc, row) => {
        acc[row.role_name] = parseInt(row.count);
        return acc;
      }, {})
    },
    orders: {
      total: ordersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      by_status: ordersResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {})
    },
    revenue: {
      total: parseFloat(revenueResult.rows[0].total_revenue),
      paid_orders: parseInt(revenueResult.rows[0].paid_orders_count)
    },
    payments: {
      by_type: paymentsResult.rows.reduce((acc, row) => {
        if (!acc[row.payment_type]) acc[row.payment_type] = {};
        acc[row.payment_type][row.status] = {
          count: parseInt(row.count),
          total_amount: parseFloat(row.total_amount)
        };
        return acc;
      }, {})
    },
    monthly_orders: monthlyOrdersResult.rows.map(row => ({
      month: row.month,
      count: parseInt(row.count),
      revenue: parseFloat(row.revenue)
    })),
    top_providers: topProvidersResult.rows.map(row => ({
      name: `${row.prenom} ${row.nom}`,
      missions_completed: parseInt(row.missions_completed),
      total_earned: parseFloat(row.total_earned)
    }))
  };
};

module.exports = {
  getPlatformStats
};