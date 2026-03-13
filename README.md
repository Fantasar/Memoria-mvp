# Mémoria - MVP
Plateforme de mise en relation pour l'entretien de sépultures

Projet de fin d'études - RNCP Niveau 5 Développeur Web et Applications
Holberton School Bordeaux - Promotion C27
Porteur de projet : Philippe Lapique
Soutenance : 21 mars 2026

---

##  Description

Mémoria est une marketplace web qui met en relation des familles éloignées 
géographiquement de leurs proches disparus avec des prestataires locaux certifiés 
pour l'entretien régulier des sépultures (nettoyage, dépôt de fleurs).

### Problème résolu

Les familles vivant loin des cimetières où reposent leurs proches rencontrent 
des difficultés pour :

- Se déplacer régulièrement sur de longues distances
- Maintenir l'entretien des sépultures
- Honorer la mémoire de leurs défunts

### Solution proposée

Une plateforme web permettant de :

- Commander en ligne un service d'entretien
- Payer de manière sécurisée via Stripe
- Recevoir des photos avant/après intervention
- Suivre l'état des commandes en temps réel
- Communiquer avec l'équipe Mémoria via messagerie intégrée

---

##  Fonctionnalités principales (MVP)

### Pour les Clients
-  Créer un compte et gérer son profil
-  Commander un service d'entretien via carte Google Maps
-  Payer en ligne (Stripe mode test)
-  Consulter le statut des commandes en temps réel
-  Voir l'historique complet des prestations
-  Accéder à la galerie photos avant/après de ses interventions
-  Laisser un avis et une note sur le prestataire
-  Annuler une commande
-  Récupérer son mot de passe par SMS (Brevo)
-  Contacter le support via formulaire de contact ou messagerie Crisp
-  Exporter une facture PDF

### Pour les Prestataires
-  Créer un compte professionnel (SIRET)
-  Gérer ses documents d'inscription via Cloudinary
-  Consulter les missions disponibles sur carte géolocalisée
-  Modifier sa zone d'intervention
-  Accepter une mission
-  Uploader les photos avant/après (Cloudinary)
-  Suivre un calendrier de missions avec limite journalière
-  Consulter ses finances et exporter un PDF
-  Voir l'historique complet de ses prestations
-  Recevoir des notifications (missions, paiements, litiges)
-  Consulter les avis et notes le concernant
-  Récupérer son mot de passe par SMS (Brevo)
-  Contacter le support via messagerie Crisp

### Pour les Administrateurs
-  Valider ou rejeter les comptes prestataires
-  Valider les interventions terminées et déclencher les paiements
-  Gérer les litiges (validation / remboursement / correction)
-  Consulter les statistiques plateforme
-  Gérer le glossaire des utilisateurs et prestataires
-  Gérer les cimetières (consultation + ajout)
-  Gérer les services disponibles (consultation + ajout)
-  Consulter les finances de la plateforme
-  Accéder à la galerie photos de toutes les interventions
-  Consulter l'historique complet des prestations
-  Gérer les messages (Crisp + formulaire de contact)

---

## ️ Stack technique

### Frontend
- React.js 18.x
- Tailwind CSS 3.x
- React Router 6.x
- Context API (gestion état global)
- Axios (appels API)
- jsPDF (export PDF)
- Google Maps JavaScript API

### Backend
- Node.js 20.x LTS
- Express.js 4.x
- PostgreSQL 16.x
- JSON Web Tokens — JWT (authentification stateless)
- bcrypt (hashage mots de passe)
- multer (upload fichiers)

### APIs externes
- Stripe (paiements en mode test)
- Cloudinary (stockage photos et documents)
- Brevo / Sendinblue (SMS et emails transactionnels — serveurs EU)
- Google Maps API (géolocalisation et géocodage automatique)
- Crisp (messagerie temps réel)

### Déploiement
- Vercel (frontend)
- Render (backend + PostgreSQL managé)

