-- ============================================================
-- Migration 10 : Table notifications
-- Notifications et alertes pour tous les utilisateurs
-- SET NULL sur order_id si la commande est supprimée (on garde la notif)
-- Dépend de : 03_create_users, 06_create_orders
-- ============================================================

CREATE TABLE public.notifications (
    id         integer NOT NULL,
    user_id    uuid NOT NULL,
    type       character varying(50)  NOT NULL,  -- Ex: mission_validated, dispute, new_mission
    title      character varying(255) NOT NULL,
    message    text NOT NULL,
    order_id   uuid,                             -- NULL si notification non liée à une commande
    is_read    boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Notifications et alertes pour les utilisateurs';
COMMENT ON COLUMN public.notifications.type IS 'Type: mission_validated, new_mission, dispute, reminder, schedule_needed, photos_available';
COMMENT ON COLUMN public.notifications.is_read IS 'Indique si la notification a été lue par l''utilisateur';

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);

-- Contraintes
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

-- Clés étrangères
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; -- Garde la notif même si commande supprimée

-- Index
CREATE INDEX idx_notifications_user_id    ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_is_read    ON public.notifications USING btree (is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);