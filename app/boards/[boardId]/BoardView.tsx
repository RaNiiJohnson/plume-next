// components/BoardView.tsx
"use client";

import { SecondPageLayout } from "@/components/layout";
import { useState, useMemo } from "react"; // Importer useMemo
import { AddColumnButton } from "./(column)/addColumnButton";
import { AddTask } from "./(task)/AddTask";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  Active,
  Over,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import {
  addTaskSafeAction,
  reorderTasksAndColumnsSafeAction,
} from "../board.action"; // Le chemin est correct selon ton envoi

// Interfaces (comme tu les as fournies)
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

// *** NOUVEAU: Composant ColumnView pour gérer chaque colonne individuelle ***
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTask from "./(task)/SortableTask";
import { useAction } from "next-safe-action/hooks";

interface ColumnViewProps {
  column: Column;
  openFormColId: string | null;
  setOpenFormColId: (id: string | null) => void;
  // La fonction onAddTask recevra maintenant content, columnId, et boardId
  onAddTask: (
    content: string,
    columnId: string,
    boardId: string
  ) => Promise<void>;
  boardId: string; // Ajoute boardId aux props de ColumnView
}
// components/BoardView.tsx (section ColumnView)

function ColumnView({
  column,
  openFormColId,
  setOpenFormColId,
  onAddTask,
  boardId,
}: ColumnViewProps) {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id, // ID de la colonne pour le droppable
  });

  return (
    <div
      ref={setDroppableNodeRef}
      className="bg-card border border-muted rounded-xl min-w-[260px] flex-shrink-0 shadow-md p-4 h-fit transition hover:shadow-lg"
    >
      <h3 className="font-semibold mb-4 text-lg text-card-foreground">
        {column.title}
      </h3>
      <SortableContext
        // Make absolutely sure `column.tasks` contains valid tasks with `id` properties.
        // Also, `map` them to `task.id` to ensure only the string IDs are passed.
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
        id={column.id}
      >
        <div className="flex flex-col gap-3 min-h-[50px]">
          {column.tasks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              // Make sure `key` is `task.id` and `task` prop is the full task object
              <SortableTask key={task.id} task={task} />
            ))}
          {column.tasks.length === 0 && (
            <div className="text-muted-foreground italic text-sm text-center py-4">
              Glissez des tâches ici
            </div>
          )}
        </div>
      </SortableContext>
      <AddTask
        columnId={column.id}
        boardId={boardId} // Passe le boardId à AddTask
        showForm={openFormColId === column.id}
        onOpen={() => setOpenFormColId(column.id)}
        onClose={() => setOpenFormColId(null)}
        // La fonction onAdd de AddTask sera appelée avec content, columnId, et boardId
        onAdd={(content, colId, bId) => onAddTask(content, colId, bId)}
      />
    </div>
  );
}

