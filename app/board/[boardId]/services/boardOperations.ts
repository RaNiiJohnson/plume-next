import {
  addColumnSafeAction,
  deleteColumnSafeAction,
} from "../(column)/column.action";
import { addTaskSafeAction, deleteTaskSafeAction } from "../(task)/task.action";

export class BoardOperations {
  constructor(private executeReorder: any) {}

  async addColumn(title: string, boardId: string) {
    try {
      const response = await addColumnSafeAction({ title, boardId });
      const resultData = response.data;

      if (resultData?.success && resultData?.column) {
        return { success: true, column: resultData.column };
      } else {
        return { success: false, error: "Failed to add column to DB" };
      }
    } catch (error) {
      console.error("Error calling addColumnSafeAction:", error);
      return {
        success: false,
        error: "Unexpected error during column addition",
      };
    }
  }

  async deleteColumn(columnId: string) {
    try {
      const result = await deleteColumnSafeAction({ columnId });

      if (result.data?.success) {
        return { success: true };
      } else {
        return { success: false, error: "Delete column failed" };
      }
    } catch (error) {
      console.error("Column delete failed:", error);
      return {
        success: false,
        error: "Unexpected error during column deletion",
      };
    }
  }

  async addTask(
    boardId: string,
    columnId: string,
    content: string,
    position: number
  ) {
    try {
      const response = await addTaskSafeAction({
        boardId,
        columnId,
        content,
        position,
      });
      const resultData = response.data;

      if (resultData?.success && resultData?.task) {
        return { success: true, task: resultData.task };
      } else {
        return { success: false, error: "Failed to add task to DB" };
      }
    } catch (error) {
      console.error("Error calling addTaskSafeAction:", error);
      return { success: false, error: "Unexpected error during task addition" };
    }
  }

  async deleteTask(taskId: string, boardId: string) {
    try {
      const result = await deleteTaskSafeAction({ taskId, boardId });

      if (result.data?.success) {
        return { success: true };
      } else {
        return { success: false, error: "Delete failed" };
      }
    } catch (error) {
      console.error("Delete failed:", error);
      return { success: false, error: "Unexpected error during task deletion" };
    }
  }

  async reorderColumns(
    boardId: string,
    columns: Array<{ id: string; position: number }>
  ) {
    try {
      const result = await this.executeReorder({
        type: "reorderColumns",
        boardId,
        columns,
      });

      if (result.data?.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.data?.error || "Reorder failed",
        };
      }
    } catch (error) {
      console.error("Unexpected error during column reorder:", error);
      return { success: false, error: "Unexpected error during reorder" };
    }
  }

  async reorderTasksInSameColumn(
    boardId: string,
    columnId: string,
    tasks: Array<{ id: string; position: number }>
  ) {
    try {
      const result = await this.executeReorder({
        type: "reorderSameColumn",
        boardId,
        columnId,
        tasks,
      });

      if (result.data?.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.data?.error || "Reorder failed",
        };
      }
    } catch (error) {
      console.error("Reorder same column failed:", error);
      return { success: false, error: "Unexpected error during reorder" };
    }
  }

  async moveTaskBetweenColumns(
    boardId: string,
    taskId: string,
    newColumnId: string,
    sourceColumnTasks: Array<{ id: string; position: number }>,
    destinationColumnTasks: Array<{ id: string; position: number }>
  ) {
    try {
      const result = await this.executeReorder({
        type: "moveBetweenColumns",
        boardId,
        taskId,
        newColumnId,
        sourceColumnTasks,
        destinationColumnTasks,
      });

      if (result.data?.success) {
        return { success: true };
      } else {
        return { success: false, error: result.data?.error || "Move failed" };
      }
    } catch (error) {
      console.error("Move between columns failed:", error);
      return { success: false, error: "Unexpected error during move" };
    }
  }
}
