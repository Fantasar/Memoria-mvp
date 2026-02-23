-- ============================================================
-- Migration 07 : Table payments
-- Transactions Stripe avec tracking du déblocage des fonds
-- Deux types : paiement client et virement prestataire
-- Dépend de : 03_create_users, 06_create_orders
-- ============================================================

CREATE TABLE public.payments (
    id                          uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id                    uuid NOT NULL,
    stripe_payment_intent_id    character varying(255),  -- ID Stripe du paiement client
    stripe_transfer_id          character varying(255),  -- ID Stripe du virement prestataire
    amount                      numeric(10,2) NOT NULL,
    status                      public.payment_status_enum DEFAULT 'pending'::public.payment_status_enum NOT NULL,
    payment_type                public.payment_type_enum DEFAULT 'client_payment'::public.payment_type_enum,
    recipient_id                uuid,                    -- Prestataire destinataire (provider_transfer)
    released_at                 timestamp without time zone, -- Déblocage après validation admin
    created_at                  timestamp without time zone DEFAULT now(),
    updated_at                  timestamp without time zone DEFAULT now(),
    CONSTRAINT payments_amount_check CHECK ((amount > 0::numeric))
);

COMMENT ON TABLE public.payments IS 'Transactions Stripe avec tracking du déblocage';
COMMENT ON COLUMN public.payments.released_at IS 'Timestamp du déblocage des fonds au prestataire (après validation admin)';

-- Contraintes
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);

-- Clés étrangères
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_recipient_id_fkey
        FOREIGN KEY (recipient_id) REFERENCES public.users(id);

-- Index
CREATE INDEX idx_payments_order         ON public.payments USING btree (order_id);
CREATE INDEX idx_payments_status        ON public.payments USING btree (status);
CREATE INDEX idx_payments_stripe_intent ON public.payments USING btree (stripe_payment_intent_id);