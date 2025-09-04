"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { AddColumnButton } from "./(column)/addColumnButton";

import { arrayMove } from "@dnd-kit/sortable";
import {
  deleteTaskSafeAction,
  reorderTasksAndColumnsSafeAction,
} from "./(task)/task.action";

import { Board, Column, Task } from "@/lib/types/type";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Kanban } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import {
  addColumnSafeAction,
  deleteColumnSafeAction,
} from "./(column)/column.action";
import ColumnView from "./(column)/ColumnView";
import { addTaskSafeAction } from "./(task)/task.action";
import TaskOverlay from "./(task)/TaskOverlay";

export default function BoardView({ board: initialBoard }: { board: Board }) {
  const [board, setBoard] = useState<Board>(() => ({
    ...initialBoard,
    columns: initialBoard.columns
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((col) => ({
        ...col,
        tasks: col.tasks.slice().sort((a, b) => a.position - b.position),
      })),
  }));

  const [openFormColId, setOpenFormColId] = useState<string | null>(null);

  // activeItem peut être Task ou Column pour le DragOverlay
  const [activeItem, setActiveItem] = useState<Task | Column | null>(null);
  const [draggedItemWidth, setDraggedItemWidth] = useState<number | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleTaskEditStart = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleTaskEditEnd = () => {
    setEditingTaskId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );
  const { executeAsync: executeReorder } = useAction(
    reorderTasksAndColumnsSafeAction
  );

  const findColumn = useCallback(
    (id: string | null): Column | undefined => {
      if (!id) return undefined;
      return board.columns.find((col) => col.id === id);
    },
    [board]
  );

  const handleAddColumnOptimistic = async (title: string) => {
    const tempColumnId = `temp-${Date.now()}`;
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: [
        ...prevBoard.columns,
        {
          id: tempColumnId,
          title,
          position: prevBoard.columns.length + 1,
          tasks: [],
          boardId: prevBoard.id,
        },
      ],
    }));
    try {
      const response = await addColumnSafeAction({
        title,
        boardId: board.id,
      });
      const resultData = response.data;
      if (resultData?.success && resultData?.column) {
        console.log(
          "Column added to DB successfully with ID:",
          resultData.column.id
        );

        setBoard((prevBoard) => ({
          ...prevBoard,
          columns: prevBoard.columns.map((col) =>
            col.id === tempColumnId
              ? {
                  ...resultData.column!,
                  tasks: resultData.column!.tasks ?? [],
                }
              : col
          ),
        }));
      } else {
        console.error("Failed to add column to DB:");
        alert("Erreur lors de l'ajout de la colonne : ");
        setBoard((prevBoard) => ({
          ...prevBoard,
          columns: prevBoard.columns.filter((col) => col.id !== tempColumnId),
        }));
      }
    } catch (error) {
      console.error("Error calling addColumnSafeAction:", error);
      alert(
        "Une erreur inattendue est survenue lors de l'ajout de la colonne."
      );
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.filter((col) => col.id !== tempColumnId),
      }));
    }
  };

  const handleAddTaskOptimistic = async (
    columnId: string,
    content: string,
    boardId: string
  ) => {
    const tempTaskId = `temp-${Date.now()}`;
    let newPosition = 1;

    setBoard((prevBoard) => {
      const updatedColumns = prevBoard.columns.map((col) => {
        if (col.id === columnId) {
          newPosition =
            col.tasks.length > 0
              ? Math.max(...col.tasks.map((t) => t.position)) + 1
              : 1;
          const newTask: Task = {
            id: tempTaskId,
            content,
            position: newPosition,
            columnId: columnId,
          };
          return { ...col, tasks: [...col.tasks, newTask] };
        }
        return col;
      });
      return { ...prevBoard, columns: updatedColumns };
    });
    setOpenFormColId(null);
    try {
      const response = await addTaskSafeAction({
        boardId: boardId,
        columnId: columnId,
        content: content,
        position: newPosition,
      });
      const resultData = response.data;
      if (resultData?.success && resultData?.task) {
        console.log(
          "Task added to DB successfully with ID:",
          resultData.task.id
        );
        setBoard((prevBoard) => ({
          ...prevBoard,
          columns: prevBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) =>
              task.id === tempTaskId ? resultData.task! : task
            ),
          })),
        }));
      } else {
        console.error("Failed to add task to DB:");
        alert("Erreur lors de l'ajout de la tâche : ");
        setBoard((prevBoard) => ({
          ...prevBoard,
          columns: prevBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((task) => task.id !== tempTaskId),
          })),
        }));
      }
    } catch (error) {
      console.error("Error calling addTaskSafeAction:", error);
      alert("Une erreur inattendue est survenue lors de l'ajout.");
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== tempTaskId),
        })),
      }));
    }
  };

  // handleDragStart : détermine le type d'élément glissé (tâche ou colonne)
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const type = active.data.current?.type;
    console.log(active);

    // Capture la largeur de l'élément que tu commences à glisser
    // Utilise active.rect.current.initial?.width pour la largeur initiale
    // ou active.rect.current.measured.width si tu préfères la largeur mesurée après le drag
    setDraggedItemWidth(active.rect.current.initial?.width || null);

    if (type === "task") {
      const sourceColumnId = active.data.current?.sortable
        ?.containerId as string;
      const sourceColumn = findColumn(sourceColumnId);
      if (sourceColumn) {
        const task = sourceColumn.tasks.find((t) => t.id === active.id);
        if (task) {
          setActiveItem(task);
        }
      }
    } else if (type === "column") {
      const column = findColumn(String(active.id));
      if (column) {
        setActiveItem(column);
      }
    }
    // console.log("Drag Started:", { active, activeItem, draggedItemWidth }); // Pour le débogage
  }

  // handleDragCancel : réinitialise l'état du drag
  function handleDragCancel() {
    setActiveItem(null);
    setDraggedItemWidth(null);
  }

  // Fonction pour gérer le drag-and-drop des colonnes
  const handleColumnDragEnd = async (activeId: string, overId: string) => {
    const oldIndex = board.columns.findIndex((col) => col.id === activeId);
    const newIndex = board.columns.findIndex((col) => col.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      console.log("Column drag ended without effective change.");
      return;
    }

    const newOrderedColumns = arrayMove(board.columns, oldIndex, newIndex);
    const updatedColumnsWithPositions = newOrderedColumns.map((col, index) => ({
      ...col,
      position: index + 1,
    }));

    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: updatedColumnsWithPositions,
    }));

    try {
      const reorderResult = await executeReorder({
        type: "reorderColumns",
        boardId: board.id,
        columns: updatedColumnsWithPositions.map((c) => ({
          id: c.id,
          position: c.position,
        })),
      });

      if (reorderResult.data?.success) {
        console.log("Columns reordered successfully!");
      } else {
        console.error("Failed to reorder columns:", reorderResult.data?.error);
        alert("Erreur lors de la réorganisation des colonnes.");
      }
    } catch (error) {
      console.error("Unexpected error during column reorder:", error);
      // Rollback vers l'état précédent
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: board.columns,
      }));
      alert("Une erreur inattendue est survenue.");
    }
  };

  // Fonction pour gérer le drag-and-drop des tâches
  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      console.log("No valid droppable target for task.");
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumnId = active.data.current?.sortable?.containerId;

    console.log("🔍 Source Column ID:", sourceColumnId);

    const sourceColumn = findColumn(
      sourceColumnId ? String(sourceColumnId) : null
    );

    if (!sourceColumn) {
      console.error("Source column not found.");
      return;
    }

    const activeTask = sourceColumn.tasks.find((task) => task.id === activeId);
    if (!activeTask) {
      console.error("Active task not found in source column.");
      return;
    }

    let destinationColumnId: string | null = null;
    let droppedOnTask: boolean = false; // Pour savoir si on a déposé sur une tâche

    if (over.data.current?.type === "task") {
      destinationColumnId = String(over.data.current.sortable.containerId);
      droppedOnTask = true;
      console.log(
        "📍 Dropped on an existing task. Destination column:",
        destinationColumnId
      );
    } else if (over.data.current?.type === "column") {
      destinationColumnId = String(over.id);
      console.log(
        "📍 Dropped directly on a column. Destination column:",
        destinationColumnId
      );
    } else {
      console.error(
        "Invalid drop target: could not determine destination type.",
        { over }
      );
      return;
    }

    const destinationColumn = findColumn(destinationColumnId);
    if (!destinationColumn) {
      console.error(
        "Destination column not found after ID resolution (via findColumn).",
        { destinationColumnId }
      );
      return;
    }

    console.log("🎯 Final determination:", {
      sourceColumnId: sourceColumn.id,
      destinationColumnId: destinationColumn.id,
      isSameColumn: sourceColumn.id === destinationColumn.id,
    });

    if (sourceColumn.id === destinationColumn.id) {
      console.log("🔄 Same column reorder");
      const oldIndex = sourceColumn.tasks.findIndex((t) => t.id === activeId);
      const newIndex = sourceColumn.tasks.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const updatedTasks = arrayMove(
        sourceColumn.tasks,
        oldIndex,
        newIndex
      ).map((task, index) => ({
        ...task,
        position: index + 1,
      }));

      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === sourceColumn.id ? { ...col, tasks: updatedTasks } : col
        ),
      }));

      try {
        const result = await executeReorder({
          type: "reorderSameColumn",
          boardId: board.id,
          columnId: sourceColumn.id,
          tasks: updatedTasks.map((t) => ({ id: t.id, position: t.position })),
        });
        if (!result.data?.success) throw new Error(result.data?.error);
      } catch (error) {
        console.error("Reorder same column failed:", error);
        alert("Erreur lors du réordonnancement.");
      }
    } else {
      console.log("🔀 Between columns move");
      const [movedTask] = sourceColumn.tasks.filter((t) => t.id === activeId);
      if (!movedTask) return;

      const sourceTasks = sourceColumn.tasks
        .filter((t) => t.id !== activeId)
        .map((t, i) => ({ ...t, position: i + 1 }));

      const destTasks = [...destinationColumn.tasks];

      let insertIndex = destTasks.length;

      if (droppedOnTask) {
        const overTaskIndex = destTasks.findIndex((t) => t.id === overId);
        if (overTaskIndex !== -1) {
          insertIndex = overTaskIndex;
        }
      }

      const taskToInsert = {
        ...movedTask,
        columnId: destinationColumn.id,
      };

      destTasks.splice(insertIndex, 0, taskToInsert);

      const updatedDestinationTasks = destTasks.map((t, i) => ({
        ...t,
        position: i + 1,
      }));

      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === sourceColumn.id) return { ...col, tasks: sourceTasks };
          if (col.id === destinationColumn.id)
            return { ...col, tasks: updatedDestinationTasks };
          return col;
        }),
      }));

      try {
        const result = await executeReorder({
          type: "moveBetweenColumns",
          boardId: board.id,
          taskId: movedTask.id,
          newColumnId: destinationColumn.id,
          sourceColumnTasks: sourceTasks.map((t) => ({
            id: t.id,
            position: t.position,
          })),
          destinationColumnTasks: updatedDestinationTasks.map((t) => ({
            id: t.id,
            position: t.position,
          })),
        });

        if (!result.data?.success) {
          console.error("Database update failed:", result.data?.error);
          throw new Error(result.data?.error || "Move failed");
        } else {
          console.log("✅ Successfully saved to database!");
        }
      } catch (error) {
        console.error("❌ Move between columns failed:", error);
        alert("Erreur lors du déplacement. La page va être rechargée.");
        window.location.reload();
      }
    }
  };

  // handleDragEnd : gère le réordonnancement pour les tâches et les colonnes
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Nettoie l'état du drag
    setActiveItem(null);
    setDraggedItemWidth(null);

    if (!over) {
      console.log("No valid droppable target.");
      return;
    }

    const draggedItemType = active.data.current?.type;

    console.log("🎯 Drag End Debug:", {
      activeId: active.id,
      overId: over.id,
      draggedItemType,
    });

    if (draggedItemType === "column") {
      await handleColumnDragEnd(String(active.id), String(over.id));
    } else if (draggedItemType === "task") {
      await handleTaskDragEnd(event);
    }
  }

  // Fonction pour mettre à jour une tâche dans le board
  const handleTaskUpdate = (taskId: string, newContent: string) => {
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: prevBoard.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId ? { ...task, content: newContent } : task
        ),
      })),
    }));
  };

  const handleTaskDelete = async (taskId: string) => {
    // 1. Mise à jour optimiste (retirer immédiatement de l'état)
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: prevBoard.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    }));

    // 2. Supprimer de la base de données
    try {
      const result = await deleteTaskSafeAction({
        taskId: taskId,
        boardId: board.id,
      });

      if (!result.data?.success) {
        throw new Error("Delete failed");
      }

      console.log("✅ Task deleted successfully");
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("Erreur lors de la suppression. La page va être rechargée.");
    }
  };

  const handleColumnDelete = async (columnId: string): Promise<void> => {
    // Vérifier si la colonne a des tâches
    const columnToDelete = board.columns.find((col) => col.id === columnId);
    if (!columnToDelete) return;

    // 1. Mise à jour optimiste
    setBoard((prevBoard) => ({
      ...prevBoard,
      columns: prevBoard.columns
        .filter((col) => col.id !== columnId)
        .map((col, index) => ({
          ...col,
          position: index + 1, // Réorganiser les positions
        })),
    }));

    // 2. Supprimer de la base de données
    try {
      const result = await deleteColumnSafeAction({
        columnId: columnId,
      });

      if (!result.data?.success) {
        throw new Error("Delete column failed");
      }

      console.log("✅ Column deleted successfully");
    } catch (error) {
      console.error("❌ Column delete failed:", error);
      alert("Erreur lors de la suppression de la colonne.");
      window.location.reload(); // Rollback
    }
  };

  // Fonction pour déplacer une tâche vers une autre colonne
  const handleMoveTaskToColumn = async (
    taskId: string,
    currentColumnId: string,
    targetColumnId: string
  ) => {
    // Trouver la tâche actuelle
    const currentColumn = findColumn(currentColumnId);
    const targetColumn = findColumn(targetColumnId);

    if (!currentColumn || !targetColumn) return;

    const taskToMove = currentColumn.tasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // Mise à jour optimiste (même logique que le drag & drop)
    const sourceTasks = currentColumn.tasks
      .filter((t) => t.id !== taskId)
      .map((t, i) => ({ ...t, position: i + 1 }));

    const targetTasks = [
      ...targetColumn.tasks,
      {
        ...taskToMove,
        columnId: targetColumnId,
      },
    ].map((t, i) => ({ ...t, position: i + 1 }));

    // Mettre à jour l'état local
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id === currentColumnId) return { ...col, tasks: sourceTasks };
        if (col.id === targetColumnId) return { ...col, tasks: targetTasks };
        return col;
      }),
    }));

    // Sauvegarder en base (réutiliser votre action existante)
    try {
      const result = await executeReorder({
        type: "moveBetweenColumns",
        boardId: board.id,
        taskId: taskId,
        newColumnId: targetColumnId,
        sourceColumnTasks: sourceTasks.map((t) => ({
          id: t.id,
          position: t.position,
        })),
        destinationColumnTasks: targetTasks.map((t) => ({
          id: t.id,
          position: t.position,
        })),
      });

      if (!result.data?.success) {
        throw new Error(result.data?.error);
      }
    } catch (error) {
      console.error("Move failed:", error);
    }
  };

  const columnsId = useMemo(
    () => board.columns.map((col) => col.id),
    [board.columns]
  );

  return (
    <div className="h-full w-full flex flex-col min-w-0">
      <div className="flex items-center gap-3 mb-8 flex-shrink-0">
        <div className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
          {board.title}
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary shadow w-9 h-9">
          <Kanban size={22} strokeWidth={2.2} />
        </span>
      </div>
      <div className="flex-1 min-h-0 min-w-0">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            className="flex gap-8 items-start overflow-x-auto custom-scrollbar h-full pb-4 min-w-0"
            style={{ width: "100%" }}
          >
            <SortableContext
              items={columnsId}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => (
                <ColumnView
                  handleTaskUpdate={handleTaskUpdate}
                  handleTaskDelete={handleTaskDelete}
                  key={column.id}
                  column={column}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  boardId={board.id}
                  onAddTask={(content, receivedColumnId, receivedBoardId) =>
                    handleAddTaskOptimistic(
                      receivedColumnId,
                      content,
                      receivedBoardId
                    )
                  }
                  onMoveTask={handleMoveTaskToColumn}
                  availableColumns={board.columns.filter(
                    (col) => col.id !== column.id
                  )}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                  onDeleteColumn={handleColumnDelete}
                />
              ))}
            </SortableContext>
            <AddColumnButton
              onAddColumn={(title) => handleAddColumnOptimistic(title)}
              boardId={board.id}
            />
          </div>

          <DragOverlay>
            {activeItem ? (
              "tasks" in activeItem ? (
                <ColumnView
                  handleTaskUpdate={handleTaskUpdate}
                  handleTaskDelete={handleTaskDelete}
                  key={activeItem.id}
                  column={activeItem}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  boardId={board.id}
                  onAddTask={(content, receivedColumnId, receivedBoardId) =>
                    handleAddTaskOptimistic(
                      receivedColumnId,
                      content,
                      receivedBoardId
                    )
                  }
                  onMoveTask={handleMoveTaskToColumn}
                  availableColumns={board.columns.filter(
                    (col) => col.id !== activeItem.id
                  )}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                  onDeleteColumn={handleColumnDelete}
                />
              ) : (
                <TaskOverlay
                  task={activeItem as Task}
                  width={draggedItemWidth || undefined}
                />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
