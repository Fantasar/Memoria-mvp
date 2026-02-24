// frontend/src/components/clients/OrderTimeline.jsx

/**
 * Couleurs Tailwind associées à chaque statut d'étape
 */
const STEP_STYLES = {
  completed: { bg: 'bg-green-100',  text: 'text-green-800',  line: 'bg-green-300'  },
  current:   { bg: 'bg-blue-100',   text: 'text-blue-800',   line: 'bg-blue-300'   },
  warning:   { bg: 'bg-orange-100', text: 'text-orange-800', line: 'bg-gray-300'   },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-800',    line: 'bg-gray-300'   },
  pending:   { bg: 'bg-gray-100',   text: 'text-gray-800',   line: 'bg-gray-300'   },
};

const getStyle = (status) => STEP_STYLES[status] ?? STEP_STYLES.pending;

/**
 * Construit la liste des étapes de la timeline selon le statut de la commande.
 * Extraite hors du composant car elle ne dépend que de order (pas du state React).
 */
const buildTimelineSteps = (order) => {
  const steps = [];

  // 1. Commande créée — toujours présent
  steps.push({
    status:      'completed',
    icon:        '✅',
    title:       'Commande créée',
    date:        order.created_at,
    description: 'Votre demande a été enregistrée'
  });

  // 2. Paiement effectué
  if (order.status !== 'pending') {
    steps.push({
      status:      'completed',
      icon:        '💳',
      title:       'Paiement effectué',
      date:        order.created_at,
      description: `${order.price}€ payés`
    });
  }

  // 3. Prestataire assigné
  if (order.prestataire_id) {
    steps.push({
      status:      'completed',
      icon:        '👤',
      title:       'Prestataire assigné',
      date:        order.accepted_at || order.updated_at,
      description: 'Intervention confiée à un professionnel'
    });
  }

  // 4. Intervention prévue (statut accepted uniquement)
  if (order.scheduled_date && order.status === 'accepted') {
    steps.push({
      status:      'current',
      icon:        '📅',
      title:       'Intervention prévue',
      date:        order.scheduled_date,
      description: `Intervention le ${new Date(order.scheduled_date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })}`
    });
  }

  // 5. Intervention effectuée
  if (['awaiting_validation', 'completed', 'disputed'].includes(order.status)) {
    steps.push({
      status:      'completed',
      icon:        '✨',
      title:       'Intervention effectuée',
      date:        order.completed_at || order.updated_at,
      description: 'Photos avant/après disponibles'
    });
  }

  // 6. Validation en cours
  if (order.status === 'awaiting_validation') {
    steps.push({
      status:      'current',
      icon:        '⏳',
      title:       'Validation en cours',
      date:        null,
      description: 'Un administrateur vérifie la qualité du travail'
    });
  }

  // 7. Litige signalé
  if (order.status === 'disputed') {
    steps.push({
      status:      'warning',
      icon:        '🚨',
      title:       'Litige en cours',
      date:        order.disputed_at,
      description: order.dispute_reason || 'Problème signalé — Examen en cours'
    });
  }

  // 8. Mission validée
  if (order.status === 'completed') {
    steps.push({
      status:      'completed',
      icon:        '🎉',
      title:       'Mission terminée',
      date:        order.validated_at || order.updated_at,
      description: 'Mission validée avec succès'
    });
  }

  // 9. Mission annulée
  if (order.status === 'cancelled') {
    steps.push({
      status:      'cancelled',
      icon:        '❌',
      title:       'Mission annulée',
      date:        order.cancelled_at || order.updated_at,
      description: order.cancellation_reason || 'Mission annulée'
    });
  }

  // 10. Remboursement effectué
  if (order.status === 'refunded') {
    steps.push({
      status:      'completed',
      icon:        '💸',
      title:       'Remboursement effectué',
      date:        order.refunded_at || order.updated_at,
      description: `${order.price}€ remboursés`
    });
  }

  return steps;
};

/**
 * Timeline visuelle du cycle de vie d'une commande.
 * Affiche les étapes passées, l'étape en cours et les étapes à venir.
 *
 * @param {Object} order - Commande avec tous ses timestamps de cycle de vie
 */
function OrderTimeline({ order }) {
  const steps = buildTimelineSteps(order);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">📊 Suivi de votre mission</h3>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const style = getStyle(step.status);
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex gap-4">

              {/* Icône + ligne verticale */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${style.bg}`}>
                  {step.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-12 ${style.line}`} />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${style.text}`}>
                    {step.title}
                  </h4>
                  {step.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(step.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;