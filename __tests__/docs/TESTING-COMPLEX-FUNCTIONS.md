# Guide pour tester les fonctions complexes

## Types de tests pour fonctions complexes

### 1. Tests unitaires pour fonctions pures

```tsx
// Fonction pure - facile à tester
function calculateBoardStats(board: Board) {
  return {
    totalTasks: board.columns.reduce((acc, col) => acc + col.tasks.length, 0),
    totalColumns: board.columns.length,
  };
}

// Test
it("should calculate board stats correctly", () => {
  const result = calculateBoardStats(mockBoard);
  expect(result.totalTasks).toBe(5);
  expect(result.totalColumns).toBe(3);
});
```

### 2. Tests pour hooks personnalisés

```tsx
import { renderHook, act } from "@testing-library/react";

// Test d'un hook
it("should manage board state", () => {
  const { result } = renderHook(() => useBoardStore("board-1", mockBoard));

  expect(result.current.board).toEqual(mockBoard);

  act(() => {
    result.current.addColumn("Nouvelle colonne");
  });

  // Vérifier le changement d'état
});
```

### 3. Tests d'intégration pour opérations complexes

```tsx
// Test de plusieurs opérations ensemble
it("should handle complex board operations", async () => {
  render(<BoardComponent board={mockBoard} />);

  // Séquence d'actions
  await user.click(screen.getByText("Ajouter colonne"));
  await user.drag(screen.getByTestId("task-1"), screen.getByTestId("column-2"));

  // Vérifier le résultat final
  expect(screen.getByText("Nouvelle colonne")).toBeInTheDocument();
});
```

## Stratégies de test par type de fonction

### ✅ Fonctions de calcul/transformation

- **Quoi tester** : Entrées → Sorties
- **Comment** : Tests unitaires simples
- **Exemple** : `calculateStats()`, `reorderItems()`, `validateData()`

```tsx
describe("Data transformations", () => {
  it("should transform data correctly", () => {
    const input = {
      /* données d'entrée */
    };
    const expected = {
      /* résultat attendu */
    };

    expect(transformData(input)).toEqual(expected);
  });
});
```

### ✅ Fonctions avec effets de bord

- **Quoi tester** : Interactions avec APIs, localStorage, etc.
- **Comment** : Mocks et spies
- **Exemple** : `saveBoard()`, `fetchTasks()`, `updateUser()`

```tsx
describe("API interactions", () => {
  it("should save board to API", async () => {
    const mockSave = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(api.saveBoard).mockImplementation(mockSave);

    await saveBoard(mockBoard);

    expect(mockSave).toHaveBeenCalledWith(mockBoard);
  });
});
```

### ✅ Fonctions asynchrones complexes

- **Quoi tester** : États de chargement, erreurs, succès
- **Comment** : `waitFor`, `act`, mocks

```tsx
describe("Async operations", () => {
  it("should handle loading states", async () => {
    const { result } = renderHook(() => useAsyncOperation());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

## Patterns de test pour vos composants Board/Task

### 1. Test du BoardView

```tsx
describe("BoardView Complex Operations", () => {
  it("should handle drag and drop", async () => {
    const mockOnMove = vi.fn();
    render(<BoardView board={mockBoard} onTaskMove={mockOnMove} />);

    // Simuler drag & drop
    const task = screen.getByTestId("task-1");
    const targetColumn = screen.getByTestId("column-2");

    await user.drag(task, targetColumn);

    expect(mockOnMove).toHaveBeenCalledWith("task-1", "column-2");
  });
});
```

### 2. Test des hooks de board

```tsx
describe("useBoardStore", () => {
  it("should manage complex state updates", () => {
    const { result } = renderHook(() => useBoardStore(mockBoard));

    // Test des opérations multiples
    act(() => {
      result.current.addColumn("Col 1");
      result.current.addTask("Task 1", "col-1");
      result.current.moveTask("task-1", "col-1", "col-2");
    });

    // Vérifier l'état final
    expect(result.current.board.columns).toHaveLength(3);
  });
});
```

### 3. Test des services/actions

```tsx
describe("Board Services", () => {
  it("should handle complex board operations", async () => {
    const boardService = new BoardService();

    // Test d'une séquence d'opérations
    await boardService.createBoard("New Board");
    await boardService.addColumn("board-1", "To Do");
    await boardService.addTask("board-1", "col-1", "New Task");

    const board = await boardService.getBoard("board-1");

    expect(board.columns).toHaveLength(1);
    expect(board.columns[0].tasks).toHaveLength(1);
  });
});
```

## Mocking des dépendances complexes

### 1. Mock des APIs

```tsx
// Mock global
vi.mock("@/lib/api", () => ({
  boardApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock spécifique par test
it("should handle API errors", async () => {
  vi.mocked(boardApi.create).mockRejectedValue(new Error("API Error"));

  await expect(createBoard(mockData)).rejects.toThrow("API Error");
});
```

### 2. Mock des hooks React Query

```tsx
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: mockBoard,
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));
```

### 3. Mock des contextes

```tsx
const mockBoardContext = {
  board: mockBoard,
  updateBoard: vi.fn(),
  addColumn: vi.fn(),
};

vi.mock("@/contexts/BoardContext", () => ({
  useBoardContext: () => mockBoardContext,
}));
```

## Conseils pour tester vos fonctions complexes

### ✅ À faire

1. **Isoler la logique** : Extraire la logique métier dans des fonctions pures
2. **Tester les cas limites** : Données vides, erreurs, états invalides
3. **Utiliser des données réalistes** : Créer des mocks qui ressemblent aux vraies données
4. **Tester les interactions** : Comment les fonctions travaillent ensemble

### ❌ À éviter

1. **Tests trop complexes** : Un test = un comportement
2. **Tester l'implémentation** : Tester le "quoi", pas le "comment"
3. **Mocks trop spécifiques** : Rendre les tests fragiles
4. **Oublier les cas d'erreur** : Tester aussi les échecs

## Exemples spécifiques pour votre app

### Test de déplacement de tâche

```tsx
it("should move task between columns with position recalculation", () => {
  const result = moveTaskBetweenColumns(
    mockBoard,
    "task-1",
    "col-1", // source
    "col-2", // destination
    2 // position
  );

  // Vérifier que la tâche a changé de colonne
  const movedTask = findTaskInBoard(result, "task-1");
  expect(movedTask.columnId).toBe("col-2");
  expect(movedTask.position).toBe(2);

  // Vérifier que les positions ont été recalculées
  const sourceColumn = result.columns.find((c) => c.id === "col-1");
  expect(sourceColumn.tasks.map((t) => t.position)).toEqual([1, 2, 3]);
});
```

Vos fonctions complexes sont maintenant testables ! 🚀
