-- ============================================================
-- Seed 03 : Cimetières pilotes Nouvelle-Aquitaine
-- Zone géographique pilote du MVP Mémoria
-- Coordonnées GPS approximatives — à affiner via Google Maps
-- ============================================================

INSERT INTO public.cemeteries
    (name, city, postal_code, department, address, latitude, longitude, is_active)
VALUES

    -- === GIRONDE ===
    (
        'Cimetière de la Chartreuse',
        'Bordeaux', '33000', 'Gironde',
        '167 Cours de la Marne, 33000 Bordeaux',
        44.82876400, -0.55326700,
        true
    ),
    (
        'Cimetière Nord de Bordeaux',
        'Bordeaux', '33300', 'Gironde',
        '192 Avenue de Verdun, 33300 Bordeaux',
        44.87291200, -0.57836400,
        true
    ),
    (
        'Cimetière de Mérignac',
        'Mérignac', '33700', 'Gironde',
        'Rue Édouard Vaillant, 33700 Mérignac',
        44.83745600, -0.64892300,
        true
    ),
    (
        'Cimetière de Pessac',
        'Pessac', '33600', 'Gironde',
        'Rue du Docteur Schweitzer, 33600 Pessac',
        44.80123400, -0.62845600,
        true
    ),

    -- === PYRÉNÉES-ATLANTIQUES ===
    (
        'Cimetière Saint-Étienne',
        'Bayonne', '64100', 'Pyrénées-Atlantiques',
        'Rue des Mousserolles, 64100 Bayonne',
        43.49234500, -1.47856200,
        true
    ),
    (
        'Cimetière Municipal de Pau',
        'Pau', '64000', 'Pyrénées-Atlantiques',
        'Boulevard du Cimetière, 64000 Pau',
        43.29456700, -0.37123400,
        true
    ),

    -- === DORDOGNE ===
    (
        'Cimetière Saint-Georges',
        'Périgueux', '24000', 'Dordogne',
        'Rue du Cimetière Saint-Georges, 24000 Périgueux',
        45.18234500, 0.71456700,
        true
    ),

    -- === CHARENTE-MARITIME ===
    (
        'Cimetière de La Rochelle',
        'La Rochelle', '17000', 'Charente-Maritime',
        'Rue du Commandant Rolland, 17000 La Rochelle',
        46.15234500, -1.14856200,
        true
    ),

    -- === HAUTE-VIENNE ===
    (
        'Cimetière de Louyat',
        'Limoges', '87000', 'Haute-Vienne',
        'Rue de Louyat, 87000 Limoges',
        45.83456700, 1.26123400,
        true
    ),

    -- === VIENNE ===
    (
        'Cimetière de Chilvert',
        'Poitiers', '86000', 'Vienne',
        'Rue de Chilvert, 86000 Poitiers',
        46.57234500, 0.33456700,
        true
    )

ON CONFLICT (name, city) DO NOTHING;

-- Vérification
SELECT id, name, city, department, latitude, longitude
FROM public.cemeteries
ORDER BY department, city;