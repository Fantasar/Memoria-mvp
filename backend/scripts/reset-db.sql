-- ============================================================
-- Script de reset — Mémoria MVP
-- Vide les données de test et supprime les tables inutiles
-- Conserve : roles, service_categories (actifs), cemeteries
-- ⚠️  À exécuter UNIQUEMENT en local avant déploiement
-- ============================================================

-- Désactive les contraintes FK le temps du nettoyage
SET session_replication_role = 'replica';

-- ── Suppression des tables inutiles ─────────────────────────
DROP TABLE IF EXISTS public.test_table CASCADE;
DROP TABLE IF EXISTS public.ratings     CASCADE;

-- ── Vidage des tables transactionnelles ─────────────────────
TRUNCATE TABLE
  public.notifications,
  public.reviews,
  public.photos,
  public.payments,
  public.orders,
  public.password_reset_tokens,
  public.provider_documents,
  public.crisp_messages,
  public.users
RESTART IDENTITY CASCADE;

-- ── Nettoyage des services inactifs ─────────────────────────
DELETE FROM public.service_categories WHERE is_active = false;

-- Réactive les contraintes FK
SET session_replication_role = 'origin';

-- ── Vérification ─────────────────────────────────────────────
SELECT 'users'              AS table_name, COUNT(*) FROM public.users
UNION ALL
SELECT 'orders',              COUNT(*) FROM public.orders
UNION ALL
SELECT 'service_categories',  COUNT(*) FROM public.service_categories
UNION ALL
SELECT 'cemeteries',          COUNT(*) FROM public.cemeteries
UNION ALL
SELECT 'roles',               COUNT(*) FROM public.roles;