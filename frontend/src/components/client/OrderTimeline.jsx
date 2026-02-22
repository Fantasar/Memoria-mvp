function OrderTimeline({ order }) {
  // Définir les étapes possibles
  const getTimelineSteps = () => {
    const steps = [];

    // 1. Commande créée (toujours présent)
    steps.push({
      status: 'completed',
      icon: '✅',
      title: 'Commande créée',
      date: order.created_at,
      description: 'Votre demande a été enregistrée'
    });

    // 2. Paiement effectué
    if (order.payment_id || order.status !== 'pending') {
      steps.push({
        status: 'completed',
        icon: '💳',
        title: 'Paiement effectué',
        date: order.created_at, // Ou order.payment_date si disponible
        description: `${order.price}€ payés`
      });
    }

    // 3. Prestataire assigné
    if (order.prestataire_id) {
      steps.push({
        status: 'completed',
        icon: '👤',
        title: 'Prestataire assigné',
        date: order.accepted_at || order.updated_at,
        description: `Intervention confiée à un professionnel`
      });
    }

    // 4. Intervention prévue (SANS HEURE)
    if (order.scheduled_date && order.status === 'accepted') {
      steps.push({
        status: 'current',
        icon: '📅',
        title: 'Intervention prévue',
        date: order.scheduled_date,
        description: `Intervention le ${new Date(order.scheduled_date).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}`
      });
    }

    // 5. Intervention effectuée
    if (order.status === 'awaiting_validation' || order.status === 'completed' || order.status === 'disputed') {
      steps.push({
        status: 'completed',
        icon: '✨',
        title: 'Intervention effectuée',
        date: order.completed_at || order.updated_at,
        description: 'Photos avant/après disponibles'
      });
    }

    // 6. En attente de validation
    if (order.status === 'awaiting_validation') {
      steps.push({
        status: 'current',
        icon: '⏳',
        title: 'Validation en cours',
        date: null,
        description: 'Un administrateur vérifie la qualité du travail'
      });
    }

    // 7. Litige en cours
    if (order.status === 'disputed') {
      steps.push({
        status: 'warning',
        icon: '🚨',
        title: 'Litige en cours',
        date: order.disputed_at,
        description: order.dispute_reason || 'Problème signalé - Examen en cours'
      });
    }

    // 8. Mission validée
    if (order.status === 'completed') {
      steps.push({
        status: 'completed',
        icon: '🎉',
        title: 'Mission terminée',
        date: order.validated_at || order.updated_at,
        description: 'Mission validée avec succès'
      });
    }

    // 9. Mission annulée
    if (order.status === 'cancelled') {
      steps.push({
        status: 'cancelled',
        icon: '❌',
        title: 'Mission annulée',
        date: order.cancelled_at || order.updated_at,
        description: order.cancellation_reason || 'Mission annulée'
      });
    }

    // 10. Remboursement
    if (order.status === 'refunded') {
      steps.push({
        status: 'completed',
        icon: '💸',
        title: 'Remboursement effectué',
        date: order.refunded_at || order.updated_at,
        description: `${order.price}€ remboursés`
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">📊 Suivi de votre mission</h3>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Icône et ligne verticale */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                step.status === 'completed' ? 'bg-green-100' :
                step.status === 'current' ? 'bg-blue-100' :
                step.status === 'warning' ? 'bg-orange-100' :
                step.status === 'cancelled' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {step.icon}
              </div>
              
              {/* Ligne verticale (pas pour le dernier élément) */}
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 ${
                  step.status === 'completed' ? 'bg-green-300' :
                  step.status === 'current' ? 'bg-blue-300' :
                  'bg-gray-300'
                }`}></div>
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-semibold ${
                  step.status === 'completed' ? 'text-green-800' :
                  step.status === 'current' ? 'text-blue-800' :
                  step.status === 'warning' ? 'text-orange-800' :
                  step.status === 'cancelled' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {step.title}
                </h4>
                
                {step.date && (
                  <span className="text-xs text-gray-500">
                    {new Date(step.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderTimeline;