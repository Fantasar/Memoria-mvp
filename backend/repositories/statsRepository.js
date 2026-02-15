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

/**
 * Obtenir les statistiques d'un prestataire
 */
const getProviderStats = async (providerId) => {
  // 1. Missions par statut
  const missionsQuery = `
    SELECT 
      status,
      COUNT(*) as count
    FROM orders
    WHERE prestataire_id = $1
    GROUP BY status
  `;
  const missionsResult = await pool.query(missionsQuery, [providerId]);

  // 2. CA total (missions complétées)
  const revenueQuery = `
    SELECT 
      COALESCE(SUM(p.amount), 0) as total_earned,
      COUNT(DISTINCT p.order_id) as paid_missions
    FROM payments p
    WHERE p.recipient_id = $1 
      AND p.payment_type = 'provider_transfer'
      AND p.status = 'released'
  `;
  const revenueResult = await pool.query(revenueQuery, [providerId]);

  // 3. Missions par mois (6 derniers mois)
  const monthlyQuery = `
    SELECT 
      TO_CHAR(o.created_at, 'YYYY-MM') as month,
      COUNT(*) as count,
      COALESCE(SUM(
        CASE 
          WHEN o.status = 'completed' THEN o.price * 0.80 
          ELSE 0 
        END
      ), 0) as revenue
    FROM orders o
    WHERE o.prestataire_id = $1
      AND o.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
    ORDER BY month DESC
  `;
  const monthlyResult = await pool.query(monthlyQuery, [providerId]);

  // 4. Missions récentes
  const recentMissionsQuery = `
    SELECT 
      o.id,
      o.status,
      o.price,
      o.created_at,
      c.name as cemetery_name,
      c.city as cemetery_city,
      sc.name as service_name
    FROM orders o
    LEFT JOIN cemeteries c ON o.cemetery_id = c.id
    LEFT JOIN service_categories sc ON o.service_category_id = sc.id
    WHERE o.prestataire_id = $1
    ORDER BY o.created_at DESC
    LIMIT 5
  `;
  const recentMissionsResult = await pool.query(recentMissionsQuery, [providerId]);

  // 5. Taux de complétion
  const totalMissions = missionsResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
  const completedMissions = missionsResult.rows.find(row => row.status === 'completed')?.count || 0;
  const completionRate = totalMissions > 0 ? (parseInt(completedMissions) / totalMissions * 100).toFixed(1) : 0;

  return {
    missions: {
      total: totalMissions,
      by_status: missionsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      completion_rate: parseFloat(completionRate)
    },
    revenue: {
      total_earned: parseFloat(revenueResult.rows[0].total_earned),
      paid_missions: parseInt(revenueResult.rows[0].paid_missions)
    },
    monthly: monthlyResult.rows.map(row => ({
      month: row.month,
      count: parseInt(row.count),
      revenue: parseFloat(row.revenue)
    })),
    recent_missions: recentMissionsResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      price: parseFloat(row.price),
      created_at: row.created_at,
      cemetery_name: row.cemetery_name,
      cemetery_city: row.cemetery_city,
      service_name: row.service_name
    }))
  };
};


module.exports = {
  getPlatformStats,
  getProviderStats
};