import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoMemoria from '../../assets/Logos_Mémoria-remove.png';
import ZoneMap from '../../components/maps/ZoneMap';


function DashboardPrestataire() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation entre onglets
  const [activeTab, setActiveTab] = useState('overview');
  
  // Missions disponibles
  const [availableMissions, setAvailableMissions] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  
  // Mes missions
  const [myMissions, setMyMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  
  // Calendrier
  const [calendar, setCalendar] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  
  // Historique
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  
  // Finances
  const [finances, setFinances] = useState(null);
  const [loadingFinances, setLoadingFinances] = useState(true);

  //Notification
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  //Zone d'intervention
  const [zoneStats, setZoneStats] = useState(null);
  const [loadingZoneStats, setLoadingZoneStats] = useState(true);
  const [newZone, setNewZone] = useState('');
  const [updatingZone, setUpdatingZone] = useState(false);

  // States pour évaluations
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  // Stats overview
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Modal planification
  const [missionToSchedule, setMissionToSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [schedulingError, setSchedulingError] = useState('');

  // Charger les données au montage
  useEffect(() => {
    fetchStats();
    fetchAvailableMissions();
    fetchMyMissions();
    fetchHistory();
    fetchCalendar();
    fetchFinances();
    fetchNotifications();
    fetchZoneStats();
    fetchReviews();
  }, []);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stats/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAvailableMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableMissions(response.data.data || []);
    } catch (err) {
      console.error('Erreur missions disponibles:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchMyMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMissions(response.data.data || []);
    } catch (err) {
      console.error('Erreur mes missions:', err);
    } finally {
      setLoadingMissions(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.data || []);
    } catch (err) {
      console.error('Erreur historique:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendar(response.data.data || []);
    } catch (err) {
      console.error('Erreur calendrier:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const fetchFinances = async () => {
    setLoadingFinances(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/providers/finances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinances(response.data.data);
    } catch (err) {
      console.error('Erreur finances:', err);
    } finally {
      setLoadingFinances(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data.notifications || []);
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) {
      console.error('Erreur notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchZoneStats = async () => {
    setLoadingZoneStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/providers/zone/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setZoneStats(response.data.data);
      setNewZone(response.data.data.zone); // Pré-remplir avec la zone actuelle
    } catch (err) {
      console.error('Erreur zone stats:', err);
    } finally {
      setLoadingZoneStats(false);
    }
  };

  const handleUpdateZone = async () => {
    if (!newZone || newZone.trim().length < 2) {
      alert('Zone invalide (minimum 2 caractères)');
      return;
    }
  
    setUpdatingZone(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/providers/zone', 
        { zone_intervention: newZone.trim() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Zone d\'intervention mise à jour !');
      fetchZoneStats(); // Recharger les stats
    } catch (err) {
      console.error('Erreur mise à jour zone:', err);
      alert(err.response?.data?.error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingZone(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reviews/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data.data.reviews || []);
      setReviewsStats({
        average_rating: response.data.data.average_rating || 0,
        total_reviews: response.data.data.total_reviews || 0
      });
    } catch (err) {
      console.error('Erreur évaluations:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Erreur marquage toutes:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications(); // Recharger
    } catch (err) {
      console.error('Erreur suppression notification:', err);
    }
  };

  const loadImageAsBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
  });

const exportFinancesPDF = async () => {
  if (!finances) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  /* ================= CONFIG ================= */

  const mainColor = [124, 58, 237]; // Violet doux

  const today = new Date().toLocaleDateString("fr-FR");

  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  /* ================= LOGO ================= */

  const logoBase64 = await loadImageAsBase64(logoMemoria);

  /* ================= HEADER ================= */

  const headerHeight = 36;

  doc.setFillColor(...mainColor);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Logo
  const logoSize = 22;

  doc.addImage(
    logoBase64,
    "PNG",
    15,
    (headerHeight - logoSize) / 2,
    logoSize,
    logoSize
  );

  // Titres
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text("MÉMORIA", pageWidth / 2, 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text("Relevé Financier Prestataire", pageWidth / 2, 25, {
    align: "center",
  });

  /* ================= INFOS ================= */

  let currentY = headerHeight + 18;

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Prestataire : ${user.prenom} ${user.nom}`, 15, currentY);
  currentY += 7;

  doc.text(`SIRET : ${user.siret || "Non renseigné"}`, 15, currentY);
  currentY += 7;

  doc.text(`Date : ${today}`, 15, currentY);
  currentY += 7;

  currentY += 15;

  /* ================= KPI TABLE ================= */

  autoTable(doc, {
    startY: currentY,

    head: [["Indicateur", "Valeur"]],

    body: [
      ["Total perçu", `${finances.total_earned.toFixed(2)} €`],
      ["Missions complétées", finances.missions_completed],
      ["En attente validation", `${finances.pending_validation.toFixed(2)} €`],
      ["Moyenne par mission", `${finances.average_per_mission.toFixed(2)} €`],
    ],

    theme: "grid",

    styles: {
      fontSize: 10,
      cellPadding: 4,
    },

    headStyles: {
      fillColor: mainColor,
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: {
      1: { halign: "right" },
    },
  });

  currentY = doc.lastAutoTable.finalY + 15;

  /* ================= HISTORY TITLE ================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...mainColor);

  doc.text("Historique des paiements", 15, currentY);

  currentY += 6;

  /* ================= HISTORY TABLE ================= */

  autoTable(doc, {
    startY: currentY,

    head: [["Commande", "Date", "Lieu", "Service", "Montant"]],

    body: finances.recent_payments.map((p) => [
      p.order_id || p.id || "-",
      formatDate(p.completed_at || p.updated_at || p.created_at),
      `${p.cemetery_name}, ${p.cemetery_city}`,
      p.service_name,
      `${p.amount_received.toFixed(2)} €`,
    ]),

    theme: "striped",

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: mainColor,
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: {
      0: { cellWidth: 35 }, // Commande
      1: { cellWidth: 28 }, // Date
      2: { cellWidth: 45 }, // Lieu
      3: { cellWidth: 45 }, // Service
      4: {
        cellWidth: 30,
        halign: "right",
        fontStyle: "bold",
        textColor: [34, 197, 94],
      },
    },
  });

  /* ================= FOOTER ================= */

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(8);
    doc.setTextColor(150);

    doc.text(
      `Mémoria © ${new Date().getFullYear()} — Page ${i}/${pageCount}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  /* ================= SAVE ================= */

  const fileDate = new Date().toISOString().split("T")[0];

  doc.save(`memoria-finances-${fileDate}.pdf`);
};

  // ============================================
  // ACTIONS HANDLERS
  // ============================================

const handleAcceptMission = (mission) => {
  console.log('🔍 handleAcceptMission appelée avec:', mission);
  setMissionToSchedule(mission);
  
  // Pré-remplir avec demain par défaut
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  setSelectedDate(tomorrow.toISOString().split('T')[0]);
  setSelectedTime('09:00');
};

const confirmScheduleMission = async () => {
  if (!selectedDate || !selectedTime) {
    setSchedulingError('Date et heure sont obligatoires');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.patch(
      `/api/orders/${missionToSchedule.id}/accept`,
      {
        scheduled_date: selectedDate,
        scheduled_time: selectedTime
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert('Mission acceptée et planifiée !');
    setMissionToSchedule(null);
    setSelectedDate('');
    setSelectedTime('');
    fetchAvailableMissions();
    fetchMyMissions();
    fetchCalendar();
  } catch (err) {
    console.error('Erreur planification:', err);
    setSchedulingError(
      err.response?.data?.error?.message || 'Erreur lors de la planification'
    );
  }
};

  const handleCompleteMission = async (missionId) => {
    if (!window.confirm('Marquer cette mission comme terminée ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/orders/${missionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mission terminée ! En attente de validation.');
      fetchMyMissions();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Erreur');
    }
  };

  // ============================================
  // VARIABLES CALCULEES
  // ============================================

  const filteredHistory = historyFilter === 'all'
  ? history
  : history.filter(order => order.status === historyFilter);
  
  // ============================================
  // SECTIONS CONTENT
  // ============================================

  const sections = {
    overview: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Aperçu de mon activité</h2>

        {loadingStats ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total gagné</h3>
                <p className="text-4xl font-bold mb-2">{stats.revenue.total_earned.toFixed(2)}€</p>
                <div className="text-sm opacity-90">
                  <p>{stats.revenue.paid_missions} paiements reçus</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Missions complétées</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.by_status.completed || 0}</p>
                <div className="text-sm opacity-90">
                  <p>Taux: {stats.missions.completion_rate}%</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">En cours</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.by_status.accepted || 0}</p>
                <div className="text-sm opacity-90">
                  <p>À terminer</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total missions</h3>
                <p className="text-4xl font-bold mb-2">{stats.missions.total}</p>
                <div className="text-sm opacity-90">
                  <p>Depuis le début</p>
                </div>
              </div>
            </div>

            {/* Évolution mensuelle */}
            {stats.monthly?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">📈 Évolution sur 6 mois</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {stats.monthly.map((month, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">{month.month}</p>
                      <p className="text-xl font-bold text-gray-900 mb-1">{month.count}</p>
                      <p className="text-xs text-gray-600 mb-2">missions</p>
                      <p className="text-sm font-semibold text-green-600">{month.revenue.toFixed(0)}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missions récentes */}
            {stats.recent_missions?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🕐 Missions récentes</h3>
                <div className="space-y-3">
                  {stats.recent_missions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/orders/${mission.id}`)}>
                      <div>
                        <p className="font-medium text-gray-900">{mission.cemetery_name}</p>
                        <p className="text-sm text-gray-600">{mission.cemetery_city} • {mission.service_name}</p>
                        <p className="text-xs text-gray-500">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{mission.price}€</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                          mission.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                          mission.status === 'awaiting_validation' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mission.status === 'completed' && '✅ Terminée'}
                          {mission.status === 'accepted' && '🔄 En cours'}
                          {mission.status === 'awaiting_validation' && '⏰ En validation'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-12">Impossible de charger les statistiques</p>
        )}
      </div>
    ),
    calendar: (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Calendrier</h2>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {calendar.length} mission{calendar.length > 1 ? 's' : ''} planifiée{calendar.length > 1 ? 's' : ''}
      </span>
    </div>

    {loadingCalendar ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ) : calendar.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune mission planifiée</p>
        <p className="text-sm text-gray-500 mt-2">
          Acceptez des missions pour les voir apparaître ici
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {/* Grouper par date */}
        {Object.entries(
          calendar.reduce((acc, mission) => {
            const date = mission.scheduled_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(mission);
            return acc;
          }, {})
        ).map(([date, missions]) => (
          <div key={date} className="bg-white border border-gray-200 rounded-lg p-5">
            
            {/* Header date */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b">
              <div className="bg-green-100 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {new Date(date).getDate()}
                </p>
                <p className="text-xs text-green-700">
                  {new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {missions.length} mission{missions.length > 1 ? 's' : ''} planifiée{missions.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Timeline des missions */}
            <div className="space-y-3">
              {missions
                .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                .map(mission => {
                  const startTime = mission.scheduled_time.substring(0, 5);
                  const duration = parseFloat(mission.duration_hours) || 2;
                  const [hours, minutes] = mission.scheduled_time.split(':').map(Number);
                  const endMinutes = hours * 60 + minutes + (duration * 60);
                  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

                  return (
                    <div
                      key={mission.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      {/* Horaire */}
                      <div className="text-center min-w-[80px]">
                        <p className="text-lg font-bold text-green-600">{startTime}</p>
                        <p className="text-xs text-gray-500">↓ {duration}h</p>
                        <p className="text-sm text-gray-600">{endTime}</p>
                      </div>

                      {/* Infos mission */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{mission.cemetery_name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            mission.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            mission.status === 'awaiting_validation' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {mission.status === 'accepted' && '🔄 En cours'}
                            {mission.status === 'awaiting_validation' && '⏰ À valider'}
                            {mission.status === 'completed' && '✅ Terminée'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">📍 {mission.cemetery_city}</p>
                        <p className="text-sm text-gray-600">🔧 {mission.service_name}</p>
                        <p className="text-sm text-gray-600">🪦 {mission.cemetery_location}</p>
                      </div>

                      {/* Rémunération */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Vous recevrez</p>
                        <p className="text-lg font-bold text-green-600">
                          {(parseFloat(mission.price) * 0.8).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
),

    available: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Missions disponibles</h2>

        {loadingAvailable ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : availableMissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune mission disponible dans votre zone</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableMissions.map(mission => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{mission.cemetery_name}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{mission.cemetery_city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{mission.service_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rémunération</p>
                    <p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Créée le</p>
                    <p className="font-medium">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    console.log('🔘 Bouton cliqué !', mission);
                    handleAcceptMission(mission);
                  }} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition"
                >
                  ✓ Accepter et planifier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  
    missions: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Mes missions</h2>

        {loadingMissions ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : myMissions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Vous n'avez pas encore de missions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myMissions.map(mission => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/orders/${mission.id}`)}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{mission.cemetery_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    mission.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    mission.status === 'awaiting_validation' ? 'bg-orange-100 text-orange-800' :
                    mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mission.status === 'accepted' && '🔄 En cours'}
                    {mission.status === 'in_progress' && '🔄 En cours'}
                    {mission.status === 'awaiting_validation' && '⏰ En validation'}
                    {mission.status === 'completed' && '✅ Terminée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{mission.cemetery_city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{mission.service_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rémunération</p>
                    <p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Acceptée le</p>
                    <p className="font-medium">{new Date(mission.accepted_at || mission.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {mission.status === 'accepted' && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate(`/missions/${mission.id}/complete`); 
                    }} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
                  >
                    📸 Terminer et uploader les photos
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    profile: (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Mon profil</h2>

        {/* Carte informations personnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="text-gray-900 font-medium">{user?.prenom || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-gray-900 font-medium">{user?.nom || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 font-medium">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-gray-900 font-medium">{user?.telephone || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        {/* Carte informations professionnelles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Informations professionnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">SIRET</label>
              <p className="text-gray-900 font-medium">{user?.siret || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Zone d'intervention</label>
              <p className="text-gray-900 font-medium">{user?.zone_intervention || 'Non définie'}</p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            Modifier mes informations
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
            Changer mon mot de passe
          </button>
        </div>
      </div>
    ),
    history: (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Historique des missions</h2>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {history.length} mission{history.length > 1 ? 's' : ''} terminée{history.length > 1 ? 's' : ''}
      </span>
    </div>

    {/* Filtres */}
    <div className="flex gap-3 mb-6">
      <button
        onClick={() => setHistoryFilter('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
          historyFilter === 'all'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Toutes ({history.length})
      </button>
      <button
        onClick={() => setHistoryFilter('completed')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
          historyFilter === 'completed'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        ✅ Validées ({history.filter(h => h.status === 'completed').length})
      </button>
      <button
        onClick={() => setHistoryFilter('refunded')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
          historyFilter === 'refunded'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        💸 Remboursées ({history.filter(h => h.status === 'refunded').length})
      </button>
    </div>

    {loadingHistory ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ) : filteredHistory.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune mission dans l'historique</p>
      </div>
    ) : (
      <div className="space-y-4">
        {filteredHistory.map(order => {
          const gainPrestataire = parseFloat(order.price) * 0.8;
          const commission = parseFloat(order.price) * 0.2;

          return (
            <div
              key={order.id}
              onClick={() => setSelectedHistoryOrder(order)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-green-300 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                
                {/* Infos gauche */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.cemetery_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'completed' ? '✅ Validée' : '💸 Remboursée'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    📍 {order.cemetery_city} {order.cemetery_department && `(${order.cemetery_department})`}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    🪦 {order.cemetery_location}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    🔧 {order.service_name}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(order.updated_at).toLocaleDateString('fr-FR')}</span>
                    <span>👤 {order.client_prenom} {order.client_nom}</span>
                  </div>
                </div>

                {/* Montants droite */}
                <div className="text-right ml-6">
                  <p className="text-sm text-gray-500 mb-1">Vous avez reçu</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {gainPrestataire.toFixed(2)}€
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Prix total: {parseFloat(order.price).toFixed(2)}€</p>
                    <p>Commission: {commission.toFixed(2)}€</p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* MODAL DÉTAILS + PHOTOS */}
    {selectedHistoryOrder && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedHistoryOrder(null)}
      >
        <div
          className="bg-white rounded-xl max-w-3xl w-full max-h-screen overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedHistoryOrder.cemetery_name}</h3>
              <p className="text-sm text-gray-500">{selectedHistoryOrder.service_name}</p>
            </div>
            <button
              onClick={() => setSelectedHistoryOrder(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            
            {/* Infos mission */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Informations</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedHistoryOrder.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedHistoryOrder.status === 'completed' ? '✅ Validée' : '💸 Remboursée'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedHistoryOrder.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-medium">{selectedHistoryOrder.client_prenom} {selectedHistoryOrder.client_nom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Localisation</p>
                  <p className="font-medium">{selectedHistoryOrder.cemetery_location}</p>
                </div>
              </div>
            </div>

            {/* Finances */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Finances</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Prix total</p>
                  <p className="text-lg font-bold text-gray-900">{parseFloat(selectedHistoryOrder.price).toFixed(2)}€</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Vous avez reçu (80%)</p>
                  <p className="text-lg font-bold text-green-600">{(parseFloat(selectedHistoryOrder.price) * 0.8).toFixed(2)}€</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Commission (20%)</p>
                  <p className="text-lg font-bold text-purple-600">{(parseFloat(selectedHistoryOrder.price) * 0.2).toFixed(2)}€</p>
                </div>
              </div>
            </div>

            {/* Photos (on les chargera à l'étape suivante) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Photos</h4>
              <p className="text-sm text-gray-500">Chargement des photos à venir...</p>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={() => setSelectedHistoryOrder(null)}
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
),
  finances: (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finances</h2>
          <p className="text-sm text-gray-500 mt-1">Suivi de vos revenus</p>
        </div>
        <button
          onClick={exportFinancesPDF}
          disabled={!finances}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          📄 Export PDF
        </button>
      </div>

      {loadingFinances ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : !finances ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Impossible de charger les données financières</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">💰 Total perçu</p>
              <p className="text-3xl font-bold">{finances.total_earned.toFixed(2)}€</p>
              <p className="text-xs opacity-80 mt-2">{finances.missions_completed} missions</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">⏳ En attente</p>
              <p className="text-3xl font-bold">{finances.pending_validation.toFixed(2)}€</p>
              <p className="text-xs opacity-80 mt-2">Validation admin</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">📊 Moyenne</p>
              <p className="text-3xl font-bold">{finances.average_per_mission.toFixed(2)}€</p>
              <p className="text-xs opacity-80 mt-2">Par mission</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">✅ Complétées</p>
              <p className="text-3xl font-bold">{finances.missions_completed}</p>
              <p className="text-xs opacity-80 mt-2">Missions validées</p>
            </div>
          </div>

          {/* Répartition mensuelle */}
          {finances.monthly_breakdown.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">📈 Répartition mensuelle</h3>
              <div className="space-y-3">
                {finances.monthly_breakdown.map(month => {
                  const monthName = new Date(month.month + '-01').toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long' 
                  });
                  return (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{monthName}</p>
                        <p className="text-sm text-gray-500">{month.count} mission{month.count > 1 ? 's' : ''}</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">{month.revenue.toFixed(2)}€</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique paiements */}
          {finances.recent_payments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💸 Historique des paiements</h3>
              <div className="space-y-3">
                {finances.recent_payments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{payment.cemetery_name}</p>
                      <p className="text-sm text-gray-600">{payment.cemetery_city} • {payment.service_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payment.completed_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Prix total: {payment.price.toFixed(2)}€</p>
                      <p className="text-lg font-bold text-green-600">+{payment.amount_received.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">(80% commission)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finances.recent_payments.length === 0 && finances.missions_completed === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune mission complétée pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">Vos revenus apparaîtront ici une fois vos missions validées</p>
            </div>
          )}
        </>
      )}
    </div>
  ),
  alerts: (
  <div>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Alertes</h2>
        <p className="text-sm text-gray-500 mt-1">Notifications importantes</p>
      </div>
      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          ✓ Tout marquer comme lu
        </button>
      )}
    </div>

    {loadingNotifications ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ) : notifications.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Aucune notification</p>
        <p className="text-sm text-gray-500 mt-2">Vous serez notifié des événements importants ici</p>
      </div>
    ) : (
      <div className="space-y-3">
        {notifications.map(notification => {
          // Déterminer l'icône et la couleur selon le type
          const typeConfig = {
            mission_validated: { icon: '✅', color: 'bg-green-100 border-green-300', iconColor: 'text-green-600' },
            new_mission: { icon: '🆕', color: 'bg-blue-100 border-blue-300', iconColor: 'text-blue-600' },
            dispute: { icon: '🚨', color: 'bg-red-100 border-red-300', iconColor: 'text-red-600' },
            reminder: { icon: '📅', color: 'bg-yellow-100 border-yellow-300', iconColor: 'text-yellow-600' },
            schedule_needed: { icon: '⏰', color: 'bg-orange-100 border-orange-300', iconColor: 'text-orange-600' }
          };

          const config = typeConfig[notification.type] || { 
            icon: '🔔', 
            color: 'bg-gray-100 border-gray-300', 
            iconColor: 'text-gray-600' 
          };

          return (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition ${
                notification.is_read 
                  ? 'bg-white border-gray-200 opacity-70' 
                  : `${config.color} border-2`
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Contenu */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`text-2xl ${config.iconColor}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-gray-900 mb-1 ${!notification.is_read && 'font-bold'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    
                    {/* Détails commande si disponible */}
                    {notification.cemetery_name && (
                      <div className="text-xs text-gray-600 mt-2 p-2 bg-white bg-opacity-50 rounded">
                        <p>📍 {notification.cemetery_name}</p>
                        {notification.service_name && <p>🔧 {notification.service_name}</p>}
                        {notification.price && (
                          <p className="font-medium text-green-600">
                            💰 {(parseFloat(notification.price) * 0.8).toFixed(2)}€
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Marquer comme lu"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
),
zone: (
  <div>
    {/* Header */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Zone d'intervention</h2>
      <p className="text-sm text-gray-500 mt-1">Gérez votre zone géographique de travail</p>
    </div>

    {loadingZoneStats ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ) : !zoneStats ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Impossible de charger les données de zone</p>
      </div>
    ) : (
      <div className="space-y-6">
        
        {/* 1. Modifier la zone */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📍 Votre zone actuelle</h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-green-800">{zoneStats.zone}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Nouvelle zone d'intervention
            </label>
            <input
              type="text"
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              placeholder="Exemples : Gironde, Bordeaux, 33000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500">
              💡 Vous pouvez indiquer un département (Gironde), une ville (Bordeaux) ou un code postal (33000)
            </p>
            <button
              onClick={handleUpdateZone}
              disabled={updatingZone || !newZone || newZone.trim() === zoneStats.zone}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingZone ? 'Mise à jour...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>

        {/* 2. Statistiques */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Votre zone couvre</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Cimetières disponibles</p>
              <p className="text-3xl font-bold">{zoneStats.cemetery_count}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Missions potentielles (30j)</p>
              <p className="text-3xl font-bold">{zoneStats.potential_missions}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Villes principales</p>
              <p className="text-3xl font-bold">{zoneStats.main_cities.length}</p>
            </div>
          </div>

          {zoneStats.main_cities.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">🏙️ Principales villes :</p>
              <p className="text-gray-900 font-medium">
                {zoneStats.main_cities.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* 3. Carte Google Maps */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🗺️ Carte des cimetières</h3>
          
          {zoneStats.cemeteries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun cimetière dans cette zone</p>
              <p className="text-sm text-gray-500 mt-2">
                Essayez d'élargir votre zone d'intervention
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📍 {zoneStats.cemeteries.length} cimetière{zoneStats.cemeteries.length > 1 ? 's' : ''} disponible{zoneStats.cemeteries.length > 1 ? 's' : ''} où vous pouvez intervenir
                </p>
              </div>
              
              {console.log('🎯 AVANT ZoneMap - cemeteries:', zoneStats.cemeteries)}

              <ZoneMap cemeteries={zoneStats.cemeteries} />
            </>
          )}
        </div>

        {/* 4. Liste des cimetières */}
        {zoneStats.cemeteries.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Liste des cimetières</h3>
            
            <div className="space-y-2">
              {zoneStats.cemeteries.map(cemetery => (
                <div
                  key={cemetery.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{cemetery.name}</p>
                    <p className="text-sm text-gray-600">
                      {cemetery.city} ({cemetery.postal_code})
                      {cemetery.department && ` - ${cemetery.department}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {cemetery.missions_last_month || 0} mission{cemetery.missions_last_month > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400">30 derniers jours</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Suggestion d'ajout (bonus) */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-900">🆕 Un cimetière manque ?</h3>
          <p className="text-sm text-orange-800 mb-4">
            Si vous souhaitez intervenir dans un cimetière qui n'apparaît pas dans la liste, 
            contactez l'administrateur pour demander son ajout.
          </p>
          <button
            onClick={() => alert('Fonctionnalité à venir : envoi d\'un email à l\'admin')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
          >
            ✉️ Suggérer un cimetière
          </button>
        </div>

      </div>
    )}
  </div>
  ),
evaluations: (
  <div>
    {/* Header */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Évaluations clients</h2>
      <p className="text-sm text-gray-500 mt-1">Consultez les avis de vos clients</p>
    </div>

    {loadingReviews ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ) : (
      <div className="space-y-6">
        
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Note moyenne */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-2">Note moyenne</p>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-bold">{reviewsStats.average_rating.toFixed(1)}</p>
              <div className="flex flex-col">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-2xl ${star <= Math.round(reviewsStats.average_rating) ? '⭐' : '☆'}`}>
                      {star <= Math.round(reviewsStats.average_rating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-sm opacity-90 mt-1">{reviewsStats.total_reviews} avis</p>
              </div>
            </div>
          </div>

          {/* Répartition */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Répartition des notes</p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviewsStats.total_reviews > 0 ? (count / reviewsStats.total_reviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-8">{rating}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filtres */}
        {reviewsStats.total_reviews > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${reviewFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Tous ({reviewsStats.total_reviews})
            </button>
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              if (count === 0) return null;
              return (
                <button
                  key={rating}
                  onClick={() => setReviewFilter(rating)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${reviewFilter === rating ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {rating}⭐ ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Liste des avis */}
        {reviewsStats.total_reviews === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-xl mb-2">⭐</p>
            <p className="text-gray-600 font-medium">Aucune évaluation pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Vos clients pourront vous évaluer après la validation de leurs missions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter(review => reviewFilter === 'all' || review.rating === reviewFilter)
              .map(review => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {review.client_prenom} {review.client_nom?.charAt(0)}.
                        </p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className="text-lg">
                              {star <= review.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {review.service_name} - {review.cemetery_name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Commentaire */}
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-gray-700 italic">"{review.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

      </div>
    )}
  </div>
)

};

  

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold">M</span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight">Mémoria</span>
            </div>

            {/* Liens navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-gray-900 hover:text-blue-600 font-medium transition">Accueil</button>
              <button onClick={() => navigate('/', { state: { scrollTo: 'comment-ca-marche-section' } })} className="text-gray-700 hover:text-blue-600 transition">Services</button>
              <button onClick={() => navigate('/', { state: { scrollTo: 'faq-section' } })} className="text-gray-700 hover:text-blue-600 transition">À propos</button>
              <button onClick={() => navigate('/', { state: { scrollTo: 'team-section' } })} className="text-gray-700 hover:text-blue-600 transition">Contact</button>
            </div>

            {/* Déconnexion */}
            <div className="flex items-center gap-4">
              <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-1 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition">Déconnexion</button>
            </div>
          </div>
        </div>
      </nav>

      {/* DASHBOARD */}
      <main className="flex-1 flex bg-green-50 gap-6 px-6 py-8 pt-32 w-full">

        {/* Sidebar */}
        <aside className="w-1/3 bg-white border-l-4 border-green-600 rounded-lg p-6 space-y-4 shadow h-fit">
          <p className="text-gray-500 uppercase font-semibold text-sm mb-4">Sections</p>
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Aperçu
          </button>
          <button onClick={() => setActiveTab('available')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'available' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Missions disponibles ({availableMissions.length})
          </button>
          <button onClick={() => setActiveTab('missions')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'missions' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Mes missions ({myMissions.length})
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'calendar' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Calendrier ({calendar.length})
          </button>
          <button onClick={() => setActiveTab('finances')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'finances' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            Finances
          </button>
          <button 
            onClick={() => setActiveTab('alerts')} 
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'alerts' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <span>Alertes</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
          <button onClick={() => setActiveTab('zone')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'zone' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            Zone d'intervention
          </button>
          <button onClick={() => setActiveTab('evaluations')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'evaluations' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span>Évaluations</span>
              {reviewsStats.total_reviews > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {reviewsStats.average_rating.toFixed(1)}★
                </span>
              )}
            </div>
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Historique ({history.length})
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}>
            Profil
          </button>
        </aside>

        {/* Contenu */}
        <section className="flex-1 bg-white border-r-4 border-green-600 rounded-lg p-6 shadow">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Dashboard Prestataire</h1>
            {user && (
              <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>
            )}
          </div>

          {/* Contenu dynamique */}
          {sections[activeTab]}
        </section>

      </main>
      
{/* ===== MODAL PLANIFICATION ===== */}
{missionToSchedule && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={() => {
      setMissionToSchedule(null);
      setSelectedDate('');
      setSelectedTime('');
    }}
  >
    <div
      className="bg-white rounded-xl max-w-md w-full shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-bold text-gray-900">Planifier l'intervention</h3>
        <button
          onClick={() => {
            setMissionToSchedule(null);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Mission info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-900">{missionToSchedule.cemetery_name}</p>
          <p className="text-sm text-gray-600">{missionToSchedule.service_name}</p>
          <p className="text-sm text-green-600 font-medium mt-2">
            Durée estimée : {missionToSchedule.duration_hours || 2}h
          </p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'intervention <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            📅 Maximum 15 jours à l'avance
          </p>
        </div>

        {/* Heure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure de début <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const hour = i + 7; // 7h à 18h
              return ['00', '30'].map(minutes => {
                const time = `${String(hour).padStart(2, '0')}:${minutes}`;
                return (
                  <option key={time} value={time}>
                    {time}
                  </option>
                );
              });
            }).flat()}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            🕐 Horaires : 7h00 - 19h00 (la mission doit se terminer avant 19h)
          </p>
        </div>

        {/* Aperçu */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            📍 Intervention prévue le{' '}
            <strong>{new Date(selectedDate).toLocaleDateString('fr-FR')}</strong> à{' '}
            <strong>{selectedTime}</strong>
          </p>
        </div>
      </div>

      <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">
        <button
          onClick={() => {
            setMissionToSchedule(null);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          Annuler
        </button>
        <button
          onClick={confirmScheduleMission}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          ✅ Confirmer
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DashboardPrestataire;