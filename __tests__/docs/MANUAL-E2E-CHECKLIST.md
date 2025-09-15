# Checklist Tests E2E Manuels

## 🎯 Workflows Critiques à Tester

### 1. Authentification

- [ ] Connexion avec email/mot de passe
- [ ] Déconnexion
- [ ] Redirection après connexion
- [ ] Protection des pages privées

### 2. Gestion des Boards

- [ ] Créer un nouveau board
- [ ] Modifier le titre d'un board
- [ ] Supprimer un board
- [ ] Navigation entre boards

### 3. Gestion des Colonnes

- [ ] Ajouter une nouvelle colonne
- [ ] Modifier le titre d'une colonne
- [ ] Réorganiser les colonnes (drag & drop)
- [ ] Supprimer une colonne

### 4. Gestion des Tâches

- [ ] Créer une nouvelle tâche
- [ ] Modifier le contenu d'une tâche
- [ ] Déplacer une tâche entre colonnes
- [ ] Réorganiser les tâches dans une colonne
- [ ] Supprimer une tâche

### 5. Persistance des Données

- [ ] Actualiser la page → données conservées
- [ ] Fermer/rouvrir l'onglet → données conservées
- [ ] Se déconnecter/reconnecter → données conservées

### 6. Responsive Design

- [ ] Interface mobile fonctionnelle
- [ ] Drag & drop sur mobile
- [ ] Navigation mobile

### 7. Performance

- [ ] Chargement initial < 3 secondes
- [ ] Interactions fluides
- [ ] Pas de bugs visuels

## 🚀 Quand Automatiser ?

Automatise avec Playwright quand :

- [ ] Tu répètes ces tests souvent
- [ ] Tu veux tester sur plusieurs navigateurs
- [ ] Tu veux intégrer dans CI/CD
- [ ] L'équipe grandit

## 📋 Template de Bug Report

Quand tu trouves un problème :

```
**Étapes pour reproduire :**
1.
2.
3.

**Résultat attendu :**

**Résultat actuel :**

**Navigateur :** Chrome/Firefox/Safari
**Device :** Desktop/Mobile
**URL :**
```
