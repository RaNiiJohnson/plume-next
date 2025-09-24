"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { addCommentToTaskSafeAction } from "@app/board/[boardId]/(task)/task.action";
import { useRouter } from "next/navigation";

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
  const [newComment, setNewComment] = useState("");
  const router = useRouter();

  // Action pour ajouter un commentaire
  const { execute: addComment, isExecuting } = useAction(
    addCommentToTaskSafeAction,
    {
      onSuccess: () => {
        setNewComment("");
        // Rafraîchir la page pour voir le nouveau commentaire
        router.refresh();
      },
      onError: (error) => {
        console.error("Error adding comment:", error);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment({
      taskId,
      boardId,
      authorId: currentUserId,
      content: newComment.trim(),
    });
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
      {initialComments.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {initialComments.map((comment: Comment) => (
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
                  <span className="font-medium text-sm">
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
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
        </div>
      )}

      {/* Formulaire pour ajouter un commentaire */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
          disabled={isExecuting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || isExecuting}
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
