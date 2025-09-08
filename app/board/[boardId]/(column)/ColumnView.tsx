import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AsyncIdCallback, IdCallback } from "@/lib/types/shared";
import { Column } from "@/lib/types/type";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  GripVertical,
  Inbox,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AddTask } from "../(task)/AddTask";
import SortableTask from "../(task)/SortableTask";
import { useBoardStore } from "../_hooks/useBoardStore";

type NullableIdCallback = (id: string | null) => void;

type AddTaskFn = (
  content: string,
  columnId: string,
  boardId: string
) => Promise<void>;

type ColumnViewProps = {
  column: Column;
  boardStore: ReturnType<typeof useBoardStore>;
  openFormColId: string | null;
  setOpenFormColId: NullableIdCallback;
  editingTaskId: string | null;
  onTaskEditStart: IdCallback;
  onTaskEditEnd: () => void;
};

export default function ColumnView({
  column,
  boardStore,
  openFormColId,
  setOpenFormColId,
  editingTaskId,
  onTaskEditStart,
  onTaskEditEnd,
}: ColumnViewProps) {
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
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
    disabled: editingTaskId !== null,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mergedRef = (node: HTMLElement | null) => {
    setDroppableNodeRef(node);
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? transition
      : "transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 200ms ease",
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 0.98 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const onAddTask: AddTaskFn = async (content, columnId) => {
    await boardStore.handleAddTask(content, columnId);
    setOpenFormColId(null);
  };

  const onDeleteColumn: AsyncIdCallback = async (id) => {
    await boardStore.handleColumnDelete(id);
    setIsDialogOpen(false);
  };

  const handleDeleteColumn = async (): Promise<void> => {
    if (onDeleteColumn) {
      await onDeleteColumn(column.id);
    }
  };

  const getColumnStyle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (
      lowerTitle.includes("todo") ||
      lowerTitle.includes("to do") ||
      lowerTitle.includes("backlog")
    ) {
      return {
        borderColor: "border-blue-200 dark:border-blue-800",
        headerBg: "bg-blue-50 dark:bg-blue-950/50",
        icon: <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        badgeColor:
          "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      };
    }
    if (
      lowerTitle.includes("progress") ||
      lowerTitle.includes("doing") ||
      lowerTitle.includes("work")
    ) {
      return {
        borderColor: "border-yellow-200 dark:border-yellow-800",
        headerBg: "bg-yellow-50 dark:bg-yellow-950/50",
        icon: (
          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        ),
        badgeColor:
          "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
      };
    }
    if (
      lowerTitle.includes("done") ||
      lowerTitle.includes("complete") ||
      lowerTitle.includes("finish")
    ) {
      return {
        borderColor: "border-green-200 dark:border-green-800",
        headerBg: "bg-green-50 dark:bg-green-950/50",
        icon: (
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        ),
        badgeColor:
          "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      };
    }
    if (
      lowerTitle.includes("review") ||
      lowerTitle.includes("test") ||
      lowerTitle.includes("qa")
    ) {
      return {
        borderColor: "border-purple-200 dark:border-purple-800",
        headerBg: "bg-purple-50 dark:bg-purple-950/50",
        icon: (
          <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        ),
        badgeColor:
          "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
      };
    }
    // Style par défaut
    return {
      borderColor: "border-muted",
      headerBg: "bg-muted/30",
      icon: <GripVertical className="w-4 h-4 text-muted-foreground" />,
      badgeColor: "bg-muted text-muted-foreground",
    };
  };

  const columnStyle = getColumnStyle(column.title);
  const taskCount = column.tasks.length;

  return (
    <div
      suppressHydrationWarning={true}
      ref={mergedRef}
      {...attributes}
      style={style}
      className={`
        bg-card border-2 rounded-xl min-w-[300px] max-w-[300px] flex flex-col shadow-sm 
        transition-all duration-200 ease-out max-h-[80vh] cursor-grab active:cursor-grabbing
        hover:shadow-md hover:scale-[1.02]
        ${columnStyle.borderColor}
        ${isDragging ? "shadow-2xl ring-2 ring-primary/20" : ""}
        ${isOver ? "ring-2 ring-blue-400 bg-blue-50/50" : ""}
      `}
      {...listeners}
    >
      <div
        className={`${columnStyle.headerBg} border-b ${columnStyle.borderColor} rounded-t-xl px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {columnStyle.icon}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-card-foreground">
                {column.title}
              </h3>
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-1 font-medium ${columnStyle.badgeColor}`}
              >
                {taskCount}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setOpenFormColId(column.id)}
              className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add task"
            >
              <Plus size={16} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto w-auto text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                  Delete column
                  <DropdownMenuShortcut>
                    <Trash2 className="w-4 h-4 mr-2" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {column.tasks.length > 0
                      ? `This column contains ${column.tasks.length} task${
                          column.tasks.length > 1 ? "s" : ""
                        }. ` + ` Are you sure you want to delete it ?`
                      : "Are you absolutely sure to delete this column?"}
                  </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteColumn}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 min-h-0 custom-scrollbar">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
          id={column.id}
        >
          <div className="flex flex-col gap-3">
            {taskCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No tasks
                </p>
              </div>
            ) : (
              // Liste des tâches
              column.tasks
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-in slide-in-from-top-2 duration-200"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <SortableTask
                      onTaskUpdate={boardStore.handleTaskUpdate}
                      boardId={boardStore.board!.id}
                      task={task}
                      onMoveTask={boardStore.handleMoveTaskToColumn}
                      availableColumns={boardStore.board!.columns.filter(
                        (col) => col.id !== column.id
                      )}
                      currentColumnId={column.id}
                      isEditing={editingTaskId === task.id}
                      onEditStart={() => onTaskEditStart(task.id)}
                      onEditEnd={onTaskEditEnd}
                      onTaskDelete={boardStore.handleTaskDelete}
                    />
                  </div>
                ))
            )}
          </div>
        </SortableContext>
      </div>

      <div className="px-3 pb-3">
        <AddTask
          columnId={column.id}
          boardId={boardStore.board!.id}
          showForm={openFormColId === column.id}
          onOpen={() => setOpenFormColId(column.id)}
          onClose={() => setOpenFormColId(null)}
          onAdd={(content, colId, bId) => onAddTask(content, colId, bId)}
        />
      </div>
    </div>
  );
}
