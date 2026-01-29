-- ============================================================================
-- MÉMORIA - Données initiales et de test
-- ============================================================================
-- Fichier: seed.sql
-- Description: Insère les données obligatoires + données de test
-- ============================================================================

-- ============================================================================
-- 0. NETTOYAGE (lance un supression des données fantomes)
-- ============================================================================

TRUNCATE TABLE
  orders,
  users,
  cemeteries,
  service_categories,
  roles
RESTART IDENTITY
CASCADE;

-- ============================================================================
-- 1. ROLES (données obligatoires)
-- ============================================================================

INSERT INTO roles (name, description) VALUES
  ('client', 'Utilisateur client passant des commandes d''entretien'),
  ('prestataire', 'Professionnel réalisant les interventions sur site'),
  ('admin', 'Administrateur de la plateforme Mémoria');

-- ============================================================================
-- 2. SERVICE CATEGORIES (données obligatoires)
-- ============================================================================

INSERT INTO service_categories (name, description, base_price, is_active) VALUES
  ('Nettoyage pierre tombale', 'Nettoyage complet de la pierre tombale avec produits adaptés', 45.00, true),
  ('Dépôt de fleurs', 'Dépôt d''un bouquet de fleurs fraîches sur la sépulture', 30.00, true);

-- ============================================================================
-- 3. CEMETERIES - Zone pilote Nouvelle-Aquitaine (données obligatoires)
-- ============================================================================

INSERT INTO cemeteries (name, city, postal_code, department, is_active) VALUES
  -- Gironde (33)
  ('Cimetière de la Chartreuse', 'Bordeaux', '33000', 'Gironde', true),
  ('Cimetière de la Chapelle', 'Bordeaux', '33000', 'Gironde', true),
  ('Cimetière Centre', 'Mérignac', '33700', 'Gironde', true),
  ('Cimetière du Bourg', 'Pessac', '33600', 'Gironde', true),
  ('Cimetière Nord', 'Talence', '33400', 'Gironde', true),
  
  -- Pyrénées-Atlantiques (64)
  ('Cimetière Urbain', 'Pau', '64000', 'Pyrénées-Atlantiques', true),
  ('Cimetière Saint-Martin', 'Pau', '64000', 'Pyrénées-Atlantiques', true),
  ('Cimetière Centre', 'Bayonne', '64100', 'Pyrénées-Atlantiques', true),
  
  -- Landes (40)
  ('Cimetière Saint-Pierre', 'Mont-de-Marsan', '40000', 'Landes', true),
  ('Cimetière Municipal', 'Dax', '40100', 'Landes', true);

-- ============================================================================
-- 4. USERS - Comptes de test
-- ============================================================================

-- Note: Les mots de passe ci-dessous sont en CLAIR pour le développement.
-- En production, ils seront hashés avec bcrypt dans le code Node.js
-- Format: '$2b$10$...' (hash bcrypt)

-- 4.1 ADMIN
INSERT INTO users (email, password_hash, role_id) VALUES
  ('admin@memoria.fr', 'Admin123!', (SELECT id FROM roles WHERE name = 'admin'));

-- 4.2 CLIENTS DE TEST
INSERT INTO users (email, password_hash, role_id) VALUES
  ('marie.dupont@example.com', 'Client123!', (SELECT id FROM roles WHERE name = 'client')),
  ('jean.martin@example.com', 'Client123!', (SELECT id FROM roles WHERE name = 'client')),
  ('sophie.bernard@example.com', 'Client123!', (SELECT id FROM roles WHERE name = 'client'));

-- 4.3 PRESTATAIRES DE TEST
INSERT INTO users (email, password_hash, role_id, zone_intervention, siret, rating) VALUES
  (
    'thomas.jardin@example.com',
    'Presta123!',
    (SELECT id FROM roles WHERE name = 'prestataire'),
    'Gironde',
    '12345678901234',
    4.5
  ),
  (
    'sophie.entretien@example.com',
    'Presta123!',
    (SELECT id FROM roles WHERE name = 'prestataire'),
    'Gironde',
    '98765432109876',
    4.8
  ),
  (
    'pierre.paysage@example.com',
    'Presta123!',
    (SELECT id FROM roles WHERE name = 'prestataire'),
    'Pyrénées-Atlantiques',
    '11223344556677',
    4.2
  );

