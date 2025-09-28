"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  addCommentToTaskSafeAction,
  updateCommentSafeAction,
  deleteCommentSafeAction,
} from "@app/board/[boardId]/(task)/task.action";
import clsx from "clsx";
import { Send, Edit2, Trash2, Check, X, MoreHorizontal } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { FormEvent, useOptimistic, useState, useTransition } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
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
  currentUserName: string;
  currentUserImage: string | null;
  initialComments: Comment[];
}

export function TaskComments({
  taskId,
  boardId,
  currentUserId,
  currentUserName,
  currentUserImage,
  initialComments,
}: TaskCommentsProps) {
  const [, startTransition] = useTransition();
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // useOptimistic pour gérer la liste des commentaires avec les ajouts, modifications et suppressions optimistes
  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    initialComments,
    (
      state: Comment[],
      action: {
        type: "add" | "update" | "delete";
        comment?: Comment;
        commentId?: string;
      }
    ) => {
      switch (action.type) {
        case "add":
          return action.comment ? [...state, action.comment] : state;
        case "update":
          return action.comment
            ? state.map((c) =>
                c.id === action.comment!.id ? action.comment! : c
              )
            : state;
        case "delete":
          return state.filter((c) => c.id !== action.commentId);
        default:
          return state;
      }
    }
  );

  // Actions pour les commentaires
  const { execute: addComment, isExecuting: isAddingComment } = useAction(
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

  const { execute: updateComment, isExecuting: isUpdatingComment } = useAction(
    updateCommentSafeAction,
    {
      onSuccess: () => {
        setEditingCommentId(null);
        setEditingContent("");
      },
      onError: (error) => {
        console.error("Error updating comment:", error);
      },
    }
  );

  const { execute: deleteComment } = useAction(deleteCommentSafeAction, {
    onError: (error) => {
      console.error("Error deleting comment:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!commentInput.trim()) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, // ID temporaire
      content: commentInput.trim(),
      createdAt: new Date(),
      author: {
        id: currentUserId,
        name: currentUserName,
        image: currentUserImage,
      },
    };

    startTransition(() => {
      // Ajouter le commentaire optimiste
      updateOptimisticComments({ type: "add", comment: optimisticComment });

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

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editingContent.trim()) return;

    const optimisticUpdatedComment: Comment = {
      ...optimisticComments.find((c) => c.id === commentId)!,
      content: editingContent.trim(),
      updatedAt: new Date(),
    };

    startTransition(() => {
      updateOptimisticComments({
        type: "update",
        comment: optimisticUpdatedComment,
      });

      updateComment({
        commentId,
        boardId,
        content: editingContent.trim(),
      });
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

    startTransition(() => {
      updateOptimisticComments({ type: "delete", commentId });

      deleteComment({
        commentId,
        boardId,
      });
    });
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
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
              className="flex gap-3 p-3 bg-muted/20 rounded-lg group"
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
                  <span className="text-xs text-muted-foreground/60">
                    {formatDate(comment.createdAt)}
                  </span>
                  <div className="flex-1"></div>
                  {comment.author.id === currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded cursor-pointer hover:bg-primary/50 transition">
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => handleEditComment(comment)}
                        >
                          Edit
                          <DropdownMenuShortcut>
                            <Edit2 />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => handleDeleteComment(comment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                          <DropdownMenuShortcut>
                            <Trash2 />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="text-sm"
                      disabled={isUpdatingComment}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editingContent.trim() || isUpdatingComment}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={cancelEdit}
                        disabled={isUpdatingComment}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
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
          disabled={isAddingComment}
        />
        <div
          className={clsx("flex justify-end", {
            hidden: !commentInput.trim(),
          })}
        >
          <Button
            type="submit"
            disabled={!commentInput.trim() || isAddingComment}
            size="sm"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isAddingComment ? "Sending..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
