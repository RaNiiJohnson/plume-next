"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateTaskMutation } from "@app/board/[boardId]/_hooks/useBoardQueries";
import { parseDate } from "chrono-node";
import { CalendarIcon, Clock } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

interface TaskDueDateProps {
  taskId: string;
  boardId: string;
  initialDueDate: Date | null;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function TaskDueDate({
  taskId,
  boardId,
  initialDueDate,
}: TaskDueDateProps) {
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialDueDate ? new Date(initialDueDate) : undefined
  );
  const [month, setMonth] = useState<Date | undefined>(date);
  const [isEditing, setIsEditing] = useState(!initialDueDate);
  const [tempDateInput, setTempDateInput] = useState("");

  // useOptimistic pour gérer la date d'échéance
  const [optimisticDueDate, setOptimisticDueDate] = useOptimistic(
    initialDueDate ? new Date(initialDueDate) : undefined,
    (_, newDueDate: Date | undefined) => newDueDate
  );

  const updateTask = useUpdateTaskMutation(boardId);

  const handleSave = async (selectedDate: Date) => {
    setIsEditing(false);
    setOpen(false);

    // Mise à jour optimiste
    startTransition(() => {
      setOptimisticDueDate(selectedDate);
    });

    try {
      await updateTask.mutateAsync({ taskId, dueDate: selectedDate });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setOptimisticDueDate(
          initialDueDate ? new Date(initialDueDate) : undefined
        );
      });
      setIsEditing(true);
      console.error("Error updating due date:", error);
    }
  };

  const handleRemove = async () => {
    setDate(undefined);
    setTempDateInput("");

    // Mise à jour optimiste
    startTransition(() => {
      setOptimisticDueDate(undefined);
    });

    try {
      await updateTask.mutateAsync({ taskId, dueDate: null });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setOptimisticDueDate(
          initialDueDate ? new Date(initialDueDate) : undefined
        );
      });
      console.error("Error removing due date:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempDateInput(formatDate(optimisticDueDate));
    setDate(optimisticDueDate);
    setMonth(optimisticDueDate);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempDateInput("");
    setDate(optimisticDueDate);
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 text-blue-500" />
        <span>Due Date</span>
      </div>

      {!optimisticDueDate || isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              id="date"
              value={tempDateInput}
              placeholder="In 2 days, tomorrow..."
              className="bg-background/50 border-border/50 pr-10 text-sm"
              onChange={(e) => {
                setTempDateInput(e.target.value);
                const parsedDate = parseDate(e.target.value);
                if (parsedDate) {
                  setDate(parsedDate);
                  setMonth(parsedDate);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
                if (e.key === "Enter" && date) {
                  e.preventDefault();
                  handleSave(date);
                }
              }}
            />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 hover:bg-muted"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span className="sr-only">Select a date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                      setTempDateInput(formatDate(selectedDate));
                      setOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {date && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleSave(date)}
                disabled={updateTask.isPending}
                size="sm"
                className="h-6 px-2 text-xs"
              >
                Save
              </Button>
              {optimisticDueDate && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                  <span className="flex-1"></span>
                  <Button
                    variant="destructive"
                    onClick={handleRemove}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleEdit}
              className="flex cursor-pointer bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3"
            >
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span>📅</span>
                <span>Due date set for</span>
                <span className="font-medium">
                  {formatDate(optimisticDueDate)}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to edit</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
