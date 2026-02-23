-- ============================================================
-- Migration 04 : Table service_categories
-- Catalogue des prestations disponibles (nettoyage, fleurs, etc.)
-- Doit être créée avant orders (FK service_category_id)
-- ============================================================

CREATE TABLE public.service_categories (
    id          integer NOT NULL,
    name        character varying(100) NOT NULL,
    description text,
    base_price  numeric(10,2),
    is_active   boolean DEFAULT true,
    created_at  timestamp without time zone DEFAULT now(),
    updated_at  timestamp without time zone DEFAULT now(),
    CONSTRAINT service_categories_base_price_check CHECK ((base_price > 0::numeric))
);

COMMENT ON TABLE public.service_categories IS 'Types de services: nettoyage pierre tombale, dépôt de fleurs';

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;
ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);