"use client";

import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Kanban } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import { Board, Task } from "@/lib/types/type";
import { AddColumnButton } from "./(column)/addColumnButton";
import ColumnView from "./(column)/ColumnView";
import TaskOverlay from "./(task)/TaskOverlay";
import { reorderTasksAndColumnsSafeAction } from "./(task)/task.action";

import { useBoardState } from "./hooks/useBoardState";
import { BoardOperations } from "./services/boardOperations";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useBoardActions } from "./hooks/useBoardAction";

export default function BoardView({ board: initialBoard }: { board: Board }) {
  const [openFormColId, setOpenFormColId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // État du board
  const boardState = useBoardState(initialBoard);

  // Services
  const { executeAsync: executeReorder } = useAction(
    reorderTasksAndColumnsSafeAction
  );
  const boardOperations = useMemo(
    () => new BoardOperations(executeReorder),
    [executeReorder]
  );

  // Actions métier
  const boardActions = useBoardActions(boardState, boardOperations);

  // Drag & Drop
  const dragAndDrop = useDragAndDrop({
    board: boardState.board,
    findColumn: boardState.findColumn,
    reorderColumns: boardState.reorderColumns,
    reorderTasksInColumn: boardState.reorderTasksInColumn,
    moveTaskBetweenColumns: boardState.moveTaskBetweenColumns,
    rollbackColumn: boardState.rollbackColumn,
    boardOperations,
  });

  const columnsId = useMemo(
    () => boardState.board.columns.map((col) => col.id),
    [boardState.board.columns]
  );

  const handleTaskEditStart = (taskId: string) => setEditingTaskId(taskId);
  const handleTaskEditEnd = () => setEditingTaskId(null);

  return (
    <div className="h-full w-full flex flex-col min-w-0">
      {/* Header du board */}
      <div className="flex items-center gap-3 mb-8 flex-shrink-0">
        <div className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
          {boardState.board.title}
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary shadow w-9 h-9">
          <Kanban size={22} strokeWidth={2.2} />
        </span>
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
              {boardState.board.columns.map((column) => (
                <ColumnView
                  key={column.id}
                  column={column}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  boardId={boardState.board.id}
                  handleTaskUpdate={boardActions.handleTaskUpdate}
                  handleTaskDelete={boardActions.handleTaskDelete}
                  onAddTask={boardActions.handleAddTask}
                  onMoveTask={boardActions.handleMoveTaskToColumn}
                  availableColumns={boardState.board.columns.filter(
                    (col) => col.id !== column.id
                  )}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                  onDeleteColumn={boardActions.handleColumnDelete}
                />
              ))}
            </SortableContext>
            <AddColumnButton
              onAddColumn={boardActions.handleAddColumn}
              boardId={boardState.board.id}
            />
          </div>

          <DragOverlay>
            {dragAndDrop.activeItem ? (
              "tasks" in dragAndDrop.activeItem ? (
                <ColumnView
                  key={dragAndDrop.activeItem.id}
                  column={dragAndDrop.activeItem}
                  openFormColId={openFormColId}
                  setOpenFormColId={setOpenFormColId}
                  boardId={boardState.board.id}
                  handleTaskUpdate={boardActions.handleTaskUpdate}
                  handleTaskDelete={boardActions.handleTaskDelete}
                  onAddTask={boardActions.handleAddTask}
                  onMoveTask={boardActions.handleMoveTaskToColumn}
                  availableColumns={boardState.board.columns.filter(
                    (col) => col.id !== dragAndDrop.activeItem!.id
                  )}
                  editingTaskId={editingTaskId}
                  onTaskEditStart={handleTaskEditStart}
                  onTaskEditEnd={handleTaskEditEnd}
                  onDeleteColumn={boardActions.handleColumnDelete}
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
