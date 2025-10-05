"use client";

import { Button } from "@/components/ui/button";
import { Task } from "@/generated/prisma";
import { Board } from "@/lib/types/type";
import { TaskComments } from "@app/board/[boardId]/@modal/(.)task/[taskId]/_component/TaskComments";
import { TaskDescription } from "@app/board/[boardId]/@modal/(.)task/[taskId]/_component/TaskDescription";
import { TaskDueDate } from "@app/board/[boardId]/@modal/(.)task/[taskId]/_component/TaskDueDate";
import { TaskTags } from "@app/board/[boardId]/@modal/(.)task/[taskId]/_component/TaskTags";
import { boardKeys } from "@app/board/[boardId]/_hooks/useBoardQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

export function TaskModal({
  boardId,
  task,
  currentUserId,
  currentUserName,
  currentUserImage,
}: {
  boardId: string;
  task: Task & {
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        name: string;
        image: string | null;
      };
    }>;
  };
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const board = queryClient.getQueryData<Board>(boardKeys.board(boardId));
  const column = board?.columns.find((col) =>
    col.tasks.some((t) => t.id === task.id)
  );

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) router.back();
  };

  if (!task || !column) {
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 top-0"
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

  return (
    <div
      className="fixed overflow-y-auto inset-0 bg-black/60 flex items-start md:pt-5 pt-0 justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-background text-foreground max-md:h-full md:rounded-xl p-6 w-full max-w-6xl shadow-2xl border border-border/50 backdrop-blur-sm"
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
            <div className="flex max-sm:flex-col sm:items-center sm:gap-4 text-sm text-muted-foreground">
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
            <TaskDescription
              taskId={task.id}
              boardId={boardId}
              initialDescription={task.description || ""}
            />

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                Comments
              </h3>
              <TaskComments
                taskId={task.id}
                boardId={boardId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserImage={currentUserImage}
                initialComments={task.comments}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Due Date Section */}
            <TaskDueDate
              taskId={task.id}
              boardId={boardId}
              initialDueDate={task.dueDate}
            />

            {/* Tags Section */}
            <TaskTags
              taskId={task.id}
              boardId={boardId}
              initialTags={task.tags || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
