# 🪦 Mémoria - MVP

**Plateforme de mise en relation pour l'entretien de sépultures**

> Projet de fin d'études - RNCP Niveau 5 Développeur Web et Applications  
> Holberton School Bordeaux - Promotion C27  
> Porteur de projet : Philippe Lapique  
> Soutenance : 21 mars 2026

---

## 📖 Description

Mémoria est une marketplace web qui met en relation des **familles éloignées géographiquement** de leurs proches disparus avec des **prestataires locaux certifiés** pour l'entretien régulier des sépultures (nettoyage, dépôt de fleurs).

### Problème résolu

Les familles vivant loin des cimetières où reposent leurs proches rencontrent des difficultés pour :
- Se déplacer régulièrement sur de longues distances
- Maintenir l'entretien des sépultures
- Honorer la mémoire de leurs défunts

### Solution proposée

Une plateforme web permettant de :
- Commander en ligne un service d'entretien
- Payer de manière sécurisée (Stripe)
- Recevoir des photos avant/après intervention
- Suivre l'état des commandes en temps réel

---

## 🎯 Fonctionnalités principales (MVP)

### Pour les Clients
- ✅ Créer un compte
- ✅ Commander un service d'entretien
- ✅ Payer en ligne (Stripe mode test)
- ✅ Consulter le statut des commandes
- ✅ Voir l'historique complet

### Pour les Prestataires
- ✅ Créer un compte professionnel
- ✅ Consulter les missions disponibles (zone géographique)
- ✅ Accepter une mission
- ✅ Uploader les photos avant/après (Cloudinary)
- ✅ Recevoir des notifications

### Pour les Administrateurs
- ✅ Valider les comptes prestataires
- ✅ Valider les interventions terminées
- ✅ Gérer les litiges
- ✅ Consulter les statistiques plateforme

---

## 🛠️ Stack technique

### Frontend
- **React.js** 18.x
- **Tailwind CSS** 3.x
- **React Router** 6.x
- **Context API** (gestion état)

### Backend
- **Node.js** 20.x LTS
- **Express.js** 4.x
- **PostgreSQL** 16.x
- **JSON Web Tokens (JWT)** (authentification)

### APIs externes
- **Stripe** (paiements en mode test)
- **Cloudinary** (stockage photos)

### Outils
- **Git / GitHub** (versioning)
- **VS Code** (éditeur)
- **Postman** (tests API)
- **Trello** (gestion projet)

---

## 📂 Architecture du projet
```
memoria-mvp/
├─ backend/               # API Node.js + Express
│  ├─ config/            # Configuration (BDD, JWT, etc.)
│  ├─ controllers/       # Logique métier
│  ├─ models/            # Modèles de données
│  ├─ routes/            # Routes API
│  ├─ middlewares/       # Middlewares (auth, validation)
│  ├─ utils/             # Fonctions utilitaires
│  └─ server.js          # Point d'entrée backend
│
├─ frontend/             # Application React
│  ├─ public/            # Assets statiques
│  ├─ src/
│  │  ├─ components/     # Composants réutilisables
│  │  ├─ pages/          # Pages principales
│  │  ├─ context/        # Context API (état global)
│  │  ├─ services/       # Appels API
│  │  ├─ utils/          # Fonctions utilitaires
│  │  └─ App.jsx         # Composant racine
│  └─ package.json
│
├─ database/             # Scripts SQL
│  ├─ schema.sql         # Création des tables
│  └─ seed.sql           # Données de test
│
├─ docs/                 # Documentation
│  ├─ architecture.md    # Diagramme architecture
│  ├─ database.md        # Schéma BDD
│  └─ api.md             # Documentation API
│
├─ .gitignore
├─ README.md
└─ BRANCHING.md
```

---

## 🚀 Installation

### Prérequis

- Node.js 20.x LTS
- PostgreSQL 16.x
- Git

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
# Configurer les variables d'environnement dans .env
npm run dev
```

Le backend démarre sur `http://localhost:5000`

### 3. Installation Frontend
```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### 4. Configuration Base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE memoria_db;

# Exécuter le schéma
\c memoria_db
\i database/schema.sql
\i database/seed.sql
```

---

## 🧪 Tests

### Tests manuels

Les tests sont effectués manuellement avec :
- **Postman** pour l'API (collection disponible dans `/docs/postman/`)
- **Navigateurs** pour le frontend (Chrome, Firefox, Safari)

### Tests des 3 parcours utilisateurs complets

1. **Parcours Client** : Inscription → Commande → Paiement → Suivi
2. **Parcours Prestataire** : Inscription → Accepter mission → Upload photos
3. **Parcours Admin** : Validation prestataire → Validation intervention → Déblocage paiement

---

## 📊 Diagrammes

- [Architecture système](docs/architecture.md)
- [Schéma base de données](docs/database.md)
- [Documentation API](docs/api.md)

---

## 🗓️ Planning du projet

- **Sprint 0** (19-23 jan) : Setup technique
- **Sprint 1A** (26-30 jan) : Auth Backend Part 1
- **Sprint 1B+2** (2-6 fév) : Auth Backend Part 2 + Auth Frontend
- **Sprint 3** (9-13 fév) : Workflow Client
- **Sprint 4** (16-20 fév) : Workflow Prestataire
- **Sprint 5A** (23-24 fév) : Workflow Admin Part 1
- **Sprint 5B** (25-27 fév) : Workflow Admin Part 2 + Buffer
- **Sprint 6** (2-4 mars) : Documentation finale
- **MR** : 4 mars 2026

---

## 👤 Auteur

**Philippe Lapique**  
Étudiant Développeur Web - Holberton School Bordeaux  
Promotion C27 - 2026

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un projet pédagogique.  
Tous droits réservés © 2026 Philippe Lapique
