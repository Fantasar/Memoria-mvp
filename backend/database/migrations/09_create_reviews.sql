-- ============================================================
-- Migration 09 : Table reviews
-- Avis et notations laissés par les clients après une mission
-- Contrainte UNIQUE sur order_id : un seul avis par commande
-- Dépend de : 03_create_users, 06_create_orders
-- ============================================================

CREATE TABLE public.reviews (
    id             integer NOT NULL,
    order_id       uuid NOT NULL,
    client_id      uuid NOT NULL,
    prestataire_id uuid NOT NULL,
    rating         integer NOT NULL,
    comment        text,
    created_at     timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_key UNIQUE (order_id); -- Un seul avis par commande

-- Clés étrangères avec CASCADE
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_prestataire_id_fkey
        FOREIGN KEY (prestataire_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Index
CREATE INDEX idx_reviews_order       ON public.reviews USING btree (order_id);
CREATE INDEX idx_reviews_prestataire ON public.reviews USING btree (prestataire_id);