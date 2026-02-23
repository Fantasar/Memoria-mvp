-- ============================================================
-- Migration 05 : Table cemeteries
-- Liste prédéfinie des cimetières de la zone pilote (Nouvelle-Aquitaine)
-- Les coordonnées GPS sont renseignées via géocodage automatique
-- Doit être créée avant orders (FK cemetery_id)
-- ============================================================

CREATE TABLE public.cemeteries (
    id          integer NOT NULL,
    name        character varying(255) NOT NULL,
    city        character varying(255) NOT NULL,
    postal_code character varying(10)  NOT NULL,
    department  character varying(50),
    address     text,
    -- Coordonnées GPS (renseignées via Google Maps Geocoding API)
    latitude    numeric(10,8),
    longitude   numeric(11,8),
    is_active   boolean DEFAULT true,
    created_at  timestamp without time zone DEFAULT now(),
    updated_at  timestamp without time zone DEFAULT now()
);

COMMENT ON TABLE public.cemeteries IS 'Liste prédéfinie des cimetières disponibles (zone pilote)';

CREATE SEQUENCE public.cemeteries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.cemeteries_id_seq OWNED BY public.cemeteries.id;
ALTER TABLE ONLY public.cemeteries ALTER COLUMN id SET DEFAULT nextval('public.cemeteries_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.cemeteries
    ADD CONSTRAINT cemeteries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cemeteries
    ADD CONSTRAINT unq_cemetery_location UNIQUE (name, city);

-- Index
CREATE INDEX idx_cemeteries_city       ON public.cemeteries USING btree (city);
CREATE INDEX idx_cemeteries_department ON public.cemeteries USING btree (department);
CREATE INDEX idx_cemeteries_active     ON public.cemeteries USING btree (is_active);