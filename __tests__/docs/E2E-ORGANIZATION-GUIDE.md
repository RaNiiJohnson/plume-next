# Guide Tests E2E pour les Organisations

## 🎯 Scénarios E2E Critiques

### 1. Workflow Complet d'Invitation Multi-Utilisateur

```typescript
// Exemple de test E2E avec Playwright
test("Complete invitation workflow", async ({ page, context }) => {
  // 1. Admin envoie une invitation
  await page.goto("/workspace/org-123");
  await page.click('[data-testid="invite-member"]');
  await page.fill('[data-testid="email-input"]', "newuser@test.com");
  await page.selectOption('[data-testid="role-select"]', "member");
  await page.click('[data-testid="send-invitation"]');

  // Vérifier le toast de succès
  await expect(page.locator(".toast")).toContainText("Invitation sent");

  // 2. Simuler la réception d'email (si configuré)
  // const invitationLink = await getInvitationLinkFromEmail();

  // 3. Nouvel utilisateur accepte l'invitation
  const newUserPage = await context.newPage();
  await newUserPage.goto("/invite/invitation-123");
  await newUserPage.click('[data-testid="accept-invitation"]');

  // 4. Vérifier la redirection vers l'organisation
  await expect(newUserPage).toHaveURL("/workspace/org-123");

  // 5. Vérifier que le membre apparaît dans la liste
  await page.reload();
  await expect(page.locator('[data-testid="member-list"]')).toContainText(
    "newuser@test.com"
  );
});
```

### 2. Tests de Permissions par Rôle

```typescript
test("Role-based permissions", async ({ page }) => {
  // Test en tant que Member
  await loginAs(page, "member@test.com");
  await page.goto("/workspace/org-123/settings");

  // Member ne peut pas voir les paramètres sensibles
  await expect(
    page.locator('[data-testid="delete-organization"]')
  ).not.toBeVisible();

  // Test en tant qu'Admin
  await loginAs(page, "admin@test.com");
  await page.goto("/workspace/org-123/settings");

  // Admin peut voir plus d'options
  await expect(page.locator('[data-testid="manage-members"]')).toBeVisible();
});
```

### 3. Tests de Gestion des Membres

```typescript
test("Member management workflow", async ({ page }) => {
  await loginAs(page, "admin@test.com");
  await page.goto("/workspace/org-123/members");

  // Changer le rôle d'un membre
  await page.click('[data-testid="member-john-options"]');
  await page.click('[data-testid="change-role"]');
  await page.selectOption('[data-testid="new-role"]', "admin");
  await page.click('[data-testid="confirm-role-change"]');

  // Vérifier le changement
  await expect(page.locator('[data-testid="member-john-role"]')).toContainText(
    "Admin"
  );

  // Supprimer un membre
  await page.click('[data-testid="member-jane-options"]');
  await page.click('[data-testid="remove-member"]');
  await page.click('[data-testid="confirm-removal"]');

  // Vérifier la suppression
  await expect(page.locator('[data-testid="member-jane"]')).not.toBeVisible();
});
```

## 🔧 Configuration Playwright pour les Organisations

### playwright.config.ts

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  use: {
    baseURL: "http://localhost:3000",
    // Configuration pour les tests multi-utilisateurs
    storageState: "auth-states/admin.json",
  },
  projects: [
    {
      name: "admin-user",
      use: { storageState: "auth-states/admin.json" },
    },
    {
      name: "member-user",
      use: { storageState: "auth-states/member.json" },
    },
  ],
});
```

### Utilitaires pour les Tests E2E

```typescript
// tests-e2e/utils/auth-helpers.ts
export async function loginAs(page: Page, email: string) {
  await page.goto("/auth/signin");
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', "password123");
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL("/");
}

export async function createTestOrganization(page: Page, name: string) {
  await page.goto("/");
  await page.click('[data-testid="create-organization"]');
  await page.fill('[data-testid="org-name"]', name);
  await page.click('[data-testid="create-org-button"]');
  return page.url().match(/workspace\/(.+)/)?.[1];
}
```

## 📋 Checklist Tests E2E Organisations

### Tests d'Invitation

- [ ] Envoyer invitation avec différents rôles
- [ ] Accepter invitation valide
- [ ] Refuser invitation
- [ ] Gérer invitation expirée
- [ ] Gérer invitation avec email incorrect
- [ ] Annuler invitation en attente

### Tests de Membres

- [ ] Afficher liste des membres
- [ ] Changer rôle d'un membre
- [ ] Supprimer un membre
- [ ] Membre quitte l'organisation
- [ ] Permissions par rôle

### Tests d'Organisation

- [ ] Créer nouvelle organisation
- [ ] Modifier paramètres organisation
- [ ] Supprimer organisation
- [ ] Navigation entre organisations

### Tests de Performance

- [ ] Chargement liste membres (>100 membres)
- [ ] Recherche dans les membres
- [ ] Pagination des invitations

### Tests Cross-Browser

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (si applicable)
- [ ] Mobile (responsive)

## 🚀 Commandes Utiles

```bash
# Installer Playwright
pnpm create playwright

# Lancer tous les tests E2E
pnpm exec playwright test

# Lancer tests spécifiques
pnpm exec playwright test invitation

# Mode debug
pnpm exec playwright test --debug

# Générer rapport
pnpm exec playwright show-report

# Tests en mode headed (voir le navigateur)
pnpm exec playwright test --headed
```

## 💡 Conseils pour les Tests E2E

1. **Isolation des Tests** : Chaque test doit créer ses propres données
2. **Cleanup** : Nettoyer les données après chaque test
3. **Attentes Explicites** : Utiliser `waitFor` et `expect` appropriés
4. **Données de Test** : Utiliser des données prévisibles et uniques
5. **Parallélisation** : Attention aux conflits entre tests parallèles

## 🎯 Prochaines Étapes

1. **Phase 1** : Configurer Playwright avec authentification
2. **Phase 2** : Implémenter les tests d'invitation de base
3. **Phase 3** : Ajouter les tests de permissions
4. **Phase 4** : Tests de performance et stress
5. **Phase 5** : Intégration CI/CD
