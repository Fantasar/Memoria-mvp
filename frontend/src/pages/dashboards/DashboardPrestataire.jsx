// frontend/src/pages/dashboards/DashboardPrestataire.jsx
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoMemoria from '../../assets/Logos_Mémoria-remove.png';
import ZoneMap from '../../components/maps/ZoneMap';
import Navbar from '../../components/layout/Navbar';
import CrispChat from '../../components/layout/CrispChat';

/** Génère les headers d'authentification JWT depuis le localStorage */
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Sections de la navbar — extraites pour éviter de les redéclarer à chaque render
const NAV_TABS = [
  { key: 'overview', label: ' Aperçu' },
  { key: 'available', label: ' Missions disponibles' },
  { key: 'missions', label: ' Mes missions' },
  { key: 'calendar', label: ' Calendrier' },
  { key: 'finances', label: ' Finances' },
  { key: 'alerts', label: ' Alertes' },
  { key: 'zone', label: " Zone d'intervention" },
  { key: 'evaluations', label: ' Évaluations' },
  { key: 'history', label: ' Historique' },
  { key: 'documents', label: ' Documents' },
  { key: 'profile', label: ' Profil' },
];

function DashboardPrestataire() {
  const { user, logout, token, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Données
  const [availableMissions, setAvailableMissions] = useState([]);
  const [myMissions, setMyMissions] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [history, setHistory] = useState([]);
  const [finances, setFinances] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [zoneStats, setZoneStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [reapplySuccess, setReapplySuccess] = useState(null);
  const [reapplyError, setReapplyError] = useState(null);

  // Loadings
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingFinances, setLoadingFinances] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingZoneStats, setLoadingZoneStats] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // UI states
  const [unreadCount, setUnreadCount] = useState(0);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewsStats, setReviewsStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [newZone, setNewZone] = useState('');
  const [updatingZone, setUpdatingZone] = useState(false);
  const [zoneError, setZoneError] = useState(null);
  const [zoneSuccess, setZoneSuccess] = useState(false);

  // Modal planification
  const [missionToSchedule, setMissionToSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [schedulingError, setSchedulingError] = useState('');

  // Modal pour les modification de profil
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({ prenom: '', nom: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Modal de composant pour exporter les documents vers l'admin
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('rib');
  const [docLabel, setDocLabel] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState(null);
  const [docSuccess, setDocSuccess] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchAvailableMissions();
    fetchMyMissions();
    fetchHistory();
    fetchCalendar();
    fetchFinances();
    fetchZoneStats();
    fetchReviews();
    fetchDocuments();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // ─── Fetch functions ───────────────────────────────────────────────────────

  /** Récupère les statistiques du prestataire (missions, revenus, note moyenne) */
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats/provider', authHeaders());
      setStats(res.data.data);
    } catch { /* silencieux */ } finally { setLoadingStats(false); }
  };

  /** Récupère les missions disponibles à accepter dans la zone d'intervention */
  const fetchAvailableMissions = async () => {
    try {
      const res = await axios.get('/api/orders/available', authHeaders());
      setAvailableMissions(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingAvailable(false); }
  };

  /** Récupère les missions en cours du prestataire connecté */
  const fetchMyMissions = async () => {
    try {
      const res = await axios.get('/api/orders', authHeaders());
      setMyMissions(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingMissions(false); }
  };

  /** Récupère l'historique des missions terminées ou annulées */
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/orders/history', authHeaders());
      setHistory(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingHistory(false); }
  };

  /** Récupère le calendrier des interventions planifiées */
  const fetchCalendar = async () => {
    try {
      const res = await axios.get('/api/orders/calendar', authHeaders());
      setCalendar(res.data.data || []);
    } catch { /* silencieux */ } finally { setLoadingCalendar(false); }
  };

  /** Récupère les données financières du prestataire (gains, paiements en attente) */
  const fetchFinances = async () => {
    setLoadingFinances(true);
    try {
      const res = await axios.get('/api/providers/finances', authHeaders());
      setFinances(res.data.data);
    } catch { /* silencieux */ } finally { setLoadingFinances(false); }
  };

  /** Récupère les notifications — appelé toutes les 10 secondes via setInterval */
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await axios.get('/api/notifications', authHeaders());
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unread_count || 0);
    } catch { /* silencieux */ } finally { setLoadingNotifications(false); }
  };

  /** Récupère les statistiques et la zone d'intervention du prestataire */
  const fetchZoneStats = async () => {
    setLoadingZoneStats(true);
    try {
      const res = await axios.get('/api/providers/zone/stats', authHeaders());
      setZoneStats(res.data.data);
      setNewZone(res.data.data.zone);
    } catch { /* silencieux */ } finally { setLoadingZoneStats(false); }
  };

  /** Récupère les évaluations reçues avec la note moyenne et le total */
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get('/api/reviews/provider', authHeaders());
      setReviews(res.data.data.reviews || []);
      setReviewsStats({
        average_rating: res.data.data.average_rating || 0,
        total_reviews: res.data.data.total_reviews || 0
      });
    } catch { /* silencieux */ } finally { setLoadingReviews(false); }
  };

  /** Récupère les documents administratifs uploadés par le prestataire */
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get('/api/documents/me', authHeaders());
      setDocuments(res.data.data || []);
    } catch {
      // Échec silencieux
    } finally {
      setLoadingDocs(false);
    }
  };

  // ─── Handlers notifications ────────────────────────────────────────────────

  /** Marque une notification spécifique comme lue */
  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, authHeaders());
      fetchNotifications();
    } catch { /* silencieux */ }
  };

  /** Marque toutes les notifications non lues comme lues */
  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, authHeaders());
      fetchNotifications();
    } catch { /* silencieux */ }
  };

  /** Supprime une notification après confirmation */
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    try {
      await axios.delete(`/api/notifications/${id}`, authHeaders());
      fetchNotifications();
    } catch { /* silencieux */ }
  };

  // ─── Handler zone ──────────────────────────────────────────────────────────

  /** Met à jour la zone d'intervention du prestataire — minimum 2 caractères */
  const handleUpdateZone = async () => {
    if (!newZone || newZone.trim().length < 2) {
      setZoneError('Zone invalide (minimum 2 caractères)');
      return;
    }
    setUpdatingZone(true);
    setZoneError(null);
    setZoneSuccess(false);
    try {
      await axios.patch('/api/providers/zone',
        { zone_intervention: newZone.trim() },
        authHeaders()
      );
      setZoneSuccess(true);
      await fetchZoneStats();
    } catch (err) {
      setZoneError(err.response?.data?.error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingZone(false);
    }
  };

  // ─── Handler planification ─────────────────────────────────────────────────

  /** Ouvre le modal de planification pour une mission disponible */
  const handleAcceptMission = (mission) => {
    setMissionToSchedule(mission);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTime('09:00');
    setSchedulingError('');
  };

  /** Ferme le modal de planification et réinitialise les états associés */
  const closePlanificationModal = () => {
    setMissionToSchedule(null);
    setSelectedDate('');
    setSelectedTime('');
    setSchedulingError('');
  };

  /** Confirme la planification et envoie la date/heure au backend */
  const confirmScheduleMission = async () => {
    if (!selectedDate || !selectedTime) {
      setSchedulingError('Date et heure sont obligatoires');
      return;
    }
    try {
      await axios.patch(
        `/api/orders/${missionToSchedule.id}/accept`,
        { scheduled_date: selectedDate, scheduled_time: selectedTime },
        authHeaders()
      );
      closePlanificationModal();
      fetchAvailableMissions();
      fetchMyMissions();
      fetchCalendar();
    } catch (err) {
      setSchedulingError(
        err.response?.data?.error?.message || 'Erreur lors de la planification'
      );
    }
  };

  // ─── Export PDF finances ───────────────────────────────────────────────────

  /**
  * Charge une image distante et la convertit en base64 via un canvas
  * Nécessaire pour intégrer le logo Mémoria dans le PDF généré par jsPDF
  */
  const loadImageAsBase64 = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
    });

  /**
  * Génère et télécharge un relevé financier PDF pour le prestataire
  * Inclut les statistiques globales et l'historique des paiements
  */
  const exportFinancesPDF = async () => {
    if (!finances) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const mainColor = [124, 58, 237];
    const today = new Date().toLocaleDateString('fr-FR');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : 'Non renseignée';

    const logoBase64 = await loadImageAsBase64(logoMemoria);

    doc.setFillColor(...mainColor);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 7, 22, 22);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MÉMORIA', pageWidth / 2, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Relevé Financier Prestataire', pageWidth / 2, 25, { align: 'center' });

    let y = 54;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Prestataire : ${user.prenom} ${user.nom}`, 15, y); y += 7;
    doc.text(`SIRET : ${user.siret || 'Non renseigné'}`, 15, y); y += 7;
    doc.text(`Date : ${today}`, 15, y); y += 15;

    autoTable(doc, {
      startY: y,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Total perçu', `${finances.total_earned.toFixed(2)} €`],
        ['Missions complétées', finances.missions_completed],
        ['En attente validation', `${finances.pending_validation.toFixed(2)} €`],
        ['Moyenne par mission', `${finances.average_per_mission.toFixed(2)} €`],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: mainColor, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...mainColor);
    doc.text('Historique des paiements', 15, y); y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Commande', 'Date', 'Lieu', 'Service', 'Montant']],
      body: finances.recent_payments.map(p => [
        p.order_id || p.id || '-',
        formatDate(p.completed_at || p.updated_at || p.created_at),
        `${p.cemetery_name}, ${p.cemetery_city}`,
        p.service_name,
        `${p.amount_received.toFixed(2)} €`
      ]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: mainColor, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 35 }, 1: { cellWidth: 28 },
        2: { cellWidth: 45 }, 3: { cellWidth: 45 },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [34, 197, 94] }
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Mémoria © ${new Date().getFullYear()} — Page ${i}/${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`memoria-finances-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ─── Spinner helper ────────────────────────────────────────────────────────

  /** Composant spinner réutilisable affiché pendant les chargements */
  const Spinner = () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  );

  // Applique le filtre actif sur l'historique des missions
  const filteredHistory = historyFilter === 'all'
    ? history
    : history.filter(o => o.status === historyFilter);

  // ─── Rendu des sections ────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeTab) {

      case 'overview': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Aperçu de mon activité</h2>
          {loadingStats ? <Spinner /> : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total gagné', value: `${stats.revenue.total_earned.toFixed(2)}€`, sub: `${stats.revenue.paid_missions} paiements reçus`, from: 'from-green-500', to: 'to-green-600' },
                  { label: 'Missions complétées', value: stats.missions.by_status.completed || 0, sub: `Taux: ${stats.missions.completion_rate}%`, from: 'from-blue-500', to: 'to-blue-600' },
                  { label: 'En cours', value: stats.missions.by_status.accepted || 0, sub: 'À terminer', from: 'from-orange-500', to: 'to-orange-600' },
                  { label: 'Total missions', value: stats.missions.total, sub: 'Depuis le début', from: 'from-purple-500', to: 'to-purple-600' },
                ].map(kpi => (
                  <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-lg shadow-lg p-6 text-white`}>
                    <h3 className="text-sm font-medium opacity-90 mb-2">{kpi.label}</h3>
                    <p className="text-4xl font-bold mb-2">{kpi.value}</p>
                    <p className="text-sm opacity-90">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {stats.monthly?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">📈 Évolution sur 6 mois</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {stats.monthly.map((month, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">{month.month}</p>
                        <p className="text-xl font-bold text-gray-900 mb-1">{month.count}</p>
                        <p className="text-xs text-gray-600 mb-2">missions</p>
                        <p className="text-sm font-semibold text-green-600">{month.revenue.toFixed(0)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.recent_missions?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🕐 Missions récentes</h3>
                  <div className="space-y-3">
                    {stats.recent_missions.map(mission => (
                      <div key={mission.id} onClick={() => navigate(`/orders/${mission.id}`)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md transition">
                        <div>
                          <p className="font-medium text-gray-900">{mission.cemetery_name}</p>
                          <p className="text-sm text-gray-600">{mission.cemetery_city} • {mission.service_name}</p>
                          <p className="text-xs text-gray-500">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{mission.price}€</p>
                          <span className={`text-xs px-2 py-1 rounded ${mission.status === 'completed' ? 'bg-green-100 text-green-800' :
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
      );

      case 'calendar': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Calendrier</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {calendar.length} mission{calendar.length > 1 ? 's' : ''} planifiée{calendar.length > 1 ? 's' : ''}
            </span>
          </div>
          {loadingCalendar ? <Spinner /> : calendar.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune mission planifiée</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                calendar.reduce((acc, m) => {
                  if (!acc[m.scheduled_date]) acc[m.scheduled_date] = [];
                  acc[m.scheduled_date].push(m);
                  return acc;
                }, {})
              ).map(([date, missions]) => (
                <div key={date} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <div className="bg-green-100 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{new Date(date).getDate()}</p>
                      <p className="text-xs text-green-700">{new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{missions.length} mission{missions.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[...missions].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)).map(mission => {
                      const startTime = mission.scheduled_time.substring(0, 5);
                      const duration = parseFloat(mission.duration_hours) || 2;
                      const [h, m] = mission.scheduled_time.split(':').map(Number);
                      const endMin = h * 60 + m + duration * 60;
                      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
                      return (
                        <div key={mission.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center min-w-[80px]">
                            <p className="text-lg font-bold text-green-600">{startTime}</p>
                            <p className="text-xs text-gray-500">↓ {duration}h</p>
                            <p className="text-sm text-gray-600">{endTime}</p>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{mission.cemetery_name}</h4>
                            <p className="text-sm text-gray-600">📍 {mission.cemetery_city}</p>
                            <p className="text-sm text-gray-600">🔧 {mission.service_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Vous recevrez</p>
                            <p className="text-lg font-bold text-green-600">{(parseFloat(mission.price) * 0.8).toFixed(2)}€</p>
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
      );

      case 'available': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Missions disponibles</h2>
          {loadingAvailable ? <Spinner /> : availableMissions.length === 0 ? (
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
                    <div><p className="text-sm text-gray-500">Ville</p><p className="font-medium">{mission.cemetery_city}</p></div>
                    <div><p className="text-sm text-gray-500">Service</p><p className="font-medium">{mission.service_name}</p></div>
                    <div><p className="text-sm text-gray-500">Rémunération</p><p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p></div>
                    <div><p className="text-sm text-gray-500">Créée le</p><p className="font-medium">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                  {mission.comment && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">💬 Instructions du client</p>
                      <p className="text-sm text-blue-900">{mission.comment}</p>
                    </div>
                  )}
                  <button onClick={() => handleAcceptMission(mission)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition">
                    ✓ Accepter et planifier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'missions': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mes missions</h2>
          {loadingMissions ? <Spinner /> : myMissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Vous n'avez pas encore de missions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myMissions.map(mission => (
                <div key={mission.id} onClick={() => navigate(`/orders/${mission.id}`)}
                  className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">{mission.cemetery_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${mission.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                      mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        mission.status === 'awaiting_validation' ? 'bg-orange-100 text-orange-800' :
                          mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                            mission.status === 'correction_requested' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                      }`}>
                      {mission.status === 'accepted' && '🔄 En cours'}
                      {mission.status === 'in_progress' && '🔄 En cours'}
                      {mission.status === 'awaiting_validation' && '⏰ En validation'}
                      {mission.status === 'completed' && '✅ Terminée'}
                      {mission.status === 'correction_requested' && '⚠️ Correction demandée'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-sm text-gray-500">Ville</p><p className="font-medium">{mission.cemetery_city}</p></div>
                    <div><p className="text-sm text-gray-500">Service</p><p className="font-medium">{mission.service_name}</p></div>
                    <div><p className="text-sm text-gray-500">Rémunération</p><p className="font-medium text-green-600">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p></div>
                    <div><p className="text-sm text-gray-500">Acceptée le</p><p className="font-medium">{new Date(mission.accepted_at || mission.created_at).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                  {(mission.status === 'accepted' || mission.status === 'correction_requested') && (
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/missions/${mission.id}/complete`); }}
                      className={`w-full ${mission.status === 'correction_requested' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-3 rounded-lg font-medium transition`}>
                      {mission.status === 'correction_requested'
                        ? '🔄 Corriger et re-uploader les photos'
                        : '📸 Terminer et uploader les photos'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'history': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Historique des missions</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {history.length} mission{history.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-3 mb-6">
            {['all', 'completed', 'refunded'].map(f => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${historyFilter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                {f === 'all' && `Toutes (${history.length})`}
                {f === 'completed' && `✅ Validées (${history.filter(h => h.status === 'completed').length})`}
                {f === 'refunded' && `💸 Remboursées (${history.filter(h => h.status === 'refunded').length})`}
              </button>
            ))}
          </div>
          {loadingHistory ? <Spinner /> : filteredHistory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune mission dans l'historique</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map(order => (
                <div key={order.id} onClick={() => setSelectedHistoryOrder(order)}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-green-300 transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.cemetery_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status === 'completed' ? '✅ Validée' : '💸 Remboursée'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">📍 {order.cemetery_city}</p>
                      <p className="text-sm text-gray-600">🔧 {order.service_name}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(order.updated_at).toLocaleDateString('fr-FR')} · 👤 {order.client_prenom} {order.client_nom}
                      </p>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-sm text-gray-500 mb-1">Vous avez reçu</p>
                      <p className="text-2xl font-bold text-green-600">{(parseFloat(order.price) * 0.8).toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">Commission: {(parseFloat(order.price) * 0.2).toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal détail historique */}
          {selectedHistoryOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedHistoryOrder(null)}>
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-screen overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-xl font-bold">{selectedHistoryOrder.cemetery_name}</h3>
                    <p className="text-sm text-gray-500">{selectedHistoryOrder.service_name}</p>
                  </div>
                  <button onClick={() => setSelectedHistoryOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500">Client</p><p className="font-medium">{selectedHistoryOrder.client_prenom} {selectedHistoryOrder.client_nom}</p></div>
                      <div><p className="text-gray-500">Date</p><p className="font-medium">{new Date(selectedHistoryOrder.updated_at).toLocaleDateString('fr-FR')}</p></div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded p-3"><p className="text-xs text-gray-500 mb-1">Prix total</p><p className="text-lg font-bold">{parseFloat(selectedHistoryOrder.price).toFixed(2)}€</p></div>
                      <div className="bg-white rounded p-3"><p className="text-xs text-gray-500 mb-1">Vous avez reçu</p><p className="text-lg font-bold text-green-600">{(parseFloat(selectedHistoryOrder.price) * 0.8).toFixed(2)}€</p></div>
                      <div className="bg-white rounded p-3"><p className="text-xs text-gray-500 mb-1">Commission</p><p className="text-lg font-bold text-purple-600">{(parseFloat(selectedHistoryOrder.price) * 0.2).toFixed(2)}€</p></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                  <button onClick={() => setSelectedHistoryOrder(null)}
                    className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

      case 'finances': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Finances</h2>
              <p className="text-sm text-gray-500 mt-1">Suivi de vos revenus</p>
            </div>
            <button onClick={exportFinancesPDF} disabled={!finances}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50">
              📄 Export PDF
            </button>
          </div>
          {loadingFinances ? <Spinner /> : !finances ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Impossible de charger les données financières</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: '💰 Total perçu', value: `${finances.total_earned.toFixed(2)}€`, sub: `${finances.missions_completed} missions`, from: 'from-green-500', to: 'to-green-600' },
                  { label: '⏳ En attente', value: `${finances.pending_validation.toFixed(2)}€`, sub: 'Validation admin', from: 'from-orange-500', to: 'to-orange-600' },
                  { label: '📊 Moyenne', value: `${finances.average_per_mission.toFixed(2)}€`, sub: 'Par mission', from: 'from-blue-500', to: 'to-blue-600' },
                  { label: '✅ Complétées', value: finances.missions_completed, sub: 'Missions validées', from: 'from-purple-500', to: 'to-purple-600' },
                ].map(kpi => (
                  <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-lg p-6 text-white shadow-lg`}>
                    <p className="text-sm opacity-90 mb-2">{kpi.label}</p>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                    <p className="text-xs opacity-80 mt-2">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {finances.monthly_breakdown?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4">📈 Répartition mensuelle</h3>
                  <div className="space-y-3">
                    {finances.monthly_breakdown.map(month => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(month.month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                          <p className="text-sm text-gray-500">{month.count} mission{month.count > 1 ? 's' : ''}</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">{month.revenue.toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finances.recent_payments?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">💸 Historique des paiements</h3>
                  <div className="space-y-3">
                    {finances.recent_payments.map(payment => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{payment.cemetery_name}</p>
                          <p className="text-sm text-gray-600">{payment.cemetery_city} • {payment.service_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(payment.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Prix total: {payment.price.toFixed(2)}€</p>
                          <p className="text-lg font-bold text-green-600">+{payment.amount_received.toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );

      case 'alerts': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Alertes</h2>
              <p className="text-sm text-gray-500 mt-1">Notifications importantes</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                ✓ Tout marquer comme lu
              </button>
            )}
          </div>
          {loadingNotifications ? <Spinner /> : notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => {
                const TYPE_CONFIG = {
                  mission_validated: { icon: '✅', color: 'bg-green-100 border-green-300' },
                  new_mission: { icon: '🆕', color: 'bg-blue-100 border-blue-300' },
                  dispute: { icon: '🚨', color: 'bg-red-100 border-red-300' },
                  reminder: { icon: '📅', color: 'bg-yellow-100 border-yellow-300' },
                  schedule_needed: { icon: '⏰', color: 'bg-orange-100 border-orange-300' },
                  account_pending: { icon: '⏳', color: 'bg-yellow-100 border-yellow-300' },
                  account_validated: { icon: '✅', color: 'bg-green-100 border-green-300' },
                  account_rejected: { icon: '❌', color: 'bg-red-100 border-red-300' },
                };
                const cfg = TYPE_CONFIG[notif.type] ?? { icon: '🔔', color: 'bg-gray-100 border-gray-300' };
                return (
                  <div key={notif.id} className={`border rounded-lg p-4 transition ${notif.is_read ? 'bg-white border-gray-200 opacity-70' : `${cfg.color} border-2`}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 mb-1 ${!notif.is_read && 'font-bold'}`}>{notif.title}</h3>
                          <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
                          <p className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          {/* Bouton refaire une demande — rejet uniquement */}
                          {notif.type === 'account_rejected' && (
                            <div className="mt-3">
                              {reapplySuccess && (
                                <p className="text-green-700 text-sm mb-2">{reapplySuccess}</p>
                              )}
                              {reapplyError && (
                                <p className="text-red-700 text-sm mb-2">{reapplyError}</p>
                              )}
                              {!reapplySuccess && (
                                <button
                                  onClick={async () => {
                                    setReapplyError(null);
                                    try {
                                      await axios.patch('/api/providers/reapply', {}, authHeaders());
                                      setReapplySuccess('Demande renvoyée. Un administrateur va l\'examiner sous 24-48h.');
                                      handleMarkAsRead(notif.id);
                                    } catch (err) {
                                      setReapplyError(err.response?.data?.error?.message || 'Erreur lors de la demande');
                                    }
                                  }}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                  🔄 Refaire une demande
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notif.is_read && (
                          <button onClick={() => handleMarkAsRead(notif.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Marquer comme lu">✓</button>
                        )}
                        <button onClick={() => handleDeleteNotification(notif.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

      case 'zone': return (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Zone d'intervention</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez votre zone géographique de travail</p>
          </div>
          {loadingZoneStats ? <Spinner /> : !zoneStats ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Impossible de charger les données de zone</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📍 Votre zone actuelle</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-2xl font-bold text-green-800">{zoneStats.zone}</p>
                </div>
                {zoneError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{zoneError}</p></div>}
                {zoneSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">✅ Zone mise à jour avec succès !</p></div>}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Nouvelle zone d'intervention</label>
                  <input type="text" value={newZone} onChange={e => setNewZone(e.target.value)}
                    placeholder="Ex: Gironde, Bordeaux, 33000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={handleUpdateZone} disabled={updatingZone || !newZone || newZone.trim() === zoneStats.zone}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {updatingZone ? 'Mise à jour...' : '💾 Sauvegarder'}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Votre zone couvre</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Cimetières disponibles', value: zoneStats.cemetery_count, from: 'from-green-500', to: 'to-green-600' },
                    { label: 'Missions potentielles (30j)', value: zoneStats.potential_missions, from: 'from-blue-500', to: 'to-blue-600' },
                    { label: 'Villes principales', value: zoneStats.main_cities.length, from: 'from-purple-500', to: 'to-purple-600' },
                  ].map(kpi => (
                    <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-lg p-4 text-white`}>
                      <p className="text-sm opacity-90 mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold">{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {zoneStats.cemeteries.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🗺️ Carte des cimetières</h3>
                  <ZoneMap cemeteries={zoneStats.cemeteries} />
                </div>
              )}
            </div>
          )}
        </div>
      );

      case 'evaluations': return (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Évaluations clients</h2>
            <p className="text-sm text-gray-500 mt-1">Consultez les avis de vos clients</p>
          </div>
          {loadingReviews ? <Spinner /> : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Note moyenne</p>
                  <div className="flex items-center gap-3">
                    <p className="text-5xl font-bold">{reviewsStats.average_rating.toFixed(1)}</p>
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= Math.round(reviewsStats.average_rating) ? '⭐' : '☆'}</span>)}
                      </div>
                      <p className="text-sm opacity-90 mt-1">{reviewsStats.total_reviews} avis</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Répartition des notes</p>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = reviews.filter(rev => rev.rating === r).length;
                      const pct = reviewsStats.total_reviews > 0 ? (count / reviewsStats.total_reviews) * 100 : 0;
                      return (
                        <div key={r} className="flex items-center gap-3">
                          <span className="text-sm w-8">{r}⭐</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {reviewsStats.total_reviews === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xl mb-2">⭐</p>
                  <p className="text-gray-600 font-medium">Aucune évaluation pour le moment</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setReviewFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${reviewFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Tous ({reviewsStats.total_reviews})
                    </button>
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = reviews.filter(rev => rev.rating === r).length;
                      if (!count) return null;
                      return (
                        <button key={r} onClick={() => setReviewFilter(r)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${reviewFilter === r ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {r}⭐ ({count})
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    {reviews.filter(r => reviewFilter === 'all' || r.rating === reviewFilter).map(review => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{review.client_prenom} {review.client_nom?.charAt(0)}.</p>
                              <div className="flex">{[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= review.rating ? '⭐' : '☆'}</span>)}</div>
                            </div>
                            <p className="text-sm text-gray-600">{review.service_name} — {review.cemetery_name}</p>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 italic">"{review.comment}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      );

      case 'documents': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mes documents</h2>

          {/* Formulaire upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter un document</h3>

            {docError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{docError}</p></div>}
            {docSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{docSuccess}</p></div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="rib">RIB</option>
                  <option value="kbis">Kbis</option>
                  <option value="assurance">Assurance responsabilité civile</option>
                  <option value="identite">Pièce d'identité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {docType === 'autre' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Précisez le type</label>
                  <input type="text" value={docLabel} onChange={e => setDocLabel(e.target.value)}
                    placeholder="Ex: Certificat de formation"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
              <input type="file" onChange={e => setDocFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <p className="text-xs text-gray-500 mt-1">PDF, images acceptés — 10 Mo maximum</p>
            </div>

            <button
              onClick={async () => {
                setDocError(null);
                setDocSuccess(null);
                if (!docFile) { setDocError('Veuillez sélectionner un fichier'); return; }
                if (docType === 'autre' && !docLabel.trim()) { setDocError('Veuillez préciser le type de document'); return; }

                setUploadingDoc(true);
                try {
                  const formData = new FormData();
                  formData.append('file', docFile);
                  formData.append('type', docType);
                  if (docLabel) formData.append('label', docLabel);

                  await axios.post('/api/documents', formData, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  });

                  setDocSuccess('Document uploadé avec succès');
                  setDocFile(null);
                  setDocLabel('');
                  setDocType('rib');
                  fetchDocuments();
                } catch (err) {
                  setDocError(err.response?.data?.error?.message || 'Erreur lors de l\'upload');
                } finally {
                  setUploadingDoc(false);
                }
              }}
              disabled={uploadingDoc}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
              {uploadingDoc ? '⏳ Upload en cours...' : '📤 Envoyer le document'}
            </button>
          </div>

          {/* Liste documents */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Documents envoyés</h3>

            {loadingDocs ? (
              <p className="text-gray-500">Chargement...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📄</p>
                <p>Aucun document envoyé pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {doc.type === 'rib' ? 'RIB' :
                            doc.type === 'kbis' ? 'Kbis' :
                              doc.type === 'assurance' ? 'Assurance RC' :
                                doc.type === 'identite' ? "Pièce d'identité" :
                                  doc.label || 'Autre'}
                        </p>
                        <p className="text-sm text-gray-500">{doc.file_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium">
                        👁️ Voir
                      </a>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Supprimer ce document ?')) return;
                          await axios.delete(`/api/documents/${doc.id}`, authHeaders());
                          fetchDocuments();
                        }}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      case 'profile': return (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mon profil</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Prénom</label><p className="text-gray-900 font-medium">{user?.prenom || '-'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Nom</label><p className="text-gray-900 font-medium">{user?.nom || '-'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Email</label><p className="text-gray-900 font-medium">{user?.email || '-'}</p></div>
              {/* Téléphone ajouté */}
              <div><label className="text-sm font-medium text-gray-500">Téléphone</label><p className="text-gray-900 font-medium">{user?.telephone || '-'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">SIRET</label><p className="text-gray-900 font-medium">{user?.siret || 'Non renseigné'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Zone d'intervention</label><p className="text-gray-900 font-medium">{user?.zone_intervention || 'Non définie'}</p></div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setProfileData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '' });
                setProfileError(null); setProfileSuccess(null); setShowEditProfile(true);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              Modifier mes informations
            </button>
            <button
              onClick={() => {
                setPasswordData({ current: '', newPassword: '', confirm: '' });
                setPasswordError(null); setPasswordSuccess(null); setShowChangePassword(true);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
              Changer mon mot de passe
            </button>
          </div>

          {/* Modal modification profil */}
          {showEditProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditProfile(false)}>
              <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold">Modifier mes informations</h3>
                  <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  {profileError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{profileError}</p></div>}
                  {profileSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{profileSuccess}</p></div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input type="text" value={profileData.prenom} onChange={e => setProfileData(p => ({ ...p, prenom: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" value={profileData.nom} onChange={e => setProfileData(p => ({ ...p, nom: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={profileData.telephone} onChange={e => setProfileData(p => ({ ...p, telephone: e.target.value }))}
                      placeholder="0612345678" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowEditProfile(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">Annuler</button>
                  <button
                    onClick={async () => {
                      setProfileError(null);
                      setProfileSuccess(null);
                      if (!profileData.prenom || !profileData.nom || !profileData.email || !profileData.telephone) {
                        setProfileError('Tous les champs sont obligatoires');
                        return;
                      }
                      try {
                        const res = await axios.put('/api/users/profile', profileData, authHeaders());
                        login(res.data.data, localStorage.getItem('token'));
                        setProfileSuccess('Profil mis à jour avec succès');
                        setTimeout(() => setShowEditProfile(false), 1500);
                      } catch (err) {
                        setProfileError(err.response?.data?.error?.message || 'Erreur lors de la mise à jour');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal changement mot de passe */}
          {showChangePassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowChangePassword(false)}>
              <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold">Changer mon mot de passe</h3>
                  <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  {passwordError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{passwordError}</p></div>}
                  {passwordSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{passwordSuccess}</p></div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                    <input type="password" value={passwordData.current} onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <input type="password" value={passwordData.confirm} onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowChangePassword(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">Annuler</button>
                  <button
                    onClick={async () => {
                      setPasswordError(null);
                      setPasswordSuccess(null);
                      if (!passwordData.current || !passwordData.newPassword || !passwordData.confirm) {
                        setPasswordError('Tous les champs sont obligatoires');
                        return;
                      }
                      if (passwordData.newPassword.length < 8) {
                        setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
                        return;
                      }
                      if (passwordData.newPassword !== passwordData.confirm) {
                        setPasswordError('Les mots de passe ne correspondent pas');
                        return;
                      }
                      try {
                        await axios.put('/api/users/password', {
                          currentPassword: passwordData.current,
                          newPassword: passwordData.newPassword
                        }, authHeaders());
                        setPasswordSuccess('Mot de passe modifié avec succès');
                        setTimeout(() => setShowChangePassword(false), 1500);
                      } catch (err) {
                        setPasswordError(err.response?.data?.error?.message || 'Erreur lors du changement');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

      default: return null;
    }
  };

  // ─── Rendu principal ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 bg-green-50 px-6 py-8 pt-32 pl-24 w-full">

        {/* Sidebar iconique fixe */}
        <aside className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col items-center pt-28 pb-6 gap-1">

          {NAV_TABS.map(({ key, label }) => {
            const icons = {
              overview: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
              available: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
              missions: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
              calendar: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
              finances: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              alerts: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
              zone: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              evaluations: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
              history: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              documents: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
              profile: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
            };

            const badge =
              key === 'alerts' && unreadCount > 0 ? unreadCount :
                key === 'available' && availableMissions.length > 0 ? availableMissions.length :
                  key === 'missions' && myMissions.length > 0 ? myMissions.length :
                    null;

            return (
              <div key={key} className="relative group w-full flex justify-center">
                <button
                  onClick={() => setActiveTab(key)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === key
                      ? 'bg-green-700 text-white shadow-md'
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-700'
                    }`}
                >
                  {icons[key]}
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badge}
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5
            bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            opacity-0 group-hover:opacity-100
            translate-x-1 group-hover:translate-x-0
            transition-all duration-200 z-50">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2
              border-4 border-transparent border-r-slate-800" />
                </div>
              </div>
            );
          })}
        </aside>

        {/* Contenu */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Dashboard Prestataire</h1>
            {user && <p className="text-gray-700">Bienvenue <span className="font-semibold">{user.prenom} {user.nom}</span></p>}
          </div>
          {renderSection()}
        </section>

      </main>

      {/* Modal planification */}
      {missionToSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closePlanificationModal}>
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Planifier l'intervention</h3>
              <button onClick={closePlanificationModal} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold">{missionToSchedule.cemetery_name}</p>
                <p className="text-sm text-gray-600">{missionToSchedule.service_name}</p>
                <p className="text-sm text-green-600 mt-2">Durée estimée : {missionToSchedule.duration_hours || 2}h</p>
              </div>

              {schedulingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{schedulingError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'intervention <span className="text-red-500">*</span></label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-xs text-gray-500 mt-1">📅 Maximum 15 jours à l'avance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de début <span className="text-red-500">*</span></label>
                <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {Array.from({ length: 12 }, (_, i) => i + 7).flatMap(h =>
                    ['00', '30'].map(min => {
                      const t = `${String(h).padStart(2, '0')}:${min}`;
                      return <option key={t} value={t}>{t}</option>;
                    })
                  )}
                </select>
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📍 Intervention prévue le <strong>{new Date(selectedDate).toLocaleDateString('fr-FR')}</strong> à <strong>{selectedTime}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">
              <button onClick={closePlanificationModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                Annuler
              </button>
              <button onClick={confirmScheduleMission}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                ✅ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      <CrispChat user={user} />

    </div>
  );
}

export default DashboardPrestataire;