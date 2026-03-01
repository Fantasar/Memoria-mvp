-- ============================================================
-- Migration 13 : Table provider_documents
-- Documents administratifs uploadés par les prestataires (Kbis, assurance, etc.)
-- Dépend de : 03_create_users
-- ============================================================

CREATE TABLE public.provider_documents (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id     uuid NOT NULL,
    type        character varying(50)  NOT NULL,  -- Ex: kbis, assurance, identite
    label       character varying(255),
    file_url    text NOT NULL,
    file_name   character varying(255),
    uploaded_at timestamp without time zone DEFAULT now(),
    is_read     boolean DEFAULT false              -- Lu par l'admin ou non
);

ALTER TABLE ONLY public.provider_documents
    ADD CONSTRAINT provider_documents_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.provider_documents
    ADD CONSTRAINT provider_documents_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;