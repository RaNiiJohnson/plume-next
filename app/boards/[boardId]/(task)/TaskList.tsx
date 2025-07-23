// components/TaskList.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableTask from "./SortableTask";
import { reorderTasks } from "./task.action";

interface Task {
  id: string;
  position: number;
  content: string;
  columnId: string;
}

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrderedTasks = arrayMove(tasks, oldIndex, newIndex);

      const updatedTasksWithPositions = newOrderedTasks.map((task, index) => ({
        ...task,
        position: index + 1,
      }));

      // Met à jour l'état local pour un feedback visuel immédiat
      setTasks(updatedTasksWithPositions);

      // Appelle la Server Action pour persister les changements
      // Tu n'as plus besoin de fetch, JSON.stringify, etc.
      const result = await reorderTasks(
        updatedTasksWithPositions.map((t) => ({
          id: t.id,
          position: t.position,
        }))
      );

      if (result.error) {
        console.error("Error reordering tasks:", result.error, result.details);
        alert(
          "Une erreur est survenue lors de la sauvegarde de l'ordre des tâches."
        );
        // Optionnel : Revert à l'état précédent si la requête échoue
        setTasks(tasks);
      } else {
        console.log(result.message);
        // Next.js va gérer la revalidation côté serveur grâce à `revalidatePath` dans la Server Action
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="text-muted-foreground italic text-sm">
              Aucune tâche
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