// Composant principal BoardView
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

  const sensors = useSensors(useSensor(PointerSensor));

  // Utilise useAction pour ta nouvelle SafeAction de reorder
  const { executeAsync: executeReorder } = useAction(
    reorderTasksAndColumnsSafeAction
  );
  // Pour l'ajout de tâche, tu appelles directement addTaskSafeAction dans handleAddTaskOptimistic
  // mais si tu voulais utiliser useAction ici:
  // const { executeAsync: executeAddTask } = useAction(addTaskSafeAction);

  // Utiliser useMemo pour optimiser findColumn
  const findColumn = useMemo(() => {
    return (id: string | null) => board.columns.find((col) => col.id === id);
  }, [board.columns]);

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
      // Exécute l'action serveur. Le résultat sera un objet de next-safe-action.
      const response = await addTaskSafeAction({
        // Renommage en 'response' pour éviter la confusion
        boardId: boardId,
        columnId: columnId,
        content: content,
        position: newPosition,
      });

      // Accède à la propriété `data` de la réponse de next-safe-action
      // C'est dans `response.data` que se trouvent tes `{ success: true, task: newTask }` ou `{ success: false, error: "..." }`
      const resultData = response.data;

      // Maintenant, tu peux vérifier resultData.success et resultData.task
      if (resultData?.success && resultData?.task) {
        // Utilise l'opérateur de chaînage optionnel '?' pour plus de sécurité
        console.log(
          "Task added to DB successfully with ID:",
          resultData.task.id
        );
      } else {
        console.error(
          "Failed to add task to DB:"
          // resultData?.error || "Unknown error"
        );
        alert(
          "Erreur lors de l'ajout de la tâche : "
          //+ (resultData?.error || "Erreur inconnue")
        );
        // Revert de l'état local si l'ajout échoue
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
      // Revert de l'état local si l'appel échoue
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== tempTaskId),
        })),
      }));
    }
  };
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // --- DEBUT DEBUG AVANCÉ ---
    console.log("--- DRAG END EVENT ---");
    console.log("Active Object (raw):", active);
    console.log("Over Object (raw):", over);
    console.log("----------------------");
    // --- FIN DEBUG AVANCÉ ---

    if (!over) {
      console.log("No valid droppable target.");
      return;
    }

    const activeId = String(active.id); // ID de la tâche déplacée
    const overId = String(over.id); // ID de l'élément cible (peut être une tâche ou une colonne)

    // --- 1. Détermination de la colonne SOURCE ---
    // active.data.current devrait contenir des infos sur le SortableContext parent.
    const sourceColumnId = active.data.current?.sortable?.containerId;

    console.log("Calculated sourceColumnId:", sourceColumnId);

    const sourceColumn = findColumn(sourceColumnId || null); // Utilisez null pour le cas où sourceColumnId est undefined

    if (!sourceColumn) {
      console.error(
        "CRITICAL ERROR: Source column not found for active item. " +
          "active.id:",
        activeId,
        "active.data.current:",
        active.data.current,
        "sourceColumnId (from dnd-kit):",
        sourceColumnId
      );
      // Ceci est l'erreur que nous essayons de résoudre.
      // Si sourceColumnId est undefined, cela indique que dnd-kit n'a pas pu identifier le conteneur sortable.
      return;
    }
    console.log(
      "Source Column Found:",
      sourceColumn.title,
      "(ID:",
      sourceColumn.id,
      ")"
    );

    const activeTask = sourceColumn.tasks.find((task) => task.id === activeId);
    if (!activeTask) {
      console.error(
        "Active task not found in source column:",
        activeId,
        "in column:",
        sourceColumn.id
      );
      return;
    }
    console.log("Active Task Found:", activeTask.content);

    // --- 2. Détermination de la colonne de DESTINATION ---
    let destinationColumnId: string | null = null;

    // Cas A: L'élément 'over' est une AUTRE TÂCHE (qui est un sortable item).
    // Son `containerId` est l'ID de sa colonne.
    if (over.data.current?.sortable?.containerId) {
      destinationColumnId = over.data.current.sortable.containerId as string;
      console.log(
        "Over is a sortable task. Destination column ID from over.data.current:",
        destinationColumnId
      );
    }
    // Cas B: L'élément 'over' est directement une COLONNE (qui est un droppable).
    // Cela arrive souvent quand on glisse vers une colonne vide ou sur l'arrière-plan d'une colonne.
    else if (findColumn(overId)) {
      // Vérifie si overId correspond à une de nos colonnes
      destinationColumnId = overId;
      console.log(
        "Over is a column droppable. Destination column ID from over.id:",
        destinationColumnId
      );
    }
    // Cas C: Fallback. Si 'over' n'est ni une tâche sortable ni une colonne droppable directe,
    // cela peut indiquer un drop non valide ou un problème inattendu.
    else {
      console.error(
        "Destination column ID could not be determined for overId:",
        overId,
        "over.data.current:",
        over.data.current
      );
      return;
    }

    const destinationColumn = findColumn(destinationColumnId);
    if (!destinationColumn) {
      console.error(
        "Destination column not found for ID:",
        destinationColumnId
      );
      return;
    }

    // --- Scénario 1: Glisser-déposer à l'intérieur de la MÊME COLONNE ---
    if (sourceColumn.id === destinationColumn.id) {
      const oldIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );
      const newIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === overId
      );

      if (oldIndex === -1 || newIndex === -1) {
        console.error(
          "Indices not found for same column reorder. activeId:",
          activeId,
          "overId:",
          overId
        );
        return;
      }

      const newOrderedTasksInColumn = arrayMove(
        sourceColumn.tasks,
        oldIndex,
        newIndex
      );

      const updatedTasksWithPositions = newOrderedTasksInColumn.map(
        (task, index) => ({
          ...task,
          position: index + 1,
        })
      );

      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((col) =>
          col.id === sourceColumn.id
            ? { ...col, tasks: updatedTasksWithPositions }
            : col
        ),
      }));

      try {
        const reorderResult = await executeReorder({
          type: "reorderSameColumn",
          boardId: board.id, // <-- AJOUTE LE BOARD ID ICI
          columnId: sourceColumn.id,
          tasks: updatedTasksWithPositions.map((t) => ({
            id: t.id,
            position: t.position,
          })),
        });

        if (reorderResult.data?.success) {
          console.log("Tasks reordered in same column successfully!");
        } else {
          console.error(
            "Failed to reorder tasks in same column:",
            reorderResult.data?.error
          );
          alert(
            "Erreur lors de la réorganisation des tâches dans la même colonne."
          );
          // Optionnel: Revert de l'état si l'action échoue
        }
      } catch (error) {
        console.error("Unexpected error during same column reorder:", error);
        alert("Une erreur inattendue est survenue.");
      }
    }
    // --- Scénario 2: Glisser-déposer VERS UNE AUTRE COLONNE ---
    else {
      let newSourceColumnTasks = [...sourceColumn.tasks];
      let newDestinationColumnTasks = [...destinationColumn.tasks];

      const [taskToMove] = newSourceColumnTasks.splice(
        sourceColumn.tasks.findIndex((task) => task.id === activeId),
        1
      );

      if (!taskToMove) {
        console.error("Task to move not found in source column after splice.");
        return;
      }

      let insertIndex: number;
      if (over.id === destinationColumn.id) {
        // Droppé directement sur l'ID de la colonne (souvent vide ou pour ajouter à la fin)
        insertIndex = newDestinationColumnTasks.length;
      } else {
        // Droppé sur une tâche existante dans la colonne de destination
        insertIndex = newDestinationColumnTasks.findIndex(
          (task) => task.id === overId
        );
        if (insertIndex === -1) {
          // Si la cible n'est pas une tâche spécifique, ajoute à la fin.
          insertIndex = newDestinationColumnTasks.length;
        }
      }

      newDestinationColumnTasks.splice(insertIndex, 0, {
        ...taskToMove,
        columnId: destinationColumn.id, // Mise à jour du columnId
      });

      const updatedSourceColumnTasks = newSourceColumnTasks.map(
        (task, index) => ({
          ...task,
          position: index + 1,
        })
      );
      const updatedDestinationColumnTasks = newDestinationColumnTasks.map(
        (task, index) => ({
          ...task,
          position: index + 1,
        })
      );

      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, tasks: updatedSourceColumnTasks };
          }
          if (col.id === destinationColumn.id) {
            return { ...col, tasks: updatedDestinationColumnTasks };
          }
          return col;
        }),
      }));

      try {
        const reorderResult = await executeReorder({
          // <-- Utilise executeReorder
          type: "moveBetweenColumns",
          boardId: board.id, // <-- AJOUTE LE BOARD ID ICI
          taskId: activeTask.id,
          newColumnId: destinationColumn.id,
          sourceColumnTasks: updatedSourceColumnTasks.map((t) => ({
            id: t.id,
            position: t.position,
          })),
          destinationColumnTasks: updatedDestinationColumnTasks.map((t) => ({
            id: t.id,
            position: t.position,
          })),
        });

        if (reorderResult.data?.success) {
          console.log("Task moved between columns successfully!");
        } else {
          console.error(
            "Failed to move task between columns:",
            reorderResult.data?.error
          );
          alert("Erreur lors du déplacement de la tâche entre les colonnes.");
          // Optionnel: Revert de l'état si l'action échoue
        }
      } catch (error) {
        console.error("Unexpected error moving task between columns:", error);
        alert(
          "Une erreur inattendue est survenue lors du déplacement de la tâche."
        );
      }
    }
  }

  return (
    <SecondPageLayout>
      <div className="text-3xl font-bold text-primary tracking-tight mb-6 border-b border-muted pb-2">
        {board.title}
      </div>
      <div className="flex-1 flex overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 items-start h-full">
            {board.columns.map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                openFormColId={openFormColId}
                setOpenFormColId={setOpenFormColId}
                boardId={board.id} // Pass the boardId to ColumnView
                // CORRECTED LINE BELOW:
                // Pass arguments to handleAddTaskOptimistic in the correct order:
                // (columnId, content, boardId)
                onAddTask={(content, receivedColumnId, receivedBoardId) =>
                  handleAddTaskOptimistic(
                    receivedColumnId,
                    content,
                    receivedBoardId
                  )
                }
              />
            ))}
            <AddColumnButton boardId={board.id} />
          </div>
        </DndContext>
      </div>
    </SecondPageLayout>
  );
}
