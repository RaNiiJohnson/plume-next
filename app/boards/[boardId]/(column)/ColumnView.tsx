import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column } from "@/lib/types/type";
import { AsyncIdCallback, IdCallback, MoveTaskFn } from "@/lib/types/shared";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { AddTask } from "../(task)/AddTask";
import SortableTask from "../(task)/SortableTask";

type NullableIdCallback = (id: string | null) => void;

type AddTaskFn = (
  content: string,
  columnId: string,
  boardId: string
) => Promise<void>;

type ColumnViewProps = {
  column: Column;
  handleTaskUpdate: (taskId: string, newContent: string) => void;
  openFormColId: string | null;
  setOpenFormColId: NullableIdCallback;
  onAddTask: AddTaskFn;
  boardId: string;
  onMoveTask?: MoveTaskFn;
  availableColumns?: Column[];
  editingTaskId: string | null;
  onTaskEditStart: IdCallback;
  onTaskEditEnd: () => void;
  handleTaskDelete: AsyncIdCallback;
  onDeleteColumn?: AsyncIdCallback;
};

export default function ColumnView({
  column,
  openFormColId,
  setOpenFormColId,
  onAddTask,
  boardId,
  handleTaskUpdate,
  onMoveTask,
  availableColumns,
  editingTaskId,
  onTaskEditStart,
  onTaskEditEnd,
  handleTaskDelete,
  onDeleteColumn,
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
    disabled: editingTaskId !== null,
  });

  const mergedRef = (node: HTMLElement | null) => {
    setDroppableNodeRef(node);
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleDeleteColumn = async (): Promise<void> => {
    if (onDeleteColumn) {
      await onDeleteColumn(column.id);
    }
  };

  return (
    <div
      suppressHydrationWarning={true}
      ref={mergedRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`bg-card border border-muted rounded-xl w-[350px] flex flex-col shadow-md transition hover:shadow-lg max-h-[80vh] cursor-grab active:cursor-grabbing
      `}
    >
      <div className="bg-card border border-muted rounded-xl w-[350px] flex flex-col">
        <div className="pt-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg text-card-foreground">
              {column.title}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded cursor-pointer hover:bg-primary/50 transition">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDeleteColumn}>
                Delete
                <DropdownMenuShortcut>
                  <Trash2 />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
          id={column.id}
        >
          <div className="flex flex-col gap-4">
            {column.tasks
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((task) => (
                <SortableTask
                  onTaskUpdate={handleTaskUpdate}
                  boardId={boardId}
                  key={task.id}
                  task={task}
                  onMoveTask={onMoveTask}
                  availableColumns={availableColumns}
                  currentColumnId={column.id}
                  isEditing={editingTaskId === task.id}
                  onEditStart={() => onTaskEditStart(task.id)}
                  onEditEnd={onTaskEditEnd}
                  onTaskDelete={handleTaskDelete}
                />
              ))}
          </div>
        </SortableContext>
      </div>

      <div className="px-2 pb-2 bg-card">
        <AddTask
          columnId={column.id}
          boardId={boardId}
          showForm={openFormColId === column.id}
          onOpen={() => setOpenFormColId(column.id)}
          onClose={() => setOpenFormColId(null)}
          onAdd={(content, colId, bId) => onAddTask(content, colId, bId)}
        />
      </div>
    </div>
  );
}
