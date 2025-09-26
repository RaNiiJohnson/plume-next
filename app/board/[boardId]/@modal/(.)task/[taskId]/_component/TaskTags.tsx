"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateTaskTagsMutation } from "@app/board/[boardId]/_hooks/useBoardQueries";
import { Plus, Save, Tag, X } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

interface TaskTagsProps {
  taskId: string;
  boardId: string;
  initialTags: string[];
}

export function TaskTags({ taskId, boardId, initialTags }: TaskTagsProps) {
  const [, startTransition] = useTransition();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [showPredefinedTags, setShowPredefinedTags] = useState(false);

  // useOptimistic pour gérer les tags
  const [optimisticTags, updateOptimisticTags] = useOptimistic(
    initialTags,
    (state: string[], action: { type: "add" | "remove"; tag: string }) => {
      switch (action.type) {
        case "add":
          return state.includes(action.tag) ? state : [...state, action.tag];
        case "remove":
          return state.filter((tag) => tag !== action.tag);
        default:
          return state;
      }
    }
  );

  const updateTaskTagsMutation = useUpdateTaskTagsMutation(boardId);

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

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim()) return;

    const trimmedTag = tagName.trim();
    if (optimisticTags.includes(trimmedTag)) {
      setNewTagInput("");
      setIsAddingTag(false);
      setShowPredefinedTags(false);
      return;
    }

    // Mise à jour optimiste
    startTransition(() => {
      updateOptimisticTags({ type: "add", tag: trimmedTag });
    });

    try {
      await updateTaskTagsMutation.mutateAsync({
        taskId,
        tags: [...optimisticTags, trimmedTag],
      });
      // setNewTagInput("");
      // setIsAddingTag(false);
      // setShowPredefinedTags(false);
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        updateOptimisticTags({ type: "remove", tag: trimmedTag });
      });
      console.error("Error adding tag:", error);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    // Mise à jour optimiste
    startTransition(() => {
      updateOptimisticTags({ type: "remove", tag: tagToRemove });
    });

    try {
      const newTags = optimisticTags.filter((tag) => tag !== tagToRemove);
      await updateTaskTagsMutation.mutateAsync({
        taskId,
        tags: newTags,
      });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        updateOptimisticTags({ type: "add", tag: tagToRemove });
      });
      console.error("Error removing tag:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      handleAddTag(newTagInput);
    } else if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTagInput("");
      setShowPredefinedTags(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="w-4 h-4 text-green-500" />
        <span>Tags</span>
        {optimisticTags.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({optimisticTags.length})
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {optimisticTags.map((tag, index) => (
          <div key={`${tag}-${index}`} className="group relative">
            <Badge
              variant="secondary"
              className={`${getTagColor(
                tag
              )} text-white text-xs px-3 py-1 rounded-full 
              shadow-sm hover:shadow-md border-0 group-hover:pr-6 transition-all`}
            >
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                {tag}
              </span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="absolute cursor-pointer right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                       text-white/70 hover:text-white transition-opacity"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        ))}

        {/* Bouton d'ajout ou input */}
        {isAddingTag ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter tag name..."
              className="h-7 text-xs w-32"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => {
                handleAddTag(newTagInput);
                setShowPredefinedTags(false);
                setNewTagInput("");
                setIsAddingTag(false);
              }}
              disabled={!newTagInput.trim() || updateTaskTagsMutation.isPending}
              className="h-7 px-2"
            >
              <Save className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingTag(false);
                setNewTagInput("");
                setShowPredefinedTags(false);
              }}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => setIsAddingTag(true)}
            >
              <Plus className="w-3 h-3" />
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPredefinedTags(!showPredefinedTags)}
              className="h-7 px-2 text-xs"
            >
              Quick tags
            </Button>
          </div>
        )}
      </div>

      {/* Tags prédéfinis */}
      {showPredefinedTags && (
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">Quick add:</p>
          <div className="flex flex-wrap gap-1">
            {predefinedTags
              .filter(
                (predefinedTag) => !optimisticTags.includes(predefinedTag.name)
              )
              .map((predefinedTag) => (
                <button
                  key={predefinedTag.name}
                  onClick={() => {
                    handleAddTag(predefinedTag.name);
                    setShowPredefinedTags(false);
                  }}
                  disabled={updateTaskTagsMutation.isPending}
                  className={`${predefinedTag.color} text-white text-xs px-2 py-1 rounded-full 
                           hover:shadow-md transition-shadow disabled:opacity-50`}
                >
                  {predefinedTag.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