-- ============================================================================
-- 5. ORDERS - Commandes de test
-- ============================================================================

-- Note: On utilise des variables temporaires pour récupérer les UUIDs

DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  presta1_id UUID;
  presta2_id UUID;
  cemetery1_id INTEGER;
  cemetery2_id INTEGER;
  service1_id INTEGER;
  service2_id INTEGER;
BEGIN
  -- Récupérer les IDs des utilisateurs de test
  SELECT id INTO client1_id FROM users WHERE email = 'marie.dupont@example.com';
  SELECT id INTO client2_id FROM users WHERE email = 'jean.martin@example.com';
  SELECT id INTO presta1_id FROM users WHERE email = 'thomas.jardin@example.com';
  SELECT id INTO presta2_id FROM users WHERE email = 'sophie.entretien@example.com';
  
  -- Récupérer les IDs des cimetières
  SELECT id INTO cemetery1_id FROM cemeteries WHERE name = 'Cimetière de la Chartreuse' LIMIT 1;
  SELECT id INTO cemetery2_id FROM cemeteries WHERE name = 'Cimetière Centre' AND city = 'Mérignac' LIMIT 1;
  
  -- Récupérer les IDs des services
  SELECT id INTO service1_id FROM service_categories WHERE name = 'Nettoyage pierre tombale';
  SELECT id INTO service2_id FROM service_categories WHERE name = 'Dépôt de fleurs';
  
  -- Commande 1: En attente d'acceptation
  INSERT INTO orders (client_id, cemetery_id, service_category_id, cemetery_location, status, price, created_at)
  VALUES (
    client1_id,
    cemetery1_id,
    service1_id,
    'Allée principale, Carré B, Tombe n°45',
    'pending',
    45.00,
    NOW() - INTERVAL '2 days'
  );
  
  -- Commande 2: Acceptée par prestataire
  INSERT INTO orders (client_id, prestataire_id, cemetery_id, service_category_id, cemetery_location, status, price, created_at, accepted_at)
  VALUES (
    client2_id,
    presta1_id,
    cemetery2_id,
    service2_id,
    'Section Est, Rangée 12',
    'accepted',
    30.00,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days'
  );
  
  -- Commande 3: Complétée, en attente validation admin
  INSERT INTO orders (client_id, prestataire_id, cemetery_id, service_category_id, cemetery_location, status, price, created_at, accepted_at, completed_at)
  VALUES (
    client1_id,
    presta2_id,
    cemetery1_id,
    service1_id,
    'Caveau familial, Allée des Cyprès',
    'completed',
    45.00,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '2 days'
  );
  
  -- Commande 4: Validée
  INSERT INTO orders (client_id, prestataire_id, cemetery_id, service_category_id, cemetery_location, status, price, created_at, accepted_at, completed_at, validated_at)
  VALUES (
    client2_id,
    presta1_id,
    cemetery2_id,
    service1_id,
    'Monument familial, Carré central',
    'validated',
    45.00,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '7 days'
  );
END $$;

-- ============================================================================
-- 6. PHOTOS - Photos de test (simulation)
-- ============================================================================

-- Note: En prod, les URLs pointeront vers Cloudinary
-- Ici, on utilise des URLs de placeholder pour la démo

DO $$
DECLARE
  order_completed_id UUID;
  order_validated_id UUID;
