import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBoardStore } from "@app/board/[boardId]/_hooks/useBoardStore";
import { Board, Column, Task } from "@/lib/types/type";

// Mock des queries
vi.mock("@app/board/[boardId]/_hooks/useBoardQueries", () => ({
  boardKeys: {
    board: (id: string) => ["board", id],
  },
  useBoardQuery: vi.fn(() => ({ data: mockBoard })),
  useAddColumnMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteColumnMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useAddTaskMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateTaskMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteTaskMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useReorderMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// Mock data
const mockTasks: Task[] = [
  { id: "task-1", content: "Tâche 1", position: 1, columnId: "col-1" },
  { id: "task-2", content: "Tâche 2", position: 2, columnId: "col-1" },
];

const mockColumns: Column[] = [
  {
    id: "col-1",
    title: "À faire",
    position: 1,
    tasks: mockTasks,
    boardId: "board-1",
  },
  {
    id: "col-2",
    title: "En cours",
    position: 2,
    tasks: [],
    boardId: "board-1",
  },
];

const mockBoard: Board = {
  id: "board-1",
  title: "Mon Board",
  columns: mockColumns,
  userId: "user-1",
  description: null,
  isPublic: false,
  createdAt: new Date(),
  organizationId: null,
  organization: null,
};

// Wrapper pour React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useBoardStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return board data", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    expect(result.current.board).toEqual(mockBoard);
  });

  it("should find column by id", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    const column = result.current.findColumn("col-1");
    expect(column).toEqual(mockColumns[0]);
  });

  it("should return undefined for non-existent column", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    const column = result.current.findColumn("non-existent");
    expect(column).toBeUndefined();
  });

  it("should find task by id", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    const taskResult = result.current.findTask("task-1");
    expect(taskResult).toEqual({
      task: mockTasks[0],
      column: mockColumns[0],
    });
  });

  it("should return null for non-existent task", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    const taskResult = result.current.findTask("non-existent");
    expect(taskResult).toBeNull();
  });

  it("should provide loading states", () => {
    const { result } = renderHook(() => useBoardStore("board-1", mockBoard), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAddingColumn).toBe(false);
    expect(result.current.isAddingTask).toBe(false);
    expect(result.current.isUpdatingTask).toBe(false);
    expect(result.current.isDeletingTask).toBe(false);
    expect(result.current.isReordering).toBe(false);
  });
});
