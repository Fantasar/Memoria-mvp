-- ============================================================
-- Seed 01 : Rôles utilisateurs
-- Données obligatoires — la plateforme ne fonctionne pas sans ces 3 rôles
-- À exécuter après toutes les migrations
-- ============================================================

INSERT INTO public.roles (id, name, description) VALUES
    (1, 'client',      'Famille commandant des prestations d''entretien'),
    (2, 'prestataire', 'Professionnel réalisant les interventions sur les tombes'),
    (3, 'admin',       'Administrateur de la plateforme Mémoria')
ON CONFLICT (name) DO NOTHING;

-- Réinitialise la séquence après insertion avec IDs fixes
SELECT setval('public.roles_id_seq', 3);