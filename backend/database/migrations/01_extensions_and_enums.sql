-- ============================================================
-- Migration 01 : Extensions et types ENUM
-- Doit être exécutée EN PREMIER — les enums sont utilisés
-- par les tables orders et payments
-- ============================================================

-- Extension pgcrypto pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Statuts du cycle de vie d'une commande
CREATE TYPE public.order_status_enum AS ENUM (
    'pending',            -- Commande créée, en attente d'un prestataire
    'accepted',           -- Prestataire a accepté la mission
    'in_progress',        -- Intervention en cours
    'completed',          -- Prestataire a terminé, en attente de validation
    'awaiting_validation',-- En attente de validation admin
    'validated',          -- Admin a validé, paiement prestataire déclenché
    'cancelled',          -- Mission annulée par le prestataire
    'paid',               -- Paiement prestataire effectué
    'disputed',           -- Litige signalé
    'refunded'            -- Client remboursé suite à litige
);

-- Statuts d'un paiement Stripe
CREATE TYPE public.payment_status_enum AS ENUM (
    'pending',    -- Paiement initié
    'succeeded',  -- Paiement client confirmé
    'released',   -- Fonds débloqués au prestataire
    'failed',     -- Paiement échoué
    'refunded'    -- Remboursement effectué
);

-- Types de transaction (client → plateforme ou plateforme → prestataire)
CREATE TYPE public.payment_type_enum AS ENUM (
    'client_payment',    -- Paiement initial du client
    'provider_transfer'  -- Virement au prestataire après validation
);

-- Type de photo (avant ou après intervention)
CREATE TYPE public.photo_type_enum AS ENUM (
    'before', -- Photo prise avant l'intervention
    'after'   -- Photo prise après l'intervention
);