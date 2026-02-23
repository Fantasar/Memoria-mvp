-- ============================================================
-- Migration 02 : Table roles
-- Référentiel des rôles utilisateurs (client, prestataire, admin)
-- Doit être créée avant users (FK role_id)
-- ============================================================

CREATE TABLE public.roles (
    id          integer NOT NULL,
    name        character varying(50) NOT NULL,
    description text,
    created_at  timestamp without time zone DEFAULT now(),
    updated_at  timestamp without time zone DEFAULT now()
);

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);