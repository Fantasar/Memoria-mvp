-- ============================================================================
-- MÉMORIA - Schéma de base de données PostgreSQL
-- ============================================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TYPES ENUM
-- ============================================================================

-- Statut des commandes
CREATE TYPE order_status_enum AS ENUM (
    'pending',      -- En attente d'acceptation prestataire
    'accepted',     -- Acceptée par prestataire
    'in_progress',  -- En cours de réalisation
    'completed',    -- Terminée, en attente validation admin
    'validated',    -- Validée par admin, paiement débloqué
    'cancelled'     -- Annulée
);

-- Type de photos
CREATE TYPE photo_type_enum AS ENUM (
  'before',  -- Photo avant intervention
  'after'    -- Photo après intervention
);

-- Statut des paiements
CREATE TYPE payment_status_enum AS ENUM (
  'pending',    -- En attente
  'succeeded',  -- Paiement réussi
  'released',   -- Débloqué au prestataire
  'failed',     -- Échec
  'refunded'    -- Remboursé
);

-- ============================================================================
-- TABLE: roles
-- ============================================================================
-- Définition des 3 rôles utilisateurs du système
-- ============================================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Table unifiée pour tous les utilisateurs (clients, prestataires, admins)
-- Soft delete activé pour préserver l'historique des commandes
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,

    -- Champs spécifiques prestataires (NULL pour clients/admins)
    zone_intervention VARCHAR(100),
    siret VARCHAR(14),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

    -- Soft delete
    deleted_at TIMESTAMP NULL,  -- NULL = actif, date = compte supprimé
  
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
  
    -- Contraintes
    CONSTRAINT chk_siret_length CHECK (siret IS NULL OR LENGTH(siret) = 14)
);

-- ============================================================================
-- TABLE: cemeteries
-- ============================================================================
-- Liste prédéfinie des cimetières disponibles (zone pilote Nouvelle-Aquitaine)
-- ============================================================================

CREATE TABLE cemeteries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Index pour recherche par ville/département
    CONSTRAINT unq_cemetery_location UNIQUE (name, city)
);

-- ============================================================================
-- TABLE: service_categories
-- ============================================================================
-- Types de services proposés (MVP: nettoyage + fleurs)
-- ============================================================================

CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) CHECK (base_price > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE: orders
-- ============================================================================
-- Commandes passées par clients et acceptées par prestataires
-- ============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations utilisateurs
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    prestataire_id UUID REFERENCES users(id) ON DELETE RESTRICT,  -- NULL tant que pas acceptée
  
    -- Détails commande
    cemetery_id INTEGER NOT NULL REFERENCES cemeteries(id) ON DELETE RESTRICT,
    service_category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,

    -- Informations complémentaires
    cemetery_location VARCHAR(255),  -- Infos complémentaires (section, allée...)
    status order_status_enum NOT NULL DEFAULT 'pending',
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,    -- Quand prestataire accepte
    completed_at TIMESTAMP,   -- Quand prestataire termine
    validated_at TIMESTAMP    -- Quand admin valide
);

-- ============================================================================
-- TABLE: photos
-- ============================================================================
-- Photos avant/après uploadées par prestataires (stockage Cloudinary)
-- ============================================================================

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type photo_type_enum NOT NULL,
    url TEXT NOT NULL,  -- URL Cloudinary
    cloudinary_public_id VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT NOW(),
  
    -- Contrainte: au moins 1 photo avant et 1 après par commande
    CONSTRAINT chk_valid_url CHECK (url ~ '^https?://')
);

-- ============================================================================
-- TABLE: payments
-- ============================================================================
-- Transactions Stripe avec tracking du déblocage au prestataire
-- ============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  
    -- Informations Stripe
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_transfer_id VARCHAR(255),  -- ID du transfer au prestataire
  
    -- Montants
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  
    -- Statut
    status payment_status_enum NOT NULL DEFAULT 'pending',
  
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP  -- Quand l'argent est débloqué au prestataire
);

-- ============================================================================
-- INDEX DE PERFORMANCE
-- ============================================================================
-- Index sur colonnes fréquemment interrogées pour optimiser les requêtes
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_deleted ON users(deleted_at);  -- Pour filtrer actifs
CREATE INDEX idx_users_zone ON users(zone_intervention);  -- Recherche prestataires

-- Orders
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_prestataire ON orders(prestataire_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_cemetery ON orders(cemetery_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);  -- Tri chronologique

-- Photos
CREATE INDEX idx_photos_order ON photos(order_id);
CREATE INDEX idx_photos_type ON photos(type);

-- Payments
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Cemeteries
CREATE INDEX idx_cemeteries_city ON cemeteries(city);
CREATE INDEX idx_cemeteries_department ON cemeteries(department);
CREATE INDEX idx_cemeteries_active ON cemeteries(is_active);

-- ============================================================================
-- COMMENTAIRES SUR LES TABLES
-- ============================================================================

COMMENT ON TABLE users IS 'Table unifiée des utilisateurs avec soft delete pour préserver historique';
COMMENT ON COLUMN users.deleted_at IS 'NULL = compte actif, timestamp = compte supprimé (soft delete)';
COMMENT ON COLUMN users.role_id IS 'FK vers roles: 1=client, 2=prestataire, 3=admin';
COMMENT ON COLUMN users.siret IS 'Numéro SIRET (14 chiffres) pour prestataires uniquement';
COMMENT ON COLUMN users.rating IS 'Note moyenne du prestataire (0-5), NULL pour clients/admins';

COMMENT ON TABLE orders IS 'Commandes avec cycle de vie complet (pending -> validated)';
COMMENT ON COLUMN orders.prestataire_id IS 'NULL tant que commande non acceptée';
COMMENT ON COLUMN orders.status IS 'État de la commande: pending, accepted, in_progress, completed, validated, cancelled';

COMMENT ON TABLE photos IS 'Photos avant/après stockées sur Cloudinary';
COMMENT ON COLUMN photos.type IS 'before (avant intervention) ou after (après intervention)';

COMMENT ON TABLE payments IS 'Transactions Stripe avec tracking du déblocage';
COMMENT ON COLUMN payments.released_at IS 'Timestamp du déblocage des fonds au prestataire (après validation admin)';

COMMENT ON TABLE cemeteries IS 'Liste prédéfinie des cimetières disponibles (zone pilote)';
COMMENT ON TABLE service_categories IS 'Types de services: nettoyage pierre tombale, dépôt de fleurs';
