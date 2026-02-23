-- ============================================================
-- Migration 08 : Table photos
-- Photos avant/après stockées sur Cloudinary
-- Suppression en cascade si la commande est supprimée
-- Dépend de : 06_create_orders
-- ============================================================

CREATE TABLE public.photos (
    id                   uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id             uuid NOT NULL,
    type                 public.photo_type_enum NOT NULL,  -- 'before' ou 'after'
    url                  text NOT NULL,                    -- URL Cloudinary
    cloudinary_public_id character varying(255),           -- ID pour suppression Cloudinary
    uploaded_at          timestamp without time zone DEFAULT now(),
    CONSTRAINT chk_valid_url CHECK ((url ~ '^https?://'::text))
);

COMMENT ON TABLE public.photos IS 'Photos avant/après stockées sur Cloudinary';
COMMENT ON COLUMN public.photos.type IS 'before (avant intervention) ou after (après intervention)';

-- Contraintes
ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);

-- Clé étrangère avec CASCADE — les photos sont liées à la commande
ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Index
CREATE INDEX idx_photos_order ON public.photos USING btree (order_id);
CREATE INDEX idx_photos_type  ON public.photos USING btree (type);