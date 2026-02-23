# Base de données Mémoria

## Structure

```
database/
├── migrations/          # Scripts de création des tables (ordre important)
│   ├── 01_extensions_and_enums.sql   — pgcrypto + types ENUM
│   ├── 02_create_roles.sql           — Rôles utilisateurs
│   ├── 03_create_users.sql           — Utilisateurs (clients, prestataires, admins)
│   ├── 04_create_service_categories.sql — Catalogue des prestations
│   ├── 05_create_cemeteries.sql      — Cimetières de la zone pilote
│   ├── 06_create_orders.sql          — Commandes (cycle de vie complet)
│   ├── 07_create_payments.sql        — Transactions Stripe
│   ├── 08_create_photos.sql          — Photos avant/après (Cloudinary)
│   ├── 09_create_reviews.sql         — Avis et notations
│   ├── 10_create_notifications.sql   — Notifications
│   └── 11_create_service_durations.sql — Durées estimées (annexe)
└── seeds/               # Données initiales obligatoires
    ├── 01_seed_roles.sql             — 3 rôles (client, prestataire, admin)
    └── 02_seed_service_categories.sql — 4 prestations de base
```

## Exécution

### Première installation (base vide)

```bash
# 1. Créer la base et l'utilisateur
sudo -u postgres psql -c "CREATE USER memoria_user WITH PASSWORD 'votre_mot_de_passe';"
sudo -u postgres psql -c "CREATE DATABASE memoria_db OWNER memoria_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE memoria_db TO memoria_user;"

# 2. Exécuter les migrations dans l'ordre
for file in database/migrations/*.sql; do
    echo "Exécution : $file"
    psql -U memoria_user -d memoria_db -f "$file"
done

# 3. Insérer les données initiales
for file in database/seeds/*.sql; do
    echo "Seed : $file"
    psql -U memoria_user -d memoria_db -f "$file"
done
```

### En une seule commande

```bash
cat database/migrations/*.sql database/seeds/*.sql | psql -U memoria_user -d memoria_db
```

### Vérification

```bash
psql -U memoria_user -d memoria_db -c "\dt"
```

## Ordre des dépendances

Les migrations doivent être exécutées dans l'ordre numérique en raison des dépendances entre tables :

```
01_enums
  └─ 02_roles
       └─ 03_users
            ├─ 04_service_categories
            │    └─ 11_service_durations
            ├─ 05_cemeteries
            └─ 06_orders (dépend de users + service_categories + cemeteries)
                 ├─ 07_payments
                 ├─ 08_photos
                 ├─ 09_reviews
                 └─ 10_notifications
```

## Reset complet (développement uniquement)

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS memoria_db;"
sudo -u postgres psql -c "CREATE DATABASE memoria_db OWNER memoria_user;"
# Puis relancer les migrations
```