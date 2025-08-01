import { SortableContext } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import React from "react";
import SortableTask from "../(task)/SortableTask";
import { AddTask } from "../(task)/AddTask";

export default function ColumnOverlay({
  column,
  openFormColId,
  setOpenFormColId,
  onAddTask,
  boardId,
  handleTaskUpdate,
}: {
  column: {
    id: string;
    title: string;
    tasks: { id: string; content: string; position: number }[];
  };
  openFormColId: string | null;
  setOpenFormColId: (id: string | null) => void;
  onAddTask: (
    content: string,
    columnId: string,
    boardId: string
  ) => Promise<void>;
  boardId: string;
  handleTaskUpdate: (taskId: string, newContent: string) => void;
}) {
  return (
    <div
      className={`bg-card border border-muted rounded-xl w-[350px] flex flex-col shadow-md transition hover:shadow-lg max-h-[80vh] cursor-grabbing
      `}
    >
      <div className="pt-4 px-4 flex items-center gap-2 transition-colors rounded-t-xl">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg text-card-foreground">
          {column.title}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          // strategy={verticalListSortingStrategy}
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
                  task={{ ...task, columnId: column.id }}
                  // onEditStart={() => setIsEditingTask(true)}
                  // onEditEnd={() => setIsEditingTask(false)}
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
