"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCommentToTaskSafeAction } from "@app/board/[boardId]/(task)/task.action";
import { Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { FormEvent, useOptimistic, useState, useTransition } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface TaskCommentsProps {
  taskId: string;
  boardId: string;
  currentUserId: string;
  initialComments: Comment[];
}

export function TaskComments({
  taskId,
  boardId,
  currentUserId,
  initialComments,
}: TaskCommentsProps) {
  const [, startTransition] = useTransition();
  const [commentInput, setCommentInput] = useState("");

  // useOptimistic pour gérer la liste des commentaires avec les ajouts optimistes
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state: Comment[], newComment: Comment) => [...state, newComment]
  );

  // Action pour ajouter un commentaire
  const { execute: addComment, isExecuting } = useAction(
    addCommentToTaskSafeAction,
    {
      onSuccess: () => {
        setCommentInput("");
      },
      onError: (error) => {
        console.error("Error adding comment:", error);
      },
    }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!commentInput.trim()) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, // ID temporaire
      content: commentInput.trim(),
      createdAt: new Date(),
      author: {
        id: currentUserId,
        name: "You", // Nom temporaire
        image: null,
      },
    };

    startTransition(() => {
      // Ajouter le commentaire optimiste
      addOptimisticComment(optimisticComment);

      // Exécuter l'action
      addComment({
        taskId,
        boardId,
        authorId: currentUserId,
        content: commentInput.trim(),
      });
    });

    setCommentInput("");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Liste des commentaires */}
      {optimisticComments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {optimisticComments.map((comment: Comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-muted/20 rounded-lg"
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="text-xs">
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-primary">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire pour ajouter un commentaire */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          disabled={isExecuting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!commentInput.trim() || isExecuting}
            size="sm"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isExecuting ? "Sending..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
