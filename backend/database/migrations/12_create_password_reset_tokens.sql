-- ============================================================
-- Migration 12 : Table password_reset_tokens
-- Tokens OTP à 6 chiffres pour la réinitialisation de mot de passe par SMS
-- Dépend de : 03_create_users
-- ============================================================

CREATE TABLE public.password_reset_tokens (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid NOT NULL,
    token      character varying(6) NOT NULL,   -- Code OTP 6 chiffres envoyé par SMS
    expires_at timestamp without time zone NOT NULL,
    used       boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;