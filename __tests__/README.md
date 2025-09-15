# Tests Documentation

Ce dossier contient tous les tests et la documentation associée pour l'application.

## 📁 Structure

```
__tests__/
├── README.md                           # Ce fichier
├── setup.ts                           # Configuration globale des tests
├── vitest.config.mts                  # Configuration Vitest
├── docs/                              # 📚 Documentation des tests
│   ├── FINAL-TESTING-SUMMARY.md       # Résumé complet de tous les tests
│   ├── ORGANIZATION-TESTING-STRATEGY.md # Stratégie pour les tests d'organisation
│   ├── ORGANIZATION-TESTS-SUMMARY.md   # Résumé des tests d'organisation
│   ├── TESTING-COMPLEX-FUNCTIONS.md    # Guide pour tester les fonctions complexes
│   ├── RESUME-CONFIGURATION.md         # Résumé de la configuration
│   ├── MANUAL-E2E-CHECKLIST.md        # Checklist pour tests E2E manuels
│   └── E2E-ORGANIZATION-GUIDE.md       # Guide pour tests E2E avec Playwright
├── utils/
│   └── test-utils.tsx                  # Utilitaires de test partagés
├── mocks/
│   └── next-navigation.ts              # Mocks Next.js
├── components/                         # Tests des composants
│   ├── ui/                            # Tests composants UI de base
│   ├── board/                         # Tests composants board/task
│   └── workspace/                     # Tests composants organisation
├── actions/                           # Tests des actions serveur
├── hooks/                             # Tests des hooks personnalisés
├── utils/                             # Tests des fonctions utilitaires
└── integration/                       # Tests d'intégration
```

## 🚀 Commandes Utiles

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec coverage
npm test -- --coverage

# Tests d'un dossier spécifique
npm test -- components/
npm test -- actions/
npm test -- integration/

# Tests d'un fichier spécifique
npm test -- invite-button.test.tsx
```

## 📊 Statistiques Actuelles

- **16 fichiers de tests**
- **81 tests** au total
- **100% de réussite**
- **Couverture** : Composants principaux, actions serveur, hooks, utilitaires

## 📚 Documentation

Consultez le dossier `docs/` pour :

- **Guides de configuration** et bonnes pratiques
- **Stratégies de test** par type de fonctionnalité
- **Résumés complets** de ce qui est testé
- **Guides E2E** pour les tests avancés

## 🎯 Prochaines Étapes

1. **Tests E2E** avec Playwright (voir `docs/E2E-ORGANIZATION-GUIDE.md`)
2. **Tests de performance** pour les composants lourds
3. **Tests d'accessibilité** automatisés
4. **Intégration CI/CD** pour les tests automatiques
