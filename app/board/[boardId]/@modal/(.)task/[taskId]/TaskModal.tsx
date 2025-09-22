"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { parseDate } from "chrono-node";
import { Task } from "@/generated/prisma";
import { Board } from "@/lib/types/type";
import {
  boardKeys,
  useUpdateTaskMutation,
  useUpdateTaskTagsMutation,
} from "@app/board/[boardId]/_hooks/useBoardQueries";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Clock, Plus, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { set } from "zod";
import { Alert } from "@/components/ui/alert";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function TaskModal({ boardId, task }: { boardId: string; task: Task }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [month, setMonth] = useState<Date | undefined>(date);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(!task.dueDate);

  const [isPending, startTransition] = useTransition();

  const [description, setDescription] = useOptimistic(
    task.description || "",
    (_, newDescription: string) => newDescription
  );

  const [dueDate, setDueDate] = useOptimistic(
    task.dueDate ? new Date(task.dueDate) : undefined,
    (_, newDueDate: Date | undefined) => newDueDate
  );

  const [tempDescription, setTempDescription] = useState(
    task.description || ""
  );
  const [tempDateInput, setTempDateInput] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();

  const board = queryClient.getQueryData<Board>(boardKeys.board(boardId));
  const column = board?.columns.find((col) =>
    col.tasks.some((t) => t.id === task.id)
  );

  const updateTaskTagsMutation = useUpdateTaskTagsMutation(boardId);
  const updateTask = useUpdateTaskMutation(boardId);

  const handleSaveDescription = async () => {
    if (!tempDescription.trim()) return;

    setIsEditingDescription(false);

    // Mise à jour optimiste
    startTransition(() => {
      setDescription(tempDescription);
    });

    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        description: tempDescription,
      });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setDescription(task.description || "");
      });
      setIsEditingDescription(true);
    }
  };

  const handleSaveDueDate = async (selectedDate: Date) => {
    setIsEditingDate(false);
    setOpen(false);

    // Mise à jour optimiste
    startTransition(() => {
      setDueDate(selectedDate);
    });

    try {
      await updateTask.mutateAsync({ taskId: task.id, dueDate: selectedDate });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      });
      setIsEditingDate(true);
    }
  };

  const handleRemoveDueDate = async () => {
    setDate(undefined);
    setTempDateInput("");
    startTransition(() => {
      setDueDate(undefined);
    });

    try {
      await updateTask.mutateAsync({ taskId: task.id, dueDate: null });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      });
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) router.back();
  };

  if (!task || !column) {
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={handleBackgroundClick}
      >
        <div
          className="bg-background text-foreground rounded-lg p-6 w-full max-w-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold">Task not found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            The requested task does not exist or has been deleted.
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => router.back()}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const predefinedTags = [
    { name: "urgent", color: "bg-gradient-to-r from-red-500 to-red-600" },
    {
      name: "important",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
    { name: "bug", color: "bg-gradient-to-r from-red-600 to-red-700" },
    { name: "feature", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    {
      name: "enhancement",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      name: "documentation",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      name: "testing",
      color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
    },
    { name: "review", color: "bg-gradient-to-r from-indigo-500 to-indigo-600" },
    { name: "design", color: "bg-gradient-to-r from-pink-500 to-pink-600" },
    { name: "backend", color: "bg-gradient-to-r from-gray-600 to-gray-700" },
    { name: "frontend", color: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
    { name: "api", color: "bg-gradient-to-r from-teal-500 to-teal-600" },
  ];

  const getTagColor = (tagName: string) => {
    const predefined = predefinedTags.find(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
    );
    return predefined?.color || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const isLoading = updateTask.isPending || updateTaskTagsMutation.isPending;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start pt-10 justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-background text-foreground rounded-xl p-6 w-full max-w-6xl shadow-2xl border border-border/50 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {task.content}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                In{" "}
                <span className="font-medium text-foreground">
                  {column.title}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Created on {formatDate(task.createdAt)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-muted rounded-full w-8 h-8 p-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                Description
              </h3>

              {!description || isEditingDescription ? (
                <>
                  <Textarea
                    placeholder="Add a more detailed description..."
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDescription}
                      disabled={isLoading || !tempDescription.trim()}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    {description && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setTempDescription(description);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="group flex bg-muted/30 rounded-lg p-4 text-sm">
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {description}
                  </div>
                  <div className="flex-1"></div>
                  <div className="opacity-0 group-hover:opacity-100 cursor-pointer items-start">
                    <Button
                      onClick={() => {
                        setIsEditingDescription(true);
                        setTempDescription(description);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Due Date Section */}
            <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Due Date</span>
                <div className="flex-1"></div>
                {!(!dueDate || isEditingDate) && (
                  <div className="flex gap-1">
                    <Button
                      onClick={() => {
                        setIsEditingDate(true);
                        setTempDateInput(formatDate(dueDate));
                        setDate(dueDate);
                        setMonth(dueDate);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {!dueDate || isEditingDate ? (
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
                          handleSaveDueDate(date);
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
                        onClick={() => handleSaveDueDate(date)}
                        disabled={isLoading}
                        size="sm"
                      >
                        Save
                      </Button>
                      {dueDate && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditingDate(false);
                              setTempDateInput("");
                              setDate(dueDate);
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <span className="flex-1"></span>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveDueDate}
                            size="sm"
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <span>📅</span>
                      <span>Due date set for</span>
                      <span className="font-medium">{formatDate(dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              )}
            </div>
            {/* Tags Section */}
            {task.tags && task.tags.length > 0 ? (
              <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="w-4 h-4 text-green-500" />
                  <span>Tags</span>
                  <span className="text-xs text-muted-foreground">
                    ({task.tags.length})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <div key={`${tag}-${index}`} className="group relative">
                      <Badge
                        variant="secondary"
                        className={`${getTagColor(
                          tag
                        )} text-white text-xs px-3 py-1 rounded-full 
                          shadow-sm hover:shadow-md border-0`}
                      >
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                          {tag}
                        </span>
                      </Badge>
                    </div>
                  ))}
                  <Badge variant="outline" className="cursor-pointer">
                    <Plus />
                  </Badge>
                </div>
              </div>
            ) : (
              <Button variant="outline">Add tags</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
