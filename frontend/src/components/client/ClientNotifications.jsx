// frontend/src/components/clients/ClientNotifications.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Icône et couleur de fond selon le type de notification
 */
const NOTIFICATION_STYLES = {
  mission_accepted: { icon: '✅', color: 'bg-green-50 border-green-200' },
  photos_available: { icon: '📷', color: 'bg-blue-50 border-blue-200' },
  mission_completed: { icon: '🎉', color: 'bg-purple-50 border-purple-200' },
  dispute_resolved: { icon: '✅', color: 'bg-green-50 border-green-200' },
  refund_processed: { icon: '💸', color: 'bg-orange-50 border-orange-200' },
  correction_requested: { icon: '🔄', color: 'bg-yellow-50 border-yellow-200' },
};

const DEFAULT_STYLE = { icon: '🔔', color: 'bg-gray-50 border-gray-200' };

const getStyle = (type) => NOTIFICATION_STYLES[type] ?? DEFAULT_STYLE;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

/**
 * Panneau de notifications du dashboard client.
 * Permet de filtrer, marquer comme lu et supprimer les notifications.
 *
 * @param {Function} onNotificationRead - Callback pour mettre à jour le badge dans le parent
 */
function ClientNotifications({ onNotificationRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notifications', authHeaders());
      // Le backend retourne { success, data: { notifications, unreadCount } }
      const notifs = response.data.data?.notifications ?? [];
      setNotifications(notifs);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, authHeaders());
      await fetchNotifications();
      onNotificationRead?.();
    } catch {
      // Échec silencieux — la notif reste non lue
    }
  };

  const markAllAsRead = async () => {
    try {
      // PATCH /api/notifications/read-all (pas POST /mark-all-read)
      await axios.patch('/api/notifications/read-all', {}, authHeaders());
      await fetchNotifications();
      onNotificationRead?.();
    } catch {
      // Échec silencieux
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Supprimer cette notification ?')) return;
    try {
      await axios.delete(`/api/notifications/${notificationId}`, authHeaders());
      await fetchNotifications();
      onNotificationRead?.();
    } catch {
      // Échec silencieux
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* En-tête + filtres */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              ✅ Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {['all', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {f === 'all' ? `Toutes (${notifications.length})` : `Non lues (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-xl mb-2">🔔</p>
          <p className="text-gray-600 font-medium">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Vous serez informé des événements importants concernant vos missions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => {
            const style = getStyle(notification.type);
            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition hover:shadow-md ${notification.is_read ? 'bg-white border-gray-200' : style.color
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{style.icon}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{notification.message}</p>

                    <div className="flex gap-2">
                      {notification.order_id && (
                        <button
                          onClick={() => {
                            markAsRead(notification.id);
                            if (
                              notification.type === 'mission_accepted' ||
                              notification.type === 'correction_requested'
                            ) {
                              navigate('/dashboard/client', { state: { section: 'currentMission' } });
                            } else if (
                              notification.type === 'mission_completed' ||
                              notification.type === 'photos_available' ||
                              notification.type === 'dispute_resolved' ||
                              notification.type === 'refund_processed'
                            ) {
                              navigate('/dashboard/client', { state: { section: 'orders' } });
                            } else {
                              navigate('/dashboard/client', { state: { section: 'overview' } });
                            }
                          }}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          Voir la mission →
                        </button>
                      )}

                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          Marquer comme lu
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:underline ml-auto"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClientNotifications;