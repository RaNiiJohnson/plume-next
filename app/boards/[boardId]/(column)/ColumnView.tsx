import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddTask } from "../(task)/AddTask";
import SortableTask from "../(task)/SortableTask";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "@/lib/types/board";

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

export default function ColumnView({
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
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      suppressHydrationWarning={true}
      ref={mergedRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-card border border-muted rounded-xl min-w-[300px] h-fit space-y-3 shadow-md py-4 px-2 transition hover:shadow-lg group"
    >
      <h3 className="font-semibold text-lg text-card-foreground">
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
