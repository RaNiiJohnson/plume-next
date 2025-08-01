"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Column, Task } from "@/lib/types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRightFromLine,
  Edit,
  MoreHorizontal,
  Move,
  Save,
  X,
} from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { updateTaskSafeAction } from "./task.action";

interface SortableTaskProps {
  task: Task;
  boardId: string;
  onTaskUpdate: (taskId: string, newContent: string) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  // ✅ AJOUTER CES NOUVELLES PROPS
  onMoveTask?: (
    taskId: string,
    currentColumnId: string,
    targetColumnId: string
  ) => Promise<void>;
  availableColumns?: Column[];
  currentColumnId: string;
}

export default function SortableTask({
  task,
  boardId,
  onTaskUpdate,
  onEditStart,
  onEditEnd,
  onMoveTask,
  availableColumns,
  currentColumnId,
}: SortableTaskProps) {
  if (!task.id) {
    console.error("SortableTask received a task without an ID!", task);
    return null;
  }

  const [taskEdited, setTaskEdited] = useState(false);

  const handleEditStart = () => {
    setTaskEdited(true);
    onEditStart?.();
  };

  const handleEditEnd = () => {
    setTaskEdited(false);
    onEditEnd?.();
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
      task,
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

  // Fonction pour gérer le déplacement
  const handleMoveToColumn = async (targetColumnId: string) => {
    try {
      await onMoveTask?.(task.id, currentColumnId, targetColumnId);
    } catch (error) {
      console.error("Erreur lors du déplacement:", error);
    }
  };

  const editContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      suppressHydrationWarning
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent dark:hover:bg-muted cursor-grab active:cursor-grabbing select-none group"
    >
      {!taskEdited ? (
        <TooltipProvider>
          <span className="flex-1 text-sm font-medium ">
            {optimisticContent}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleEditStart}
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
        <div ref={editContainerRef} className="w-full">
          <Textarea
            ref={ref}
            defaultValue={optimisticContent}
            autoFocus
            className="text-sm font-medium w-full bg-transparent outline-none mb-2"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleEditEnd();
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div
            ref={containerRef}
            className="flex items-center gap-2 mt-1 px-1 py-1 bg-muted/40 rounded-lg border border-muted-foreground/10"
          >
            <Button
              onMouseDown={submit}
              disabled={isPending}
              className="px-4 py-1 h-8 text-sm font-semibold rounded-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <Save size={16} className="mr-1" />
              Save
            </Button>

            <Button
              variant="outline"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault();
                handleEditEnd();
              }}
              className="h-8 w-8 p-0 border-none hover:bg-destructive/10 hover:text-destructive transition"
              aria-label="Cancel"
            >
              <X size={16} />
            </Button>

            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ArrowRightFromLine size={16} className="mr-2" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableColumns?.map((column) => (
                      <DropdownMenuItem
                        key={column.id}
                        onClick={() =>
                          onMoveTask?.(task.id, currentColumnId, column.id)
                        }
                      >
                        {column.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Vos autres actions existantes (edit, delete, etc.) */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
