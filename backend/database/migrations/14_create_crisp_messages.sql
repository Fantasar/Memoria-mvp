-- ============================================================
-- Migration 14 : Table crisp_messages
-- Messages reçus via webhook Crisp Chat (support client)
-- Table autonome — pas de FK vers users (messages anonymes possibles)
-- ============================================================

CREATE TABLE public.crisp_messages (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id  character varying(255) NOT NULL,  -- ID de session Crisp
    from_email  character varying(255),
    from_name   character varying(255),
    content     text NOT NULL,
    is_read     boolean DEFAULT false,
    received_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.crisp_messages
    ADD CONSTRAINT crisp_messages_pkey PRIMARY KEY (id);