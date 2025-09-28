"use client";

import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

import { Board, Task } from "@/lib/types/type";
import { AddColumnButton } from "./(column)/addColumnButton";
import ColumnView from "./(column)/ColumnView";
import TaskOverlay from "./(task)/TaskOverlay";

import { useBoardStore } from "./_hooks/useBoardStore";
import { useDragAndDrop } from "./_hooks/useDragAndDrop";

export default function BoardView({ board: initialBoard }: { board: Board }) {
  const [openFormColId, setOpenFormColId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Board store avec TanStack Query
  const boardStore = useBoardStore(initialBoard.id, initialBoard);

  // Drag & Drop
  const dragAndDrop = useDragAndDrop({
    board: boardStore.board!,
    findColumn: boardStore.findColumn,
    reorderColumns: boardStore.reorderColumns,
    reorderTasksInColumn: boardStore.reorderTasksInColumn,
    moveTaskBetweenColumns: boardStore.moveTaskBetweenColumns,
    rollbackColumn: boardStore.rollbackColumn,
    reorderMutation: boardStore.reorderMutation,
    taskReorderMutation: boardStore.taskReorderMutation,
  });

  const columnsId = useMemo(
    () => boardStore.board?.columns.map((col) => col.id) || [],
    [boardStore.board?.columns]
  );

  const handleTaskEditStart = (taskId: string) => setEditingTaskId(taskId);
  const handleTaskEditEnd = () => setEditingTaskId(null);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleTaskEditEnd();
  };

  return (
    <div
      className="h-full w-full flex flex-col min-w-0"
      onClick={handleBackgroundClick}
    >
      {/* Header du board */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {boardStore.board?.title}
            </h1>
            <p className="text-sm text-secondary-foreground/50 mt-1">
              {boardStore.board?.columns.length || 0} colonnes •{" "}
              {boardStore.board?.columns.reduce(
                (acc, col) => acc + col.tasks.length,
                0
              ) || 0}{" "}
              tâches
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable des colonnes */}
      <div className="flex-1 min-h-0 min-w-0">
        <DndContext
          sensors={dragAndDrop.sensors}
          collisionDetection={pointerWithin}
          onDragStart={dragAndDrop.handleDragStart}
          onDragEnd={dragAndDrop.handleDragEnd}
          onDragCancel={dragAndDrop.handleDragCancel}
        >
          <div
            className="flex gap-8 items-start overflow-x-auto custom-scrollbar h-full pb-4 min-w-0"
            style={{ width: "100%" }}
          >
            <SortableContext
              items={columnsId}
              strategy={horizontalListSortingStrategy}
            >
              {boardStore.board?.columns.map((column) => (
                <ColumnView
                  key={column.id}
                  column={column}
                  boardStore={boardStore}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                />
              )) || []}
            </SortableContext>
            <AddColumnButton
              onAddColumn={boardStore.handleAddColumn}
              boardId={boardStore.board!.id}
            />
          </div>

          <DragOverlay>
            {dragAndDrop.activeItem ? (
              "tasks" in dragAndDrop.activeItem ? (
                <ColumnView
                  key={dragAndDrop.activeItem.id}
                  boardStore={boardStore}
                  column={dragAndDrop.activeItem}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                />
              ) : (
                <TaskOverlay
                  task={dragAndDrop.activeItem as Task}
                  width={dragAndDrop.draggedItemWidth || undefined}
                />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