### Outils
- Git / GitHub (versioning)
- VS Code (éditeur)
- Postman (tests API)
- Trello (gestion projet agile)
- Ngrok (tests webhooks en local)

---

##  Architecture du projet
```
memoria-mvp/
├─ backend/
│  ├─ config/            # Configuration BDD, JWT, Cloudinary
│  ├─ controllers/       # Gestion des requêtes HTTP
│  ├─ services/          # Logique métier
│  ├─ repositories/      # Accès base de données (SQL uniquement)
│  ├─ routes/            # Définition des endpoints API
│  ├─ middleware/        # JWT, validation, gestion erreurs
│  ├─ utils/             # Fonctions utilitaires
│  └─ server.js          # Point d'entrée backend
│
├─ frontend/
│  ├─ public/            # Assets statiques
│  ├─ src/
│  │  ├─ components/     # Composants réutilisables
│  │  ├─ pages/          # Pages et dashboards
│  │  ├─ context/        # AuthContext (état global)
│  │  ├─ hooks/          # Hooks personnalisés (useAuth, useForm)
│  │  ├─ services/       # Appels API via Axios
│  │  └─ App.jsx         # Composant racine
│  └─ package.json
│
├─ database/
│  ├─ migrations/        # 11 fichiers SQL versionnés (ordre d'exécution)
│  ├─ seeds/             # Données initiales (rôles, services, cimetières)
│  └─ README.md          # Guide d'exécution des migrations
│
├─ postman/              # Collection de tests API exportée
├─ .env.example          # Variables d'environnement documentées
├─ .gitignore
├─ README.md
└─ BRANCHING.md
```

---

##  Installation

### Prérequis
- Node.js 20.x LTS
- PostgreSQL 16.x
- Git
- Un compte Stripe (mode test)
- Un compte Cloudinary
- Un compte Brevo
- Une clé API Google Maps

### 1. Clone du repository
```bash
git clone https://github.com/fantasar/memoria-mvp.git
cd memoria-mvp
```

### 2. Installation Backend
```bash
cd backend
npm install
cp .env.example .env
# Renseigner toutes les variables dans .env
npm run dev
```

Le backend démarre sur http://localhost:5500

### 3. Installation Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Renseigner toutes les variables dans .env
npm run dev
```

Le frontend démarre sur http://localhost:5173

### 4. Configuration Base de données
```bash
# Se connecter à PostgreSQL en superutilisateur
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE memoria_db;
\q

# Exécuter les migrations dans l'ordre
cd database/migrations
sudo -u postgres psql memoria_db -f 01_extensions_enums.sql
sudo -u postgres psql memoria_db -f 02_create_roles.sql
sudo -u postgres psql memoria_db -f 03_create_users.sql
sudo -u postgres psql memoria_db -f 04_create_service_categories.sql
sudo -u postgres psql memoria_db -f 05_create_cemeteries.sql
sudo -u postgres psql memoria_db -f 06_create_orders.sql
sudo -u postgres psql memoria_db -f 07_create_payments.sql
sudo -u postgres psql memoria_db -f 08_create_photos.sql
sudo -u postgres psql memoria_db -f 09_create_reviews.sql
sudo -u postgres psql memoria_db -f 10_create_notifications.sql
sudo -u postgres psql memoria_db -f 11_create_messages.sql

# Exécuter les seeds
cd ../seeds
sudo -u postgres psql memoria_db -f 01_seed_roles.sql
sudo -u postgres psql memoria_db -f 02_seed_service_categories.sql
sudo -u postgres psql memoria_db -f 03_seed_cemeteries.sql
```

> ️ Les migrations doivent impérativement être exécutées dans l'ordre numérique.
> Le README détaillé dans `/database/README.md` explique chaque fichier et ses dépendances.

---

##  Variables d'environnement

### Backend — fichier `backend/.env`
```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/memoria_db

