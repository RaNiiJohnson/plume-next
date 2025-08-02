export type IdCallback = (id: string) => void;
export type AsyncIdCallback = (id: string) => Promise<void>;

export type TaskUpdateFn = (taskId: string, newContent: string) => void;

export type MoveTaskFn = (
  taskId: string,
  currentColumnId: string,
  targetColumnId: string
) => Promise<void>;
