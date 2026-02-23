-- ============================================================
-- Migration 11 : Table service_durations
-- Durées estimées par catégorie de service
-- Table annexe non utilisée dans le code actuel (MVP)
-- Dépend de : 04_create_service_categories
-- ============================================================

CREATE TABLE public.service_durations (
    id                  integer NOT NULL,
    service_category_id integer,
    duration_hours      numeric(3,1) NOT NULL,
    created_at          timestamp without time zone DEFAULT now()
);

CREATE SEQUENCE public.service_durations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.service_durations_id_seq OWNED BY public.service_durations.id;
ALTER TABLE ONLY public.service_durations ALTER COLUMN id SET DEFAULT nextval('public.service_durations_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.service_durations
    ADD CONSTRAINT service_durations_pkey PRIMARY KEY (id);

-- Clé étrangère
ALTER TABLE ONLY public.service_durations
    ADD CONSTRAINT service_durations_service_category_id_fkey
        FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id);