"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit } from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { updateTaskSafeAction } from "./task.action";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  position?: number;
  content: string;
  columnId: string;
}

export default function SortableTask({
  task,
  boardId,
  onTaskUpdate,
}: {
  task: Task;
  boardId: string;
  onTaskUpdate?: (taskId: string, newContent: string) => void;
  onEditStart?: (taskId: string) => void;
  onEditEnd?: (taskId: string) => void;
}) {
  if (!task.id) {
    console.error("SortableTask received a task without an ID!", task);
    return null;
  }

  const [taskEdited, setTaskEdited] = useState(false);

  const handleEditEnd = () => {
    setTaskEdited(false);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task: task,
    },
    disabled: taskEdited,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticContent, setOptimisticContent] = useOptimistic(
    task.content,
    (_, newContent: string) => newContent
  );

  const submit = async () => {
    const newContent = ref.current?.value ?? "";

    if (newContent.trim() === "") {
      console.error("Task content cannot be empty.");
      return;
    }

    startTransition(() => {
      setOptimisticContent(newContent);
    });

    // Mise à jour optimiste dans le parent (BoardView)
    onTaskUpdate?.(task.id, newContent);

    try {
      const result = await updateTaskSafeAction({
        taskId: task.id,
        content: newContent,
        boardId: boardId,
      });

      if (result.data?.success) {
        console.log("✅ Task updated successfully!");
        handleEditEnd();
      } else {
        console.error("Failed to update task:", result.data);
        setOptimisticContent(task.content);
        onTaskUpdate?.(task.id, task.content);
        alert("Erreur lors de la mise à jour de la tâche.");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setOptimisticContent(task.content);
      onTaskUpdate?.(task.id, task.content);
      alert("Une erreur inattendue est survenue.");
    }
  };

  return (
    <div
      suppressHydrationWarning
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-grab active:cursor-grabbing select-none group"
    >
      {!taskEdited ? (
        <TooltipProvider>
          <span className="flex-1 text-sm font-medium ">
            {optimisticContent}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setTaskEdited(!taskEdited)}
                variant="ghost"
                className="size-5 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <Edit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Edit card</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <form className="w-full">
          <Textarea
            ref={ref}
            defaultValue={optimisticContent}
            autoFocus
            className="text-sm font-medium w-full bg-transparent outline-none mb-2"
            onBlur={() => {
              handleEditEnd();
            }}
          />
          <Button
            type="button"
            variant="outline"
            onMouseDown={() => setTaskEdited(false)}
          >
            Cancel
          </Button>
          <Button className="ml-2" onMouseDown={submit} disabled={isPending}>
            Save
          </Button>
        </form>
      )}
    </div>
  );
}
