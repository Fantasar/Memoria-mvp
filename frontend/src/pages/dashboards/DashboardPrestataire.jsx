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

// Sections de la sidebar — sans emojis
const NAV_TABS = [
  { key: 'overview',    label: 'Aperçu' },
  { key: 'available',  label: 'Missions disponibles' },
  { key: 'missions',   label: 'Mes missions' },
  { key: 'calendar',   label: 'Calendrier' },
  { key: 'finances',   label: 'Finances' },
  { key: 'alerts',     label: 'Alertes' },
  { key: 'zone',       label: "Zone d'intervention" },
  { key: 'evaluations',label: 'Évaluations' },
  { key: 'history',    label: 'Historique' },
  { key: 'documents',  label: 'Documents' },
  { key: 'profile',    label: 'Profil' },
];

// Icônes SVG extraites hors du composant
const ICONS = {
  overview:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  available:   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  missions:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  calendar:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  finances:    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  alerts:      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  zone:        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  evaluations: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  history:     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  documents:   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  profile:     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

// Config statuts missions — sans emojis
const MISSION_STATUS = {
  accepted:             { label: 'En cours',              color: 'bg-yellow-100 text-yellow-800' },
  in_progress:          { label: 'En cours',              color: 'bg-blue-100 text-blue-800'    },
  awaiting_validation:  { label: 'En validation',         color: 'bg-orange-100 text-orange-800'},
  completed:            { label: 'Terminée',              color: 'bg-green-100 text-green-800'  },
  correction_requested: { label: 'Correction demandée',   color: 'bg-red-100 text-red-800'      },
  refunded:             { label: 'Remboursée',            color: 'bg-gray-100 text-gray-800'    },
};

function DashboardPrestataire() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // Données
  const [availableMissions, setAvailableMissions] = useState([]);
  const [myMissions,        setMyMissions]        = useState([]);
  const [calendar,          setCalendar]          = useState([]);
  const [history,           setHistory]           = useState([]);
  const [finances,          setFinances]          = useState(null);
  const [notifications,     setNotifications]     = useState([]);
  const [zoneStats,         setZoneStats]         = useState(null);
  const [reviews,           setReviews]           = useState([]);
  const [stats,             setStats]             = useState(null);
  const [reapplySuccess,    setReapplySuccess]    = useState(null);
  const [reapplyError,      setReapplyError]      = useState(null);

  // Loadings
  const [loadingStats,         setLoadingStats]         = useState(true);
  const [loadingAvailable,     setLoadingAvailable]     = useState(true);
  const [loadingMissions,      setLoadingMissions]      = useState(true);
  const [loadingCalendar,      setLoadingCalendar]      = useState(true);
  const [loadingHistory,       setLoadingHistory]       = useState(true);
  const [loadingFinances,      setLoadingFinances]      = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingZoneStats,     setLoadingZoneStats]     = useState(true);
  const [loadingReviews,       setLoadingReviews]       = useState(true);

  // UI states
  const [unreadCount,           setUnreadCount]           = useState(0);
  const [historyFilter,         setHistoryFilter]         = useState('all');
  const [selectedHistoryOrder,  setSelectedHistoryOrder]  = useState(null);
  const [reviewFilter,          setReviewFilter]          = useState('all');
  const [reviewsStats,          setReviewsStats]          = useState({ average_rating: 0, total_reviews: 0 });
  const [newZone,               setNewZone]               = useState('');
  const [updatingZone,          setUpdatingZone]          = useState(false);
  const [zoneError,             setZoneError]             = useState(null);
  const [zoneSuccess,           setZoneSuccess]           = useState(false);

  // Modal planification
  const [missionToSchedule, setMissionToSchedule] = useState(null);
  const [selectedDate,      setSelectedDate]      = useState('');
  const [selectedTime,      setSelectedTime]      = useState('');
  const [schedulingError,   setSchedulingError]   = useState('');

  // Modal profil
  const [showEditProfile,    setShowEditProfile]    = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData,        setProfileData]        = useState({ prenom: '', nom: '', email: '', telephone: '' });
  const [passwordData,       setPasswordData]       = useState({ current: '', newPassword: '', confirm: '' });
  const [profileSuccess,     setProfileSuccess]     = useState(null);
  const [profileError,       setProfileError]       = useState(null);
  const [passwordSuccess,    setPasswordSuccess]    = useState(null);
  const [passwordError,      setPasswordError]      = useState(null);

  // Documents
  const [documents,   setDocuments]   = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc,setUploadingDoc]= useState(false);
  const [docType,     setDocType]     = useState('rib');
  const [docLabel,    setDocLabel]    = useState('');
  const [docFile,     setDocFile]     = useState(null);
  const [docError,    setDocError]    = useState(null);
  const [docSuccess,  setDocSuccess]  = useState(null);

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
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // ─── Fetch functions ───────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats/provider', authHeaders());
      setStats(res.data.data);
    } catch { } finally { setLoadingStats(false); }
  };

  const fetchAvailableMissions = async () => {
    try {
      const res = await axios.get('/api/orders/available', authHeaders());
      setAvailableMissions(res.data.data || []);
    } catch { } finally { setLoadingAvailable(false); }
  };

  const fetchMyMissions = async () => {
    try {
      const res = await axios.get('/api/orders', authHeaders());
      setMyMissions(res.data.data || []);
    } catch { } finally { setLoadingMissions(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/orders/history', authHeaders());
      setHistory(res.data.data || []);
    } catch { } finally { setLoadingHistory(false); }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.get('/api/orders/calendar', authHeaders());
      setCalendar(res.data.data || []);
    } catch { } finally { setLoadingCalendar(false); }
  };

  const fetchFinances = async () => {
    setLoadingFinances(true);
    try {
      const res = await axios.get('/api/providers/finances', authHeaders());
      setFinances(res.data.data);
    } catch { } finally { setLoadingFinances(false); }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await axios.get('/api/notifications', authHeaders());
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unread_count || 0);
    } catch { } finally { setLoadingNotifications(false); }
  };

  const fetchZoneStats = async () => {
    setLoadingZoneStats(true);
    try {
      const res = await axios.get('/api/providers/zone/stats', authHeaders());
      setZoneStats(res.data.data);
      setNewZone(res.data.data.zone);
    } catch { } finally { setLoadingZoneStats(false); }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get('/api/reviews/provider', authHeaders());
      setReviews(res.data.data.reviews || []);
      setReviewsStats({
        average_rating: res.data.data.average_rating || 0,
        total_reviews:  res.data.data.total_reviews  || 0
      });
    } catch { } finally { setLoadingReviews(false); }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get('/api/documents/me', authHeaders());
      setDocuments(res.data.data || []);
    } catch { } finally { setLoadingDocs(false); }
  };

  // ─── Handlers notifications ────────────────────────────────────────────────

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, authHeaders());
      fetchNotifications();
    } catch { }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, authHeaders());
      fetchNotifications();
    } catch { }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    try {
      await axios.delete(`/api/notifications/${id}`, authHeaders());
      fetchNotifications();
    } catch { }
  };

  // ─── Handler zone ──────────────────────────────────────────────────────────

  const handleUpdateZone = async () => {
    if (!newZone || newZone.trim().length < 2) {
      setZoneError('Zone invalide (minimum 2 caractères)');
      return;
    }
    setUpdatingZone(true);
    setZoneError(null);
    setZoneSuccess(false);
    try {
      await axios.patch('/api/providers/zone', { zone_intervention: newZone.trim() }, authHeaders());
      setZoneSuccess(true);
      await fetchZoneStats();
    } catch (err) {
      setZoneError(err.response?.data?.error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingZone(false);
    }
  };

  // ─── Handler planification ─────────────────────────────────────────────────

  const handleAcceptMission = (mission) => {
    setMissionToSchedule(mission);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTime('09:00');
    setSchedulingError('');
  };

  const closePlanificationModal = () => {
    setMissionToSchedule(null);
    setSelectedDate('');
    setSelectedTime('');
    setSchedulingError('');
  };

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
      setSchedulingError(err.response?.data?.error?.message || 'Erreur lors de la planification');
    }
  };

  // ─── Export PDF finances ───────────────────────────────────────────────────

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

  const exportFinancesPDF = async () => {
    if (!finances) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const mainColor = [22, 163, 74]; // green-600
    const today = new Date().toLocaleDateString('fr-FR');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
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
        ['Total perçu',          `${finances.total_earned.toFixed(2)} €`],
        ['Missions complétées',  finances.missions_completed],
        ['En attente validation',`${finances.pending_validation.toFixed(2)} €`],
        ['Moyenne par mission',  `${finances.average_per_mission.toFixed(2)} €`],
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
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
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

  // ─── Spinner ───────────────────────────────────────────────────────────────

  const Spinner = () => (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  );

  const filteredHistory = historyFilter === 'all'
    ? history
    : history.filter(o => o.status === historyFilter);

  // ─── Rendu des sections ────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeTab) {

      // ── Aperçu ──────────────────────────────────────────────────────────────
      case 'overview': return (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Aperçu de mon activité</h2>

          {loadingStats ? <Spinner /> : stats ? (
            <>
              {/* KPI — nuances de vert uniforme */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">Total gagné</p>
                  <p className="text-3xl font-bold text-green-600">{stats.revenue.total_earned.toFixed(2)}€</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.revenue.paid_missions} paiements</p>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">Missions complétées</p>
                  <p className="text-3xl font-bold text-green-700">{stats.missions.by_status.completed || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Taux : {stats.missions.completion_rate}%</p>
                </div>
                <div className="bg-green-500 border border-green-500 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-green-100 mb-2">En cours</p>
                  <p className="text-3xl font-bold text-white">{stats.missions.by_status.accepted || 0}</p>
                  <p className="text-xs text-green-100 mt-1">À terminer</p>
                </div>
                <div className="bg-green-600 border border-green-600 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-green-100 mb-2">Total missions</p>
                  <p className="text-3xl font-bold text-white">{stats.missions.total}</p>
                  <p className="text-xs text-green-100 mt-1">Depuis le début</p>
                </div>
              </div>

              {/* Évolution 6 mois */}
              {stats.monthly?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Évolution sur 6 mois</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {stats.monthly.map((month, i) => (
                      <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">{month.month}</p>
                        <p className="text-xl font-bold text-gray-900 mb-1">{month.count}</p>
                        <p className="text-xs text-gray-500 mb-2">missions</p>
                        <p className="text-sm font-semibold text-green-600">{month.revenue.toFixed(0)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missions récentes — grid 3 colonnes */}
              {stats.recent_missions?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Missions récentes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.recent_missions.map(mission => {
                      const statusCfg = MISSION_STATUS[mission.status] ?? { label: mission.status, color: 'bg-gray-100 text-gray-800' };
                      return (
                        <div key={mission.id} onClick={() => navigate(`/orders/${mission.id}`)}
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{mission.cemetery_name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusCfg.color}`}>
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{mission.cemetery_city}</p>
                          <p className="text-xs text-gray-400 mb-3">{mission.service_name}</p>
                          <p className="text-xs text-gray-400">{new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                          <p className="text-lg font-bold text-green-600 mt-auto pt-3">{mission.price}€</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Impossible de charger les statistiques</p>
            </div>
          )}
        </div>
      );

      // ── Missions disponibles ─────────────────────────────────────────────────
      case 'available': return (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Missions disponibles</h2>
          {loadingAvailable ? <Spinner /> : availableMissions.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Aucune mission disponible dans votre zone</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableMissions.map(mission => (
                <div key={mission.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{mission.cemetery_name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap shrink-0">
                      Disponible
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <p><span className="font-medium text-gray-600">Ville :</span> {mission.cemetery_city}</p>
                    <p><span className="font-medium text-gray-600">Service :</span> {mission.service_name}</p>
                    <p><span className="font-medium text-gray-600">Créée le :</span> {new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {mission.comment && (
                    <div className="mb-3 bg-green-50 border border-green-100 rounded-lg p-3">
                      <p className="text-xs text-green-700">{mission.comment}</p>
                    </div>
                  )}
                  <p className="text-lg font-bold text-green-600 mb-4">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                  <button onClick={() => handleAcceptMission(mission)}
                    className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition">
                    Accepter et planifier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      // ── Mes missions ─────────────────────────────────────────────────────────
      case 'missions': return (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Mes missions</h2>
          {loadingMissions ? <Spinner /> : myMissions.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Vous n'avez pas encore de missions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myMissions.map(mission => {
                const statusCfg = MISSION_STATUS[mission.status] ?? { label: mission.status, color: 'bg-gray-100 text-gray-800' };
                return (
                  <div key={mission.id} onClick={() => navigate(`/orders/${mission.id}`)}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{mission.cemetery_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <p><span className="font-medium text-gray-600">Ville :</span> {mission.cemetery_city}</p>
                      <p><span className="font-medium text-gray-600">Service :</span> {mission.service_name}</p>
                      <p><span className="font-medium text-gray-600">Acceptée le :</span> {new Date(mission.accepted_at || mission.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <p className="text-lg font-bold text-green-600 mb-4">{(parseFloat(mission.price) * 0.80).toFixed(2)}€</p>
                    {(mission.status === 'accepted' || mission.status === 'correction_requested') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/missions/${mission.id}/complete`); }}
                        className={`mt-auto w-full ${mission.status === 'correction_requested'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-600 hover:bg-green-700'
                        } text-white px-4 py-2.5 rounded-xl font-medium text-sm transition`}>
                        {mission.status === 'correction_requested'
                          ? 'Corriger et re-uploader'
                          : 'Terminer et uploader les photos'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

      // ── Calendrier ───────────────────────────────────────────────────────────
      case 'calendar': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Calendrier</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              {calendar.length} mission{calendar.length > 1 ? 's' : ''} planifiée{calendar.length > 1 ? 's' : ''}
            </span>
          </div>
          {loadingCalendar ? <Spinner /> : calendar.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Aucune mission planifiée</p>
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
                <div key={date} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="bg-green-500 rounded-xl p-3 text-center min-w-[56px]">
                      <p className="text-2xl font-bold text-white leading-none">{new Date(date).getDate()}</p>
                      <p className="text-xs text-green-100">{new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
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
                        <div key={mission.id} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                          <div className="text-center min-w-[72px]">
                            <p className="text-lg font-bold text-green-600">{startTime}</p>
                            <p className="text-xs text-gray-400">{duration}h</p>
                            <p className="text-sm text-gray-500">{endTime}</p>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{mission.cemetery_name}</h4>
                            <p className="text-sm text-gray-500">{mission.cemetery_city}</p>
                            <p className="text-sm text-gray-500">{mission.service_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Vous recevrez</p>
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

      // ── Finances ─────────────────────────────────────────────────────────────
      case 'finances': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Finances</h2>
              <p className="text-sm text-gray-500 mt-1">Suivi de vos revenus</p>
            </div>
            <button onClick={exportFinancesPDF} disabled={!finances}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm">
              Export PDF
            </button>
          </div>

          {loadingFinances ? <Spinner /> : !finances ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Impossible de charger les données financières</p>
            </div>
          ) : (
            <>
              {/* KPI — nuances de vert uniforme */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">Total perçu</p>
                  <p className="text-3xl font-bold text-green-600">{finances.total_earned.toFixed(2)}€</p>
                  <p className="text-xs text-gray-400 mt-1">{finances.missions_completed} missions</p>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-gray-500 mb-2">En attente</p>
                  <p className="text-3xl font-bold text-green-700">{finances.pending_validation.toFixed(2)}€</p>
                  <p className="text-xs text-gray-400 mt-1">Validation admin</p>
                </div>
                <div className="bg-green-500 border border-green-500 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-green-100 mb-2">Moyenne</p>
                  <p className="text-3xl font-bold text-white">{finances.average_per_mission.toFixed(2)}€</p>
                  <p className="text-xs text-green-100 mt-1">Par mission</p>
                </div>
                <div className="bg-green-600 border border-green-600 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-green-100 mb-2">Complétées</p>
                  <p className="text-3xl font-bold text-white">{finances.missions_completed}</p>
                  <p className="text-xs text-green-100 mt-1">Missions validées</p>
                </div>
              </div>

              {/* Répartition mensuelle */}
              {finances.monthly_breakdown?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Répartition mensuelle</h3>
                  <div className="space-y-3">
                    {finances.monthly_breakdown.map(month => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                        <div>
                          <p className="font-medium text-gray-800">{new Date(month.month + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
                          <p className="text-sm text-gray-500">{month.count} mission{month.count > 1 ? 's' : ''}</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">{month.revenue.toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historique paiements — grid 3 colonnes */}
              {finances.recent_payments?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Historique des paiements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {finances.recent_payments.map(payment => (
                      <div key={payment.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{payment.cemetery_name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{payment.cemetery_city} · {payment.service_name}</p>
                        <p className="text-xs text-gray-400 mb-3">
                          {new Date(payment.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                          <p className="text-xs text-gray-400">Prix total : {payment.price.toFixed(2)}€</p>
                          <p className="text-base font-bold text-green-600">+{payment.amount_received.toFixed(2)}€</p>
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

      // ── Alertes ──────────────────────────────────────────────────────────────
      case 'alerts': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Alertes</h2>
              <p className="text-sm text-gray-500 mt-1">Notifications importantes</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition text-sm">
                Tout marquer comme lu
              </button>
            )}
          </div>

          {loadingNotifications ? <Spinner /> : notifications.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id}
                  className={`bg-white border rounded-xl p-4 transition ${notif.is_read
                    ? 'border-gray-200 opacity-70'
                    : 'border-green-200 bg-green-50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm mb-1 text-gray-900 ${!notif.is_read ? 'font-bold' : 'font-semibold'}`}>
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {notif.type === 'account_rejected' && (
                        <div className="mt-3">
                          {reapplySuccess && <p className="text-green-700 text-sm mb-2">{reapplySuccess}</p>}
                          {reapplyError   && <p className="text-red-700 text-sm mb-2">{reapplyError}</p>}
                          {!reapplySuccess && (
                            <button
                              onClick={async () => {
                                setReapplyError(null);
                                try {
                                  await axios.patch('/api/providers/reapply', {}, authHeaders());
                                  setReapplySuccess("Demande renvoyée. Un administrateur va l'examiner sous 24-48h.");
                                  handleMarkAsRead(notif.id);
                                } catch (err) {
                                  setReapplyError(err.response?.data?.error?.message || 'Erreur lors de la demande');
                                }
                              }}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition">
                              Refaire une demande
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notif.is_read && (
                        <button onClick={() => handleMarkAsRead(notif.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition text-sm font-bold"
                          title="Marquer comme lu">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => handleDeleteNotification(notif.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      // ── Zone d'intervention ──────────────────────────────────────────────────
      case 'zone': return (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Zone d'intervention</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez votre zone géographique de travail</p>
          </div>

          {loadingZoneStats ? <Spinner /> : !zoneStats ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Impossible de charger les données de zone</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Votre zone actuelle</h3>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-2xl font-bold text-green-700">{zoneStats.zone}</p>
                </div>
                {zoneError   && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{zoneError}</p></div>}
                {zoneSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">Zone mise à jour avec succès</p></div>}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Nouvelle zone d'intervention</label>
                  <input type="text" value={newZone} onChange={e => setNewZone(e.target.value)}
                    placeholder="Ex: Gironde, Bordeaux, 33000"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={handleUpdateZone}
                    disabled={updatingZone || !newZone || newZone.trim() === zoneStats.zone}
                    className="w-full bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {updatingZone ? 'Mise à jour...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

              {/* KPI zone — nuances de vert */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Votre zone couvre</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-gray-500 mb-2">Cimetières disponibles</p>
                    <p className="text-3xl font-bold text-green-600">{zoneStats.cemetery_count}</p>
                  </div>
                  <div className="bg-green-500 border border-green-500 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-green-100 mb-2">Missions potentielles (30j)</p>
                    <p className="text-3xl font-bold text-white">{zoneStats.potential_missions}</p>
                  </div>
                  <div className="bg-green-600 border border-green-600 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-green-100 mb-2">Villes principales</p>
                    <p className="text-3xl font-bold text-white">{zoneStats.main_cities.length}</p>
                  </div>
                </div>
              </div>

              {zoneStats.cemeteries.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Carte des cimetières</h3>
                  <ZoneMap cemeteries={zoneStats.cemeteries} />
                </div>
              )}
            </div>
          )}
        </div>
      );

      // ── Évaluations ──────────────────────────────────────────────────────────
      case 'evaluations': return (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Évaluations clients</h2>
            <p className="text-sm text-gray-500 mt-1">Consultez les avis de vos clients</p>
          </div>

          {loadingReviews ? <Spinner /> : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Note moyenne */}
                <div className="bg-amber-400 rounded-xl p-6 text-white">
                  <p className="text-sm font-medium text-amber-100 mb-2">Note moyenne</p>
                  <div className="flex items-center gap-4">
                    <p className="text-5xl font-bold">{reviewsStats.average_rating.toFixed(1)}</p>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
                            fill={s <= Math.round(reviewsStats.average_rating) ? 'white' : 'none'}
                            stroke="white" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-amber-100">{reviewsStats.total_reviews} avis</p>
                    </div>
                  </div>
                </div>

                {/* Répartition */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Répartition des notes</p>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = reviews.filter(rev => rev.rating === r).length;
                      const pct = reviewsStats.total_reviews > 0 ? (count / reviewsStats.total_reviews) * 100 : 0;
                      return (
                        <div key={r} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-6">{r}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {reviewsStats.total_reviews === 0 ? (
                <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-gray-500 font-medium">Aucune évaluation pour le moment</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setReviewFilter('all')}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition ${reviewFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Tous ({reviewsStats.total_reviews})
                    </button>
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = reviews.filter(rev => rev.rating === r).length;
                      if (!count) return null;
                      return (
                        <button key={r} onClick={() => setReviewFilter(r)}
                          className={`px-4 py-2 rounded-xl font-medium text-sm transition ${reviewFilter === r ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {r} étoile{r > 1 ? 's' : ''} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reviews.filter(r => reviewFilter === 'all' || r.rating === reviewFilter).map(review => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.client_prenom} {review.client_nom?.charAt(0)}.</p>
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <svg key={s} xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
                                  fill={s <= review.rating ? '#F59E0B' : 'none'}
                                  stroke={s <= review.rating ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{review.service_name} — {review.cemetery_name}</p>
                        {review.comment && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 italic">"{review.comment}"</p>
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

      // ── Historique ───────────────────────────────────────────────────────────
      case 'history': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Historique des missions</h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              {history.length} mission{history.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex gap-3 mb-6">
            {[
              { key: 'all',       label: `Toutes (${history.length})` },
              { key: 'completed', label: `Validées (${history.filter(h => h.status === 'completed').length})` },
              { key: 'refunded',  label: `Remboursées (${history.filter(h => h.status === 'refunded').length})` },
            ].map(f => (
              <button key={f.key} onClick={() => setHistoryFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${historyFilter === f.key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {loadingHistory ? <Spinner /> : filteredHistory.length === 0 ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <p className="text-gray-500">Aucune mission dans l'historique</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredHistory.map(order => (
                <div key={order.id} onClick={() => setSelectedHistoryOrder(order)}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-green-200 transition cursor-pointer flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{order.cemetery_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.status === 'completed' ? 'Validée' : 'Remboursée'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <p>{order.cemetery_city}</p>
                    <p>{order.service_name}</p>
                    <p>{new Date(order.updated_at).toLocaleDateString('fr-FR')} · {order.client_prenom} {order.client_nom}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Vous avez reçu</p>
                    <p className="text-xl font-bold text-green-600">{(parseFloat(order.price) * 0.8).toFixed(2)}€</p>
                    <p className="text-xs text-gray-400">Commission : {(parseFloat(order.price) * 0.2).toFixed(2)}€</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal détail historique */}
          {selectedHistoryOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedHistoryOrder(null)}>
              <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedHistoryOrder.cemetery_name}</h3>
                    <p className="text-sm text-gray-500">{selectedHistoryOrder.service_name}</p>
                  </div>
                  <button onClick={() => setSelectedHistoryOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-400 text-xs">Client</p><p className="font-medium">{selectedHistoryOrder.client_prenom} {selectedHistoryOrder.client_nom}</p></div>
                    <div><p className="text-gray-400 text-xs">Date</p><p className="font-medium">{new Date(selectedHistoryOrder.updated_at).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">Prix total</p><p className="text-lg font-bold text-gray-900">{parseFloat(selectedHistoryOrder.price).toFixed(2)}€</p></div>
                    <div className="bg-green-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">Vous avez reçu</p><p className="text-lg font-bold text-green-600">{(parseFloat(selectedHistoryOrder.price) * 0.8).toFixed(2)}€</p></div>
                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">Commission</p><p className="text-lg font-bold text-gray-600">{(parseFloat(selectedHistoryOrder.price) * 0.2).toFixed(2)}€</p></div>
                  </div>
                </div>
                <div className="p-6 border-t">
                  <button onClick={() => setSelectedHistoryOrder(null)}
                    className="w-full px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

      // ── Documents ────────────────────────────────────────────────────────────
      case 'documents': return (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Mes documents</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Ajouter un document</h3>

            {docError   && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{docError}</p></div>}
            {docSuccess && <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{docSuccess}</p></div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
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
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
              <input type="file" onChange={e => setDocFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-xl px-3 py-2" />
              <p className="text-xs text-gray-400 mt-1">PDF, images acceptés — 10 Mo maximum</p>
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
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
                  });
                  setDocSuccess('Document uploadé avec succès');
                  setDocFile(null); setDocLabel(''); setDocType('rib');
                  fetchDocuments();
                } catch (err) {
                  setDocError(err.response?.data?.error?.message || "Erreur lors de l'upload");
                } finally {
                  setUploadingDoc(false);
                }
              }}
              disabled={uploadingDoc}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition disabled:opacity-50 text-sm">
              {uploadingDoc ? 'Upload en cours...' : 'Envoyer le document'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Documents envoyés</h3>
            {loadingDocs ? <p className="text-gray-400 text-sm">Chargement...</p> : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Aucun document envoyé pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {doc.type === 'rib' ? 'RIB' : doc.type === 'kbis' ? 'Kbis' : doc.type === 'assurance' ? 'Assurance RC' : doc.type === 'identite' ? "Pièce d'identité" : doc.label || 'Autre'}
                        </p>
                        <p className="text-xs text-gray-500">{doc.file_name}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition">
                        Voir
                      </a>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Supprimer ce document ?')) return;
                          await axios.delete(`/api/documents/${doc.id}`, authHeaders());
                          fetchDocuments();
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      // ── Profil ───────────────────────────────────────────────────────────────
      case 'profile': return (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Mon profil</h2>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-gray-400">Prénom</label><p className="text-gray-900 font-medium">{user?.prenom || '-'}</p></div>
              <div><label className="text-xs font-medium text-gray-400">Nom</label><p className="text-gray-900 font-medium">{user?.nom || '-'}</p></div>
              <div><label className="text-xs font-medium text-gray-400">Email</label><p className="text-gray-900 font-medium">{user?.email || '-'}</p></div>
              <div><label className="text-xs font-medium text-gray-400">Téléphone</label><p className="text-gray-900 font-medium">{user?.telephone || '-'}</p></div>
              <div><label className="text-xs font-medium text-gray-400">SIRET</label><p className="text-gray-900 font-medium">{user?.siret || 'Non renseigné'}</p></div>
              <div><label className="text-xs font-medium text-gray-400">Zone d'intervention</label><p className="text-gray-900 font-medium">{user?.zone_intervention || 'Non définie'}</p></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setProfileData({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: user?.telephone || '' });
                setProfileError(null); setProfileSuccess(null); setShowEditProfile(true);
              }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm">
              Modifier mes informations
            </button>
            <button
              onClick={() => {
                setPasswordData({ current: '', newPassword: '', confirm: '' });
                setPasswordError(null); setPasswordSuccess(null); setShowChangePassword(true);
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
              Changer mon mot de passe
            </button>
          </div>

          {/* Modal modifier profil */}
          {showEditProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold">Modifier mes informations</h3>
                  <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
                </div>
                <div className="p-6 space-y-4">
                  {profileError   && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{profileError}</p></div>}
                  {profileSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{profileSuccess}</p></div>}
                  {[
                    { field: 'prenom', label: 'Prénom', type: 'text' },
                    { field: 'nom', label: 'Nom', type: 'text' },
                    { field: 'email', label: 'Email', type: 'email' },
                    { field: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '0612345678' },
                  ].map(({ field, label, type, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} value={profileData[field]}
                        onChange={e => setProfileData(p => ({ ...p, [field]: e.target.value }))}
                        placeholder={placeholder || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowEditProfile(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      setProfileError(null); setProfileSuccess(null);
                      if (!profileData.prenom || !profileData.nom || !profileData.email || !profileData.telephone) {
                        setProfileError('Tous les champs sont obligatoires'); return;
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
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal changer mot de passe */}
          {showChangePassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-bold">Changer mon mot de passe</h3>
                  <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
                </div>
                <div className="p-6 space-y-4">
                  {passwordError   && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-800 text-sm">{passwordError}</p></div>}
                  {passwordSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-800 text-sm">{passwordSuccess}</p></div>}
                  {[
                    { field: 'current', label: 'Mot de passe actuel' },
                    { field: 'newPassword', label: 'Nouveau mot de passe' },
                    { field: 'confirm', label: 'Confirmer le nouveau mot de passe' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type="password" value={passwordData[field]}
                        onChange={e => setPasswordData(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t flex gap-3">
                  <button onClick={() => setShowChangePassword(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      setPasswordError(null); setPasswordSuccess(null);
                      if (!passwordData.current || !passwordData.newPassword || !passwordData.confirm) {
                        setPasswordError('Tous les champs sont obligatoires'); return;
                      }
                      if (passwordData.newPassword.length < 8) {
                        setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères'); return;
                      }
                      if (passwordData.newPassword !== passwordData.confirm) {
                        setPasswordError('Les mots de passe ne correspondent pas'); return;
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
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
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
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-8 pt-32 pl-24 w-full">

        {/* Sidebar iconique fixe */}
        <aside className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col items-center pt-28 pb-6 gap-1">
          {NAV_TABS.map(({ key, label }) => {
            const badge =
              key === 'alerts'    && unreadCount             > 0 ? unreadCount :
              key === 'available' && availableMissions.length > 0 ? availableMissions.length :
              key === 'missions'  && myMissions.length        > 0 ? myMissions.length :
              null;

            return (
              <div key={key} className="relative group w-full flex justify-center">
                <button
                  onClick={() => setActiveTab(key)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    activeTab === key
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  {ICONS[key]}
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badge}
                    </span>
                  )}
                </button>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5
                  bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg
                  whitespace-nowrap pointer-events-none
                  opacity-0 group-hover:opacity-100
                  translate-x-1 group-hover:translate-x-0
                  transition-all duration-200 z-50">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                </div>
              </div>
            );
          })}
        </aside>

        {/* Zone de contenu */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Prestataire</h1>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  Bienvenue <span className="font-semibold text-gray-700">{user.prenom} {user.nom}</span>
                </p>
              )}
            </div>
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
              <h3 className="text-xl font-bold text-gray-900">Planifier l'intervention</h3>
              <button onClick={closePlanificationModal} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{missionToSchedule.cemetery_name}</p>
                <p className="text-sm text-gray-500">{missionToSchedule.service_name}</p>
                <p className="text-sm text-green-600 mt-2">Durée estimée : {missionToSchedule.duration_hours || 2}h</p>
              </div>

              {schedulingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{schedulingError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'intervention <span className="text-red-500">*</span>
                </label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-xs text-gray-400 mt-1">Maximum 15 jours à l'avance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début <span className="text-red-500">*</span>
                </label>
                <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {Array.from({ length: 12 }, (_, i) => i + 7).flatMap(h =>
                    ['00', '30'].map(min => {
                      const t = `${String(h).padStart(2, '0')}:${min}`;
                      return <option key={t} value={t}>{t}</option>;
                    })
                  )}
                </select>
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-sm text-green-800">
                    Intervention prévue le <strong>{new Date(selectedDate).toLocaleDateString('fr-FR')}</strong> à <strong>{selectedTime}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={closePlanificationModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium">
                Annuler
              </button>
              <button onClick={confirmScheduleMission}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium">
                Confirmer
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