# JWT
JWT_SECRET=votre_secret_jwt_32_caracteres_minimum

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Brevo (serveurs EU)
BREVO_API_KEY=votre_cle_api_brevo

# Google Maps
GOOGLE_MAPS_API_KEY=votre_cle_google_maps

# CORS
FRONTEND_URL=http://localhost:5173

# Serveur
PORT=5500
```

### Frontend — fichier `frontend/.env`
```env
# API Backend
VITE_API_URL=http://localhost:5500

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=votre_cle_google_maps

# Crisp
VITE_CRISP_WEBSITE_ID=votre_crisp_website_id
```

---

##  Tests

### Tests API — Postman

La collection Postman complète est disponible dans `/postman/`.
Elle couvre 20 à 30 endpoints avec les cas nominaux et les cas d'erreur
(401, 403, 400, 404).

Endpoints principaux testés :
- `POST /api/auth/register` — inscription 3 rôles
- `POST /api/auth/login` — connexion + génération JWT
- `POST /api/orders` — création commande
- `GET /api/orders/available` — missions disponibles par zone
- `PATCH /api/orders/:id/accept` — acceptation mission
- `PATCH /api/orders/:id/validate` — validation admin
- `POST /api/photos/upload` — upload Cloudinary
- `POST /api/payments/confirm` — confirmation Stripe

### Tests fonctionnels manuels

Trois parcours utilisateurs complets testés à chaque fin de sprint :

**Parcours Client**
Inscription → Commande via Maps → Paiement Stripe → Suivi → Avis → Facture PDF

**Parcours Prestataire**
Inscription → Validation admin → Consultation missions → Acceptation → Upload photos → Complétion

**Parcours Admin**
Validation prestataire → Validation intervention → Gestion litige → Statistiques

### Tests de sécurité
- Routes protégées sans token → 401 Unauthorized
- Accès rôle incorrect → 403 Forbidden
- Mots de passe hashés bcrypt en BDD
- Requêtes SQL paramétrées (protection injection SQL)
- Variables sensibles uniquement dans `.env`

---

##  Déploiement

### URLs de production
- **Frontend :** https://memoria-mvp-rust.vercel.app/
- **Backend API :** https://memoria-backend-5aj1.onrender.com/

### Déploiement continu
Render et Vercel déploient automatiquement à chaque push sur la branche `main`.

### Exécution des migrations en production
```bash
# Depuis le dashboard Render ou via psql distant
psql $DATABASE_URL -f database/migrations/01_extensions_enums.sql
# Répéter pour chaque fichier dans l'ordre
```

---

## ️ Planning du projet

| Sprint | Période | Focus |
|---|---|---|
| Sprint 00 | 19-23 jan | Setup technique |
| Sprint 01A | 26-30 jan | Auth Backend Part 1 |
| Sprint 01B+02 | 2-6 fév | Auth Backend Part 2 + Auth Frontend |
| Sprint 03 | 9-13 fév | Workflow Client |
| Sprint 04 | 16-20 fév | Workflow Prestataire |
| Sprint 05A | 23-24 fév | Workflow Admin Part 1 |
| Sprint 05B | 25-27 fév | Workflow Admin Part 2 |
| Sprint Bonus A | 16-22 fév | Fonctionnalités hors scope — Admin, Prestataire, Maps, Avis |
| Sprint Bonus B | 23 fév-1 mars | Refactor, Migrations, Brevo, Crisp, PDF, Factures |
| Sprint 09 | 2-4 mars | Déploiement production + Documentation finale |

Revue technique : 4 mars 2026
Soutenance finale : 21 mars 2026

---

##  Auteur

Philippe Lapique
Étudiant Développeur Web — Holberton School Bordeaux
Promotion C27 — 2026

---

##  Licence

Ce projet est réalisé dans le cadre d'un projet pédagogique.
Tous droits réservés © 2026 Philippe Lapique

