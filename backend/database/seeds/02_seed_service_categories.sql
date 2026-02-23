-- ============================================================
-- Seed 02 : Catégories de services
-- Services proposés sur la plateforme Mémoria (zone pilote)
-- Prix indicatifs — à ajuster selon la stratégie commerciale
-- ============================================================

INSERT INTO public.service_categories (name, description, base_price, is_active) VALUES
    (
        'Nettoyage de pierre tombale',
        'Nettoyage complet de la pierre tombale : désherbage, enlèvement des mousses et lichens, rinçage à l''eau claire.',
        49.90,
        true
    ),
    (
        'Dépôt de fleurs',
        'Dépôt d''un bouquet de fleurs fraîches de saison sur la tombe, avec retrait des fleurs fanées.',
        29.90,
        true
    ),
    (
        'Entretien complet',
        'Prestation complète : nettoyage de la pierre tombale + dépôt de fleurs fraîches + photo avant/après.',
        69.90,
        true
    ),
    (
        'Désherbage et nettoyage',
        'Désherbage autour de la concession, nettoyage des abords et de la pierre tombale.',
        39.90,
        true
    )
ON CONFLICT (name) DO NOTHING;