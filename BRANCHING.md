# 🌿 Stratégie de Branching - Mémoria MVP

## 📋 Vue d'ensemble

Ce document décrit la stratégie de gestion des branches Git utilisée pour le projet Mémoria. L'approche adoptée est **simplifiée** et adaptée au **développement solo**, tout en respectant les bonnes pratiques professionnelles.

---

## 🌳 Structure des branches

### `main`
**Branche de production**

- Contient **uniquement du code stable et déployable**
- Chaque commit sur `main` représente un **jalon fonctionnel validé**
- **Protégée en écriture directe** : pas de commit direct sur cette branche
- Tous les ajouts passent par des branches `feature/*`

**Règle :** Si le code est sur `main`, il doit fonctionner sans erreur.

---

### `feature/*`
**Branches temporaires de développement**

- Créées depuis `main` pour développer une fonctionnalité spécifique
- Nomenclature : `feature/nom-court-fonctionnalite`
- Durée de vie : **courte** (quelques heures à quelques jours max)
- **Supprimées après merge** dans `main`

**Exemples :**
```
feature/setup-backend
feature/user-authentication
feature/order-creation
feature/stripe-integration
feature/admin-dashboard
```

---

## 🔄 Workflow de développement

### 1️⃣ Créer une branche feature

Toujours partir de `main` à jour :
```bash
# S'assurer d'être sur main et à jour
git checkout main
git pull origin main

# Créer et basculer sur la nouvelle branche
git checkout -b feature/nom-fonctionnalite
```

---

### 2️⃣ Développer avec commits réguliers

Travailler sur la branche `feature/*` avec des commits fréquents :
```bash
# Développer la fonctionnalité...

# Ajouter les fichiers modifiés
git add .

# Commit avec message normalisé
git commit -m "feat: description de la fonctionnalité"

# Continuer le développement...
git add .
git commit -m "fix: correction d'un bug"
```

**Bonnes pratiques :**
- Commits **atomiques** (une modification logique = un commit)
- Messages **clairs et descriptifs**
- Commits **fréquents** (ne pas attendre d'avoir tout fini)

---

### 3️⃣ Tests complets sur la branche

Avant de merger dans `main`, **valider** :

✅ Le code fonctionne sans erreur  
✅ Les tests manuels passent  
✅ Pas de régression sur les fonctionnalités existantes  
✅ Le code est commenté et documenté  

---

### 4️⃣ Merge vers main

Une fois la fonctionnalité **complète et testée** :
```bash
# Basculer sur main
git checkout main

# S'assurer d'être à jour
git pull origin main

# Merger la branche feature
git merge feature/nom-fonctionnalite

# Pusher sur GitHub
git push origin main
```

---

### 5️⃣ Suppression de la branche feature

Après le merge réussi, **supprimer la branche** devenue inutile :
```bash
# Supprimer localement
git branch -d feature/nom-fonctionnalite

# Supprimer sur GitHub (si elle a été push)
git push origin --delete feature/nom-fonctionnalite
```

---

## 📝 Convention de nommage des commits

### Format standard
```
type: message court et clair
```

### Types de commits

| Type | Usage | Exemple |
|------|-------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: add user registration endpoint` |
| `fix` | Correction de bug | `fix: correct password hashing issue` |
| `docs` | Documentation uniquement | `docs: update API documentation` |
| `style` | Formatting, missing semi-colons, etc. | `style: format code with prettier` |
| `refactor` | Refactorisation du code | `refactor: simplify order validation logic` |
| `test` | Ajout ou modification de tests | `test: add Postman tests for auth` |
| `chore` | Maintenance (gitignore, config, dependencies) | `chore: update npm dependencies` |

### Exemples de bons messages

✅ **BONS exemples :**
```
feat: add JWT authentication middleware
fix: resolve database connection timeout
docs: add API endpoint documentation
refactor: extract validation logic to utils
chore: configure eslint rules
```

❌ **MAUVAIS exemples :**
```
update
fixed bug
changes
wip
test
```

---

## 🚫 Ce qu'il ne faut PAS faire

❌ **Commiter directement sur `main`**  
→ Toujours passer par une branche `feature/*`

❌ **Pusher du code non testé**  
→ Toujours valider avant de merger

❌ **Commiter des fichiers sensibles**  
→ Vérifier le `.gitignore` (`.env`, `node_modules`, etc.)

❌ **Messages de commit vagues**  
→ Utiliser la convention de nommage

❌ **Garder des branches feature mortes**  
→ Supprimer après merge

---

## 🎯 Exemple pratique complet

Scénario : Développer l'authentification utilisateur
```bash
# 1. Créer la branche depuis main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 2. Développer et commiter régulièrement
# ... développement endpoint register ...
git add backend/routes/auth.js backend/controllers/authController.js
git commit -m "feat: add user registration endpoint"

# ... développement endpoint login ...
git add backend/routes/auth.js backend/controllers/authController.js
git commit -m "feat: add user login with JWT generation"

# ... tests Postman ...
git add docs/postman/auth-collection.json
git commit -m "docs: add Postman collection for auth endpoints"

# 3. Tests complets
# Valider que tout fonctionne (Postman, tests manuels)

# 4. Merger dans main
git checkout main
git pull origin main
git merge feature/user-authentication
git push origin main

# 5. Supprimer la branche
git branch -d feature/user-authentication
```

---

## 📚 Résumé visuel
```
main (production)
  │
  ├─── feature/setup-backend ──┐
  │                             ├──> merge
  │                             │
  ├─── feature/user-auth ───────┐
  │                             ├──> merge
  │                             │
  ├─── feature/order-system ────┐
  │                             ├──> merge
  │                             │
  └─── ...
```

---

## ✅ Checklist avant chaque merge

Avant de merger une branche `feature/*` dans `main`, vérifier :

- [ ] Le code fonctionne sans erreur
- [ ] Les tests manuels sont passés
- [ ] Le code est commenté (en français)
- [ ] Pas de fichiers sensibles (.env, credentials)
- [ ] Les commits ont des messages clairs
- [ ] La documentation est à jour si nécessaire

---

## 🎓 Pourquoi cette stratégie ?

### Avantages pour Mémoria 

✅ **Simplicité** : Pas de branche `dev` ou `staging`
✅ **Clarté** : Historique Git propre et lisible  
✅ **Sécurité** : `main` toujours stable et déployable  
✅ **Professionnalisme** : Bonnes pratiques applicables en entreprise  
✅ **Flexibilité** : Possibilité de revenir en arrière facilement  

---

## 📞 Besoin d'aide ?

En cas de doute sur la stratégie Git :
1. Consulter ce document
2. Vérifier l'historique Git : `git log --oneline --graph`
3. Demander de l'aide au formateur Holberton School

---

**Dernière mise à jour :** 19 janvier 2026  
**Auteur :** Philippe Lapique - Holberton School Bordeaux C27