BEGIN
  -- Récupérer l'ID de la commande completed
  SELECT id INTO order_completed_id FROM orders WHERE status = 'completed' LIMIT 1;
  
  -- Récupérer l'ID de la commande validated
  SELECT id INTO order_validated_id FROM orders WHERE status = 'validated' LIMIT 1;
  
  -- Photos pour commande completed
  IF order_completed_id IS NOT NULL THEN
    INSERT INTO photos (order_id, type, url, cloudinary_public_id, uploaded_at) VALUES
      (order_completed_id, 'before', 'https://via.placeholder.com/800x600/cccccc/000000?text=Photo+Avant', 'memoria/before_001', NOW() - INTERVAL '2 days'),
      (order_completed_id, 'after', 'https://via.placeholder.com/800x600/90EE90/000000?text=Photo+Apres', 'memoria/after_001', NOW() - INTERVAL '2 days');
  END IF;
  
  -- Photos pour commande validated
  IF order_validated_id IS NOT NULL THEN
    INSERT INTO photos (order_id, type, url, cloudinary_public_id, uploaded_at) VALUES
      (order_validated_id, 'before', 'https://via.placeholder.com/800x600/cccccc/000000?text=Photo+Avant+2', 'memoria/before_002', NOW() - INTERVAL '8 days'),
      (order_validated_id, 'after', 'https://via.placeholder.com/800x600/90EE90/000000?text=Photo+Apres+2', 'memoria/after_002', NOW() - INTERVAL '8 days');
  END IF;
END $$;

-- ============================================================================
-- 7. PAYMENTS - Paiements de test
-- ============================================================================

DO $$
DECLARE
  order_completed_id UUID;
  order_validated_id UUID;
BEGIN
  -- Récupérer les IDs des commandes
  SELECT id INTO order_completed_id FROM orders WHERE status = 'completed' LIMIT 1;
  SELECT id INTO order_validated_id FROM orders WHERE status = 'validated' LIMIT 1;
  
  -- Paiement pour commande completed (bloqué)
  IF order_completed_id IS NOT NULL THEN
    INSERT INTO payments (order_id, stripe_payment_intent_id, amount, status, created_at) VALUES
      (order_completed_id, 'pi_test_' || substr(md5(random()::text), 0, 25), 45.00, 'succeeded', NOW() - INTERVAL '10 days');
  END IF;
  
  -- Paiement pour commande validated (débloqué)
  IF order_validated_id IS NOT NULL THEN
    INSERT INTO payments (order_id, stripe_payment_intent_id, stripe_transfer_id, amount, status, created_at, released_at) VALUES
      (order_validated_id, 'pi_test_' || substr(md5(random()::text), 0, 25), 'tr_test_' || substr(md5(random()::text), 0, 25), 45.00, 'released', NOW() - INTERVAL '15 days', NOW() - INTERVAL '7 days');
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION - Compter les enregistrements créés
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== SEED TERMINÉ ===';
  RAISE NOTICE 'Roles: %', (SELECT COUNT(*) FROM roles);
  RAISE NOTICE 'Service categories: %', (SELECT COUNT(*) FROM service_categories);
  RAISE NOTICE 'Cemeteries: %', (SELECT COUNT(*) FROM cemeteries);
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
  RAISE NOTICE 'Photos: %', (SELECT COUNT(*) FROM photos);
  RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM payments);
  RAISE NOTICE '====================';
END $$;

-- ============================================================================
-- COMPTES DE TEST - RÉCAPITULATIF
-- ============================================================================

-- ADMIN:
--   Email: admin@memoria.fr
--   Password: Admin123!

-- CLIENTS:
--   Email: marie.dupont@example.com | Password: Client123!
--   Email: jean.martin@example.com | Password: Client123!
--   Email: sophie.bernard@example.com | Password: Client123!

-- PRESTATAIRES:
--   Email: thomas.jardin@example.com | Password: Presta123! (Zone: Gironde, Note: 4.5)
--   Email: sophie.entretien@example.com | Password: Presta123! (Zone: Gironde, Note: 4.8)
--   Email: pierre.paysage@example.com | Password: Presta123! (Zone: Pyrénées-Atlantiques, Note: 4.2)

-- ============================================================================
-- FIN DU SEED
-- ============================================================================