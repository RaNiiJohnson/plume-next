# Guide pratique pour tester vos composants

## Configuration terminée ✅

Votre environnement de test est maintenant configuré avec :

- **Vitest** comme framework de test
- **React Testing Library** pour tester les composants
- **jsdom** pour simuler le DOM
- **@testing-library/jest-dom** pour les matchers personnalisés

## Comment créer un test

### 1. Structure de base

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MonComposant } from "@/components/MonComposant";

describe("MonComposant", () => {
  it("should render correctly", () => {
    render(<MonComposant />);

    // Vos assertions ici
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### 2. Tester les interactions

```tsx
import userEvent from "@testing-library/user-event";

it("should handle click events", async () => {
  const user = userEvent.setup();
  const mockFn = vi.fn();

  render(<Button onClick={mockFn}>Click me</Button>);

  await user.click(screen.getByRole("button"));
  expect(mockFn).toHaveBeenCalledOnce();
});
```

### 3. Tester les formulaires

```tsx
it("should submit form with correct data", async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  render(<MyForm onSubmit={mockSubmit} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(mockSubmit).toHaveBeenCalledWith({ email: "test@example.com" });
});
```

## Commandes utiles

```bash
# Lancer tous les tests
pnpm test

# Lancer en mode watch (recommandé pendant le développement)
pnpm test:watch

# Lancer un test spécifique
pnpm test MonComposant.test.tsx

# Lancer avec l'interface graphique
pnpm test:ui
```

## Bonnes pratiques

### ✅ À faire

- Utiliser `screen.getByRole()` quand possible (plus accessible)
- Tester le comportement, pas l'implémentation
- Utiliser des noms de tests descriptifs
- Nettoyer les mocks avec `beforeEach` ou `afterEach`

### ❌ À éviter

- Tester les détails d'implémentation (classes CSS spécifiques)
- Tests trop complexes (diviser en plusieurs tests)
- Oublier de mocker les dépendances externes

## Exemples pour vos composants

### Tester un bouton simple

```tsx
describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Tester un composant avec état

```tsx
describe("Counter", () => {
  it("increments count when button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const button = screen.getByRole("button", { name: "Increment" });
    const count = screen.getByText("0");

    await user.click(button);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

### Tester avec des props

```tsx
describe("UserCard", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  it("displays user information", () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});
```

## Mocks disponibles

- `__tests__/mocks/next-navigation.ts` - Pour Next.js navigation
- Vous pouvez créer d'autres mocks selon vos besoins

## Prochaines étapes

1. Choisissez un composant simple à tester
2. Créez un fichier `__tests__/components/[nom-composant].test.tsx`
3. Commencez par tester le rendu de base
4. Ajoutez des tests pour les interactions
5. Lancez `pnpm test:watch` pour voir les résultats en temps réel

Votre configuration est prête ! Vous pouvez maintenant tester vos composants efficacement. 🚀
