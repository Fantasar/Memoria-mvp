-- ============================================================
-- Seed 02 : Catégories de services
-- Services proposés sur la plateforme Mémoria (zone pilote)
-- Prix indicatifs — à ajuster selon la stratégie commerciale
-- ============================================================

INSERT INTO public.service_categories (name, description, base_price, is_active) VALUES

    -- === NETTOYAGE PIERRE TOMBALE ===
    (
        'Nettoyage pierre tombale',
        'Nettoyage complet de la pierre tombale avec produits adaptés.',
        45.00,
        true
    ),
    (
        'Entretien Trimestriel',
        'Nettoyage complet de la pierre tombale tous les 3 mois.',
        110.00,
        true
    ),
    (
        'Entretien Semestriel',
        'Nettoyage complet de la pierre tombale tous les 6 mois.',
        200.00,
        true
    ),
    (
        'Entretien Annuel',
        'Nettoyage complet de la pierre tombale une fois par an.',
        350.00,
        true
    ),
    (
        'Abonnement Mensuel Entretien',
        'Nettoyage mensuel de la pierre tombale.',
        40.00,
        true
    ),

    -- === LIVRAISON DE FLEURS ===
    (
        'Bouquet de fleurs fraîches',
        'Bouquet de fleurs de saison fraîches déposé sur la tombe.',
        35.00,
        true
    ),
    (
        'Composition Artificielle',
        'Composition florale artificielle durable déposée sur la tombe.',
        45.00,
        true
    ),
    (
        'Abonnement Mensuel Fleurs',
        'Dépôt mensuel de fleurs fraîches sur la tombe.',
        28.00,
        true
    )

ON CONFLICT (name) DO NOTHING;

-- Vérification
SELECT id, name, base_price, is_active
FROM public.service_categories
ORDER BY id;