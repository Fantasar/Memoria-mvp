-- ============================================================
-- Migration 03 : Table users
-- Table unifiée des utilisateurs (clients, prestataires, admins)
-- Soft delete via deleted_at pour préserver l'historique des commandes
-- Dépend de : 02_create_roles.sql
-- ============================================================

CREATE TABLE public.users (
    id               uuid DEFAULT gen_random_uuid() NOT NULL,
    email            character varying(255) NOT NULL,
    password_hash    character varying(255) NOT NULL,
    role_id          integer NOT NULL,
    prenom           character varying(100),
    nom              character varying(100),
    -- Champs prestataire uniquement
    zone_intervention character varying(100),
    siret            character varying(14),
    rating           numeric(2,1),
    is_verified      boolean DEFAULT false,
    verified_at      timestamp without time zone,
    rejection_reason text,
    rejected_at      timestamp without time zone,
    -- Soft delete
    deleted_at       timestamp without time zone,
        -- Blocage compte
    is_blocked       boolean DEFAULT false,
    -- Timestamps
    created_at       timestamp without time zone DEFAULT now(),
    updated_at       timestamp without time zone DEFAULT now(),
    -- Contraintes
    CONSTRAINT chk_siret_length CHECK ((siret IS NULL) OR (length(siret::text) = 14)),
    CONSTRAINT users_rating_check CHECK ((rating >= 0::numeric) AND (rating <= 5::numeric))
);

COMMENT ON TABLE public.users IS 'Table unifiée des utilisateurs avec soft delete pour préserver historique';
COMMENT ON COLUMN public.users.role_id IS 'FK vers roles: 1=client, 2=prestataire, 3=admin';
COMMENT ON COLUMN public.users.siret IS 'Numéro SIRET (14 chiffres) pour prestataires uniquement';
COMMENT ON COLUMN public.users.rating IS 'Note moyenne du prestataire (0-5), NULL pour clients/admins';
COMMENT ON COLUMN public.users.deleted_at IS 'NULL = compte actif, timestamp = compte supprimé (soft delete)';
COMMENT ON COLUMN public.users.is_blocked IS 'true = compte bloqué par un admin, connexion refusée';


-- Contraintes
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

-- Clé étrangère
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;

-- Index
CREATE INDEX idx_users_email    ON public.users USING btree (email);
CREATE INDEX idx_users_blocked ON public.users USING btree (is_blocked);
CREATE INDEX idx_users_role     ON public.users USING btree (role_id);
CREATE INDEX idx_users_zone     ON public.users USING btree (zone_intervention);
CREATE INDEX idx_users_deleted  ON public.users USING btree (deleted_at);