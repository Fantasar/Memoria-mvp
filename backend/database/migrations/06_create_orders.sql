
-- ============================================================
-- Migration 06 : Table orders
-- Commandes avec cycle de vie complet (pending → validated)
-- Dépend de : 03_create_users, 04_create_service_categories, 05_create_cemeteries
-- ============================================================

CREATE TABLE public.orders (
    id                   uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id            uuid NOT NULL,
    prestataire_id       uuid,                          -- NULL jusqu'à acceptation
    cemetery_id          integer NOT NULL,
    service_category_id  integer NOT NULL,
    cemetery_location    character varying(255),        -- Emplacement précis de la tombe
    status        
    comment             text,       public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    price                numeric(10,2) NOT NULL,
    -- Planning
    scheduled_date       date,
    scheduled_time       time without time zone,
    -- Timestamps du cycle de vie
    accepted_at          timestamp without time zone,
    completed_at         timestamp without time zone,
    validated_at         timestamp without time zone,
    cancelled_at         timestamp without time zone,
    disputed_at          timestamp without time zone,
    resolved_at          timestamp without time zone,
    -- Métadonnées
    cancellation_reason  text,
    dispute_reason       text,
    resolution_action    character varying(50),
    comment              text,
    created_at           timestamp without time zone DEFAULT now(),
    updated_at           timestamp without time zone DEFAULT now(),
    CONSTRAINT orders_price_check CHECK ((price > 0::numeric))
);

COMMENT ON TABLE public.orders IS 'Commandes avec cycle de vie complet (pending -> validated)';
COMMENT ON COLUMN public.orders.prestataire_id IS 'NULL tant que commande non acceptée';
COMMENT ON COLUMN public.orders.status IS 'État de la commande: pending, accepted, in_progress, completed, validated, cancelled';

-- Contraintes
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

-- Clés étrangères
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_prestataire_id_fkey
        FOREIGN KEY (prestataire_id) REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cemetery_id_fkey
        FOREIGN KEY (cemetery_id) REFERENCES public.cemeteries(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_service_category_id_fkey
        FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id) ON DELETE RESTRICT;

-- Index
CREATE INDEX idx_orders_client      ON public.orders USING btree (client_id);
CREATE INDEX idx_orders_prestataire ON public.orders USING btree (prestataire_id);
CREATE INDEX idx_orders_cemetery    ON public.orders USING btree (cemetery_id);
CREATE INDEX idx_orders_status      ON public.orders USING btree (status);
CREATE INDEX idx_orders_created     ON public.orders USING btree (created_at DESC);