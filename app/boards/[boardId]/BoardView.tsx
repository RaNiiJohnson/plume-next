// components/BoardView.tsx
"use client";

import { SecondPageLayout } from "@/components/layout";
import { useMemo, useState } from "react";
import { AddColumnButton } from "./(column)/addColumnButton";
import { AddTask } from "./(task)/AddTask";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";

import { arrayMove, useSortable } from "@dnd-kit/sortable";
import {
  addTaskSafeAction,
  reorderTasksAndColumnsSafeAction,
} from "../board.action";

// --- Interfaces de données ---
// Garde ces interfaces si tu n'as pas de fichier de types centralisé,
// mais il est fortement recommandé d'en créer un (ex: src/types/board-data.ts)
interface Task {
  id: string;
  content: string;
  position: number;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  position: number;
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

// --- Importations des composants Dnd Kit et autres utilitaires ---
import TaskItem from "./(task)/TaskItem";
import SortableTask from "./(task)/SortableTask";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAction } from "next-safe-action/hooks";
import TaskOverlay from "./(task)/TaskOverlay";

// --- ColumnView : Le composant d'une colonne, maintenant sortable et droppable ---
interface ColumnViewProps {
  column: Column;
  openFormColId: string | null;
  setOpenFormColId: (id: string | null) => void;
  onAddTask: (
    content: string,
    columnId: string,
    boardId: string
  ) => Promise<void>;
  boardId: string;
}

function ColumnView({
  column,
  openFormColId,
  setOpenFormColId,
  onAddTask,
  boardId,
}: ColumnViewProps) {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
  });

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
      column,
    },
  });

  const mergedRef = (node: HTMLElement | null) => {
    setDroppableNodeRef(node);
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // L'opacité à 0 rend l'original invisible, le DragOverlay le remplace
    opacity: isDragging ? 0 : 1,
    // IMPORTANT : maintient l'élément dans le flux pour que les calculs de Dnd Kit soient corrects
    // Si tu as des soucis, tu peux essayer `display: isDragging ? 'none' : 'block'`, mais l'opacité est préférée.
  };

  return (
    <div
      suppressHydrationWarning={true}
      ref={mergedRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-card border border-muted rounded-xl min-w-[260px] flex-shrink-0 shadow-md p-4 h-fit transition hover:shadow-lg"
    >
      <h3 className="font-semibold mb-4 text-lg text-card-foreground">
        {column.title}
      </h3>
      <SortableContext
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
        id={column.id}
      >
        <div className="flex flex-col gap-3">
          {column.tasks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              <SortableTask key={task.id} task={task} />
            ))}
        </div>
      </SortableContext>
      <AddTask
        columnId={column.id}
        boardId={boardId}
        showForm={openFormColId === column.id}
        onOpen={() => setOpenFormColId(column.id)}
        onClose={() => setOpenFormColId(null)}
        onAdd={(content, colId, bId) => onAddTask(content, colId, bId)}
      />
    </div>
  );
}

