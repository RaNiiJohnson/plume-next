import { useState, useCallback } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Column, Task } from "@/lib/types/type";
import { BoardOperations } from "../_services/boardOperations";

interface UseDragAndDropProps {
  board: any;
  findColumn: (id: string | null) => Column | undefined;
  reorderColumns: (columns: Column[]) => void;
  reorderTasksInColumn: (columnId: string, tasks: Task[]) => void;
  moveTaskBetweenColumns: (
    sourceId: string,
    destId: string,
    sourceTasks: Task[],
    destTasks: Task[]
  ) => void;
  rollbackColumn: (columns: Column[]) => void;
  boardOperations: BoardOperations;
}

export const useDragAndDrop = ({
  board,
  findColumn,
  reorderColumns,
  reorderTasksInColumn,
  moveTaskBetweenColumns,
  rollbackColumn,
  boardOperations,
}: UseDragAndDropProps) => {
  const [activeItem, setActiveItem] = useState<Task | Column | null>(null);
  const [draggedItemWidth, setDraggedItemWidth] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const type = active.data.current?.type;

      setDraggedItemWidth(active.rect.current.initial?.width || null);

      if (type === "task") {
        const sourceColumnId = active.data.current?.sortable
          ?.containerId as string;
        const sourceColumn = findColumn(sourceColumnId);
        if (sourceColumn) {
          const task = sourceColumn.tasks.find((t) => t.id === active.id);
          if (task) {
            setActiveItem(task);
          }
        }
      } else if (type === "column") {
        const column = findColumn(String(active.id));
        if (column) {
          setActiveItem(column);
        }
      }
    },
    [findColumn]
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setDraggedItemWidth(null);
  }, []);

  const handleColumnDragEnd = useCallback(
    async (activeId: string, overId: string) => {
      const oldIndex = board.columns.findIndex(
        (col: Column) => col.id === activeId
      );
      const newIndex = board.columns.findIndex(
        (col: Column) => col.id === overId
      );

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const newOrderedColumns = arrayMove(
        board.columns as Column[],
        oldIndex,
        newIndex
      );
      const updatedColumnsWithPositions = newOrderedColumns.map(
        (col: Column, index: number) => ({
          ...col,
          position: index + 1,
        })
      );

      // Update optimistically
      reorderColumns(updatedColumnsWithPositions);

      // Save to database
      const result = await boardOperations.reorderColumns(
        board.id,
        updatedColumnsWithPositions.map((c: Column) => ({
          id: c.id,
          position: c.position,
        }))
      );

      if (!result.success) {
        alert("Erreur lors de la réorganisation des colonnes.");
        rollbackColumn(board.columns);
      }
    },
    [board, reorderColumns, rollbackColumn, boardOperations]
  );

  const handleTaskDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const sourceColumnId = active.data.current?.sortable?.containerId;
      const sourceColumn = findColumn(
        sourceColumnId ? String(sourceColumnId) : null
      );

      if (!sourceColumn) return;

      const activeTask = sourceColumn.tasks.find(
        (task: Task) => task.id === activeId
      );
      if (!activeTask) return;

      let destinationColumnId: string | null = null;
      let droppedOnTask = false;

      if (over.data.current?.type === "task") {
        destinationColumnId = String(over.data.current.sortable.containerId);
        droppedOnTask = true;
      } else if (over.data.current?.type === "column") {
        destinationColumnId = String(over.id);
      } else {
        return;
      }

      const destinationColumn = findColumn(destinationColumnId);
      if (!destinationColumn) return;

      if (sourceColumn.id === destinationColumn.id) {
        // Same column reorder
        const oldIndex = sourceColumn.tasks.findIndex(
          (t: Task) => t.id === activeId
        );
        const newIndex = sourceColumn.tasks.findIndex(
          (t: Task) => t.id === overId
        );

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedTasks = arrayMove(
          sourceColumn.tasks,
          oldIndex,
          newIndex
        ).map((task: Task, index: number) => ({
          ...task,
          position: index + 1,
        }));

        reorderTasksInColumn(sourceColumn.id, updatedTasks);

        const result = await boardOperations.reorderTasksInSameColumn(
          board.id,
          sourceColumn.id,
          updatedTasks.map((t: Task) => ({ id: t.id, position: t.position }))
        );

        if (!result.success) {
          alert("Erreur lors du réordonnancement.");
        }
      } else {
        // Between columns move
        const sourceTasks = sourceColumn.tasks
          .filter((t) => t.id !== activeId)
          .map((t, i) => ({ ...t, position: i + 1 }));

        const destTasks = [...destinationColumn.tasks];
        let insertIndex = destTasks.length;

        if (droppedOnTask) {
          const overTaskIndex = destTasks.findIndex((t) => t.id === overId);
          if (overTaskIndex !== -1) {
            insertIndex = overTaskIndex;
          }
        }

        const taskToInsert = { ...activeTask, columnId: destinationColumn.id };
        destTasks.splice(insertIndex, 0, taskToInsert);

        const updatedDestinationTasks = destTasks.map((t, i) => ({
          ...t,
          position: i + 1,
        }));

        moveTaskBetweenColumns(
          sourceColumn.id,
          destinationColumn.id,
          sourceTasks,
          updatedDestinationTasks
        );

        const result = await boardOperations.moveTaskBetweenColumns(
          board.id,
          activeTask.id,
          destinationColumn.id,
          sourceTasks.map((t) => ({ id: t.id, position: t.position })),
          updatedDestinationTasks.map((t) => ({
            id: t.id,
            position: t.position,
          }))
        );

        if (!result.success) {
          alert("Erreur lors du déplacement. La page va être rechargée.");
          window.location.reload();
        }
      }
    },
    [
      findColumn,
      board,
      reorderTasksInColumn,
      moveTaskBetweenColumns,
      boardOperations,
    ]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveItem(null);
      setDraggedItemWidth(null);

      if (!over) return;

      const draggedItemType = active.data.current?.type;

      if (draggedItemType === "column") {
        await handleColumnDragEnd(String(active.id), String(over.id));
      } else if (draggedItemType === "task") {
        await handleTaskDragEnd(event);
      }
    },
    [handleColumnDragEnd, handleTaskDragEnd]
  );

  return {
    sensors,
    activeItem,
    draggedItemWidth,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
