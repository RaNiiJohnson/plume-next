// components/TestDnd.tsx (pour le débogage uniquement)
"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SimpleTask {
  id: string;
  content: string;
}

function SimpleSortableTask({ task }: { task: SimpleTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: "1px solid black",
    padding: "10px",
    margin: "5px",
    backgroundColor: "lightgray",
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {task.content}
    </div>
  );
}

export default function TestDnd() {
  const [tasks, setTasks] = useState<SimpleTask[]>([
    { id: "task-1", content: "Test Task 1" },
    { id: "task-2", content: "Test Task 2" },
    { id: "task-3", content: "Test Task 3" },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        console.log(
          `Dragging ${active.id} from ${oldIndex} to ${newIndex} in column ${active.data.current?.sortable?.containerId}`
        );
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          padding: "20px",
          border: "1px solid blue",
          minHeight: "200px",
          width: "300px",
        }}
      >
        <h2>Test Column</h2>
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SimpleSortableTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
