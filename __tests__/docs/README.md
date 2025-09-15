# Tests

Ce dossier contient tous les tests pour l'application Plume Next.

## Configuration

- **Vitest** : Framework de test rapide
- **React Testing Library** : Pour tester les composants React
- **jsdom** : Environnement DOM simulé
- **@testing-library/jest-dom** : Matchers personnalisés pour les tests DOM

## Structure des tests

```
__tests__/
├── components/           # Tests des composants
│   ├── ui/              # Tests des composants UI
│   └── *.test.tsx       # Tests des composants spécifiques
├── utils/               # Utilitaires de test
├── mocks/               # Mocks pour les dépendances
└── setup.ts             # Configuration globale des tests
```

## Scripts disponibles

```bash
# Lancer tous les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch

# Lancer les tests avec l'interface utilisateur
pnpm test:ui

# Lancer les tests avec coverage
pnpm test:coverage

# Lancer un test spécifique
pnpm test path/to/test.tsx
```

## Exemples de tests

### Test d'un composant simple

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button text", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });
});
```

### Test avec interactions utilisateur

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

describe("Interactive Component", () => {
  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Test avec mocks

```tsx
import { vi } from "vitest";

// Mock d'un module
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));
```

## Bonnes pratiques

1. **Nommage** : Utilisez des noms descriptifs pour vos tests
2. **Isolation** : Chaque test doit être indépendant
3. **Arrange-Act-Assert** : Structurez vos tests clairement
4. **Mocks** : Moquez les dépendances externes
5. **Accessibilité** : Utilisez les queries par rôle quand possible

## Utilitaires personnalisés

Le fichier `utils/test-utils.tsx` contient des utilitaires pour :

- Wrapper avec les providers (Theme, Query, etc.)
- Fonctions de rendu personnalisées
- Mocks communs

## Mocks disponibles

- `mocks/next-navigation.ts` : Mock pour Next.js navigation
- Plus de mocks peuvent être ajoutés selon les besoins