// --- Composant principal BoardView ---
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

  const sensors = useSensors(useSensor(PointerSensor));
  const { executeAsync: executeReorder } = useAction(
    reorderTasksAndColumnsSafeAction
  );

  const findColumn = (id: string | null): Column | undefined => {
    if (!id) return undefined;
    return board.columns.find((col) => col.id === id);
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
      const sourceColumn = board.columns.find((c) => c.id === sourceColumnId);
      if (sourceColumn) {
        const task = sourceColumn.tasks.find((t) => t.id === active.id);
        if (task) {
          setActiveItem(task);
        }
      }
    } else if (type === "column") {
      const column = board.columns.find((c) => c.id === active.id);
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

    const activeId = String(active.id);
    const overId = String(over.id);
    const draggedItemType = active.data.current?.type;

    console.log("🎯 Drag End Debug:", {
      activeId,
      overId,
      draggedItemType,
      activeData: active.data.current,
      overData: over.data.current,
    });

    // --- DÉPLACEMENT DE COLONNES ---
    if (draggedItemType === "column") {
      const oldIndex = board.columns.findIndex((col) => col.id === activeId);
      const newIndex = board.columns.findIndex((col) => col.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        console.log("Column drag ended without effective change.");
        return;
      }

      const newOrderedColumns = arrayMove(board.columns, oldIndex, newIndex);
      const updatedColumnsWithPositions = newOrderedColumns.map(
        (col, index) => ({
          ...col,
          position: index + 1,
        })
      );

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
          console.error(
            "Failed to reorder columns:",
            reorderResult.data?.error
          );
          alert("Erreur lors de la réorganisation des colonnes.");
        }
      } catch (error) {
        console.error("Unexpected error during column reorder:", error);
        alert("Une erreur inattendue est survenue.");
      }
      return;
    }

    // --- DÉPLACEMENT DE TÂCHES ---
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

    // Dnd-kit fournit souvent `over.data.current?.sortable?.containerId` pour les tâches
    // et `over.id` pour les droppables (colonnes ou tâches)
    if (over.data.current?.type === "task") {
      // Déposé sur une tâche existante
      destinationColumnId = String(over.data.current.sortable.containerId);
      droppedOnTask = true;
      console.log(
        "📍 Dropped on an existing task. Destination column:",
        destinationColumnId
      );
    } else if (over.data.current?.type === "column") {
      // Déposé directement sur une colonne (y compris une colonne vide)
      destinationColumnId = String(over.id);
      console.log(
        "📍 Dropped directly on a column. Destination column:",
        destinationColumnId
      );
    } else {
      // Cas où 'over' n'est ni une tâche ni une colonne reconnaissable.
      // Cela peut arriver si l'utilisateur lâche le drag en dehors des zones droppable.
      console.error(
        "Invalid drop target: could not determine destination type.",
        { over }
      );
      return; // Retourne, ne rien faire
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

    // --- MÊME COLONNE ---
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
    }
    // --- ENTRE COLONNES ---
    else {
      console.log("🔀 Between columns move");
      const [movedTask] = sourceColumn.tasks.filter((t) => t.id === activeId);
      if (!movedTask) return;

      // Tâches restantes dans la colonne source (sans la tâche déplacée)
      const sourceTasks = sourceColumn.tasks
        .filter((t) => t.id !== activeId)
        .map((t, i) => ({ ...t, position: i + 1 }));

      // Logique pour insérer dans la colonne de destination
      const destTasks = [...destinationColumn.tasks];

      let insertIndex = destTasks.length; // Par défaut, insérer à la fin si on ne trouve pas de tâche "survolée"

      // Si on a déposé sur une tâche, trouver son index pour insérer avant
      if (droppedOnTask) {
        // Utilise le flag que tu as ajouté
        const overTaskIndex = destTasks.findIndex((t) => t.id === overId);
        if (overTaskIndex !== -1) {
          insertIndex = overTaskIndex;
        }
      }

      // Créer la tâche avec le bon columnId
      const taskToInsert = {
        ...movedTask,
        columnId: destinationColumn.id,
      };

      // Insérer la tâche
      destTasks.splice(insertIndex, 0, taskToInsert);

      // Recalculer toutes les positions dans la colonne de destination
      const updatedDestinationTasks = destTasks.map((t, i) => ({
        ...t,
        position: i + 1,
      }));

      // Mettre à jour l'état local
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === sourceColumn.id) return { ...col, tasks: sourceTasks };
          if (col.id === destinationColumn.id)
            return { ...col, tasks: updatedDestinationTasks };
          return col;
        }),
      }));

      // Sauvegarder en base de données
      try {
        console.log("Sending to database:", {
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
        // Optionnel : recharger la page en cas d'erreur
        window.location.reload();
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "task";
    const isOverTask = over.data.current?.type === "task";
    const isOverColumn = over.data.current?.type === "column";

    console.log("🔄 DragOver:", {
      activeId,
      overId,
      isActiveTask,
      isOverTask,
      isOverColumn,
      activeContainer: active.data.current?.sortable?.containerId,
      overContainer: over.data.current?.sortable?.containerId,
    });

    // On ne gère que le drag de tâches
    if (!isActiveTask) return;

    // --- Cas 1 : Déposer une tâche sur une autre tâche ---
    // if (isActiveTask && isOverTask) {
    //   const sourceColumnId = active.data.current?.sortable
    //     ?.containerId as string;
    //   const destinationColumnId = over.data.current?.sortable
    //     ?.containerId as string;

    //   console.log("📋 Task over task:", {
    //     sourceColumnId,
    //     destinationColumnId,
    //   });

    //   // Si on change de colonne
    //   if (sourceColumnId !== destinationColumnId) {
    //     console.log("🔀 Changing columns during drag over");

    //     setBoard((prev) => {
    //       const sourceColumn = prev.columns.find(
    //         (col) => col.id === sourceColumnId
    //       );
    //       const destColumn = prev.columns.find(
    //         (col) => col.id === destinationColumnId
    //       );
    //       if (!sourceColumn || !destColumn) return prev;

    //       const task = sourceColumn.tasks.find((t) => t.id === activeId);
    //       if (!task) return prev;

    //       const newSourceTasks = sourceColumn.tasks.filter(
    //         (t) => t.id !== activeId
    //       );
    //       const destTasks = [...destColumn.tasks];
    //       const insertIndex = destTasks.findIndex((t) => t.id === overId);
    //       destTasks.splice(
    //         insertIndex === -1 ? destTasks.length : insertIndex,
    //         0,
    //         {
    //           ...task,
    //           columnId: destinationColumnId,
    //         }
    //       );

    //       return {
    //         ...prev,
    //         columns: prev.columns.map((col) => {
    //           if (col.id === sourceColumnId)
    //             return { ...col, tasks: newSourceTasks };
    //           if (col.id === destinationColumnId)
    //             return { ...col, tasks: destTasks };
    //           return col;
    //         }),
    //       };
    //     });
    //   }
    // }

    // --- Cas 2 : Déposer une tâche sur une colonne (vide ou non) ---
    // if (isActiveTask && isOverColumn) {
    //   setBoard((prev) => {
    //     const sourceColumnId = active.data.current?.sortable
    //       ?.containerId as string;
    //     const destColumnId = over.id as string;

    //     console.log("📋 Task over column:", { sourceColumnId, destColumnId });

    //     if (sourceColumnId === destColumnId) return prev;

    //     console.log("🔀 Moving to different column during drag over");

    //     const sourceColumn = prev.columns.find(
    //       (col) => col.id === sourceColumnId
    //     );
    //     const destColumn = prev.columns.find((col) => col.id === destColumnId);
    //     if (!sourceColumn || !destColumn) return prev;

    //     const task = sourceColumn.tasks.find((t) => t.id === activeId);
    //     if (!task) return prev;

    //     const newSourceTasks = sourceColumn.tasks.filter(
    //       (t) => t.id !== activeId
    //     );
    //     const newDestTasks = [
    //       ...destColumn.tasks,
    //       { ...task, columnId: destColumnId },
    //     ];

    //     return {
    //       ...prev,
    //       columns: prev.columns.map((col) => {
    //         if (col.id === sourceColumnId)
    //           return { ...col, tasks: newSourceTasks };
    //         if (col.id === destColumnId) return { ...col, tasks: newDestTasks };
    //         return col;
    //       }),
    //     };
    //   });
    // }
  }

  const columnsId = useMemo(
    () => board.columns.map((col) => col.id),
    [board.columns]
  );

  return (
    <SecondPageLayout>
      <div className="text-3xl font-bold text-primary tracking-tight mb-6 border-b border-muted pb-2">
        {board.title}
      </div>
      <div className="flex-1 flex overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 items-start h-full">
            <SortableContext
              items={columnsId}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => (
                <ColumnView
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
                />
              ))}
            </SortableContext>
            <AddColumnButton boardId={board.id} />
          </div>

          <DragOverlay>
            {activeItem ? (
              <div
                style={{
                  width: draggedItemWidth || undefined,
                  opacity: 0.9,
                  zIndex: 9999,
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  boxSizing: "border-box",
                }}
                className="rotate-2" // Optionnel : rotation subtile via CSS
              >
                {"content" in activeItem ? (
                  <TaskOverlay task={activeItem as Task} />
                ) : (
                  <div className="bg-card border border-muted rounded-xl p-4 shadow-lg">
                    <h3 className="font-semibold mb-4 text-lg text-card-foreground">
                      {(activeItem as Column).title}
                    </h3>
                    <div className="text-muted-foreground italic text-sm text-center py-4">
                      {(activeItem as Column).tasks.length > 0
                        ? `(${(activeItem as Column).tasks.length} tâches)`
                        : "Pas de tâches"}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </SecondPageLayout>
  );
}
