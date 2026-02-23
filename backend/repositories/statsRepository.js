// backend/repositories/statsRepository.js
const pool = require('../config/db');

/**
 * Repository de statistiques — lecture seule.
 * Agrège les données de toutes les tables pour alimenter les dashboards.
 * Deux niveaux : statistiques globales plateforme (admin) et statistiques prestataire.
 */

/**
 * Calcule les statistiques globales de la plateforme
 * Les 6 requêtes sont indépendantes, exécutées en parallèle via Promise.all
 * @returns {Object} - { users, orders, revenue, payments, monthly_orders, top_providers }
 */
const getPlatformStats = async () => {
  try {
    const [
      usersResult,
      ordersResult,
      revenueResult,
      paymentsResult,
      monthlyOrdersResult,
      topProvidersResult
    ] = await Promise.all([

      // Nombre d'utilisateurs par rôle
      pool.query(
        `SELECT r.name AS role_name, COUNT(u.id) AS count
         FROM roles r
         LEFT JOIN users u ON u.role_id = r.id
         GROUP BY r.name`
      ),

      // Nombre de commandes par statut
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM orders
         GROUP BY status`
      ),

      // Chiffre d'affaires sur les commandes actives et terminées
      pool.query(
        `SELECT
           COALESCE(SUM(price), 0) AS total_revenue,
           COUNT(*)                 AS paid_orders_count
         FROM orders
         WHERE status IN ('paid', 'accepted', 'awaiting_validation', 'completed')`
      ),

      // Statistiques des paiements par type et statut
      pool.query(
        `SELECT
           payment_type,
           status,
           COUNT(*)                    AS count,
           COALESCE(SUM(amount), 0)    AS total_amount
         FROM payments
         GROUP BY payment_type, status`
      ),

      // Activité mensuelle sur les 3 derniers mois
      pool.query(
        `SELECT
           TO_CHAR(created_at, 'YYYY-MM') AS month,
           COUNT(*)                        AS count,
           COALESCE(SUM(price), 0)         AS revenue
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '3 months'
         GROUP BY TO_CHAR(created_at, 'YYYY-MM')
         ORDER BY month DESC`
      ),

      // Top 5 prestataires par nombre de missions complétées
      pool.query(
        `SELECT
           u.prenom,
           u.nom,
           COUNT(o.id)              AS missions_completed,
           COALESCE(SUM(o.price), 0) AS total_earned
         FROM users u
         LEFT JOIN orders o ON o.prestataire_id = u.id AND o.status = 'completed'
         WHERE u.role_id = (SELECT id FROM roles WHERE name = 'prestataire')
         GROUP BY u.id, u.prenom, u.nom
         ORDER BY missions_completed DESC
         LIMIT 5`
      )
    ]);

    return {
      users: {
        total:   usersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        by_role: usersResult.rows.reduce((acc, row) => {
          acc[row.role_name] = parseInt(row.count);
          return acc;
        }, {})
      },
      orders: {
        total:     ordersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        by_status: ordersResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {})
      },
      revenue: {
        total:       parseFloat(revenueResult.rows[0].total_revenue),
        paid_orders: parseInt(revenueResult.rows[0].paid_orders_count)
      },
      payments: {
        by_type: paymentsResult.rows.reduce((acc, row) => {
          if (!acc[row.payment_type]) acc[row.payment_type] = {};
          acc[row.payment_type][row.status] = {
            count:        parseInt(row.count),
            total_amount: parseFloat(row.total_amount)
          };
          return acc;
        }, {})
      },
      monthly_orders: monthlyOrdersResult.rows.map(row => ({
        month:   row.month,
        count:   parseInt(row.count),
        revenue: parseFloat(row.revenue)
      })),
      top_providers: topProvidersResult.rows.map(row => ({
        name:                `${row.prenom} ${row.nom}`,
        missions_completed:  parseInt(row.missions_completed),
        total_earned:        parseFloat(row.total_earned)
      }))
    };

  } catch (error) {
    throw new Error(`statsRepository.getPlatformStats : ${error.message}`);
  }
};

/**
 * Calcule les statistiques individuelles d'un prestataire
 * Les 4 requêtes sont indépendantes, exécutées en parallèle via Promise.all
 * @param {number} providerId
 * @returns {Object} - { missions, revenue, monthly, recent_missions }
 */
const getProviderStats = async (providerId) => {
  try {
    const [
      missionsResult,
      revenueResult,
      monthlyResult,
      recentMissionsResult
    ] = await Promise.all([

      // Répartition des missions par statut
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM orders
         WHERE prestataire_id = $1
         GROUP BY status`,
        [providerId]
      ),

      // Revenus réels issus des transferts Stripe validés
      pool.query(
        `SELECT
           COALESCE(SUM(p.amount), 0)       AS total_earned,
           COUNT(DISTINCT p.order_id)        AS paid_missions
         FROM payments p
         WHERE p.recipient_id   = $1
           AND p.payment_type   = 'provider_transfer'
           AND p.status         = 'released'`,
        [providerId]
      ),

      // Activité mensuelle sur les 6 derniers mois (80% = part prestataire)
      pool.query(
        `SELECT
           TO_CHAR(o.created_at, 'YYYY-MM') AS month,
           COUNT(*)                          AS count,
           COALESCE(SUM(
             CASE WHEN o.status = 'completed' THEN o.price * 0.80 ELSE 0 END
           ), 0) AS revenue
         FROM orders o
         WHERE o.prestataire_id = $1
           AND o.created_at >= NOW() - INTERVAL '6 months'
         GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
         ORDER BY month DESC`,
        [providerId]
      ),

      // 5 missions les plus récentes pour l'aperçu du dashboard
      pool.query(
        `SELECT
           o.id, o.status, o.price, o.created_at,
           c.name  AS cemetery_name,
           c.city  AS cemetery_city,
           sc.name AS service_name
         FROM orders o
         LEFT JOIN cemeteries c          ON o.cemetery_id         = c.id
         LEFT JOIN service_categories sc ON o.service_category_id = sc.id
         WHERE o.prestataire_id = $1
         ORDER BY o.created_at DESC
         LIMIT 5`,
        [providerId]
      )
    ]);

    // Calcul du taux de complétion
    const totalMissions     = missionsResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const completedMissions = missionsResult.rows.find(row => row.status === 'completed')?.count || 0;
    const completionRate    = totalMissions > 0
      ? parseFloat((parseInt(completedMissions) / totalMissions * 100).toFixed(1))
      : 0;

    return {
      missions: {
        total:           totalMissions,
        completion_rate: completionRate,
        by_status:       missionsResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {})
      },
      revenue: {
        total_earned:  parseFloat(revenueResult.rows[0].total_earned),
        paid_missions: parseInt(revenueResult.rows[0].paid_missions)
      },
      monthly: monthlyResult.rows.map(row => ({
        month:   row.month,
        count:   parseInt(row.count),
        revenue: parseFloat(row.revenue)
      })),
      recent_missions: recentMissionsResult.rows.map(row => ({
        id:            row.id,
        status:        row.status,
        price:         parseFloat(row.price),
        created_at:    row.created_at,
        cemetery_name: row.cemetery_name,
        cemetery_city: row.cemetery_city,
        service_name:  row.service_name
      }))
    };

  } catch (error) {
    throw new Error(`statsRepository.getProviderStats : ${error.message}`);
  }
};

module.exports = {
  getPlatformStats,
  getProviderStats
};