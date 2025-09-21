"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import { Task } from "@/lib/types/type";

// Type étendu pour Task avec tags
type TaskWithTags = Task & {
  tags?: string[];
};
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Save,
  Tags,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useBoardStore } from "../_hooks/useBoardStore";

type SortableTaskProps = {
  task: TaskWithTags;
  currentColumnId: string;
  isEditing: boolean;
  boardStore?: ReturnType<typeof useBoardStore>;
  onEditStart: () => void;
  onEditEnd: () => void;
};

export default function SortableTask({
  boardStore,
  task,
  currentColumnId,
  isEditing,
  onEditStart,
  onEditEnd,
}: SortableTaskProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(task.tags || []);

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentMemberRole = boardStore?.board?.organization?.members?.find(
    (m) => m.user.id === currentUserId
  )?.role;
  const hasPermission =
    currentMemberRole === "owner" || currentMemberRole === "admin";

  if (!task.id) {
    console.error("SortableTask received a task without an ID!", task);
    return null;
  }

  const onMoveTask = async (
    id: string,
    currentColumnId: string,
    newColumnId: string
  ) => {
    await boardStore?.handleMoveTaskToColumn(id, currentColumnId, newColumnId);
  };

  const onTaskUpdate = async (id: string, content: string) => {
    await boardStore?.handleTaskUpdate(id, content);
  };

  const onTaskDelete = async (id: string) => {
    await boardStore?.handleTaskDelete(id);
  };

  const availableColumns = boardStore?.board?.columns.filter(
    (col) => col.id !== currentColumnId
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
    disabled: isEditing,
  });

  const handleEdit = () => {
    onEditStart();
  };

  const handleDelete = async () => {
    try {
      await onTaskDelete(task.id);
    } catch (error) {
      console.error("Error while deleting:", error);
    }
  };

  const handleCancel = () => {
    onEditEnd();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticContent, setOptimisticContent] = useOptimistic(
    task.content,
    (_, newContent: string) => newContent
  );
  const [optimisticTag, setOptimisticTag] = useOptimistic(
    task.tags || [],
    (_, newTags: string[]) => newTags
  );

  const submit = async () => {
    const newContent = ref.current?.value ?? "";

    if (newContent.trim() === "") {
      toast("Task content cannot be empty.", {
        description: "Please enter a valid task description.",
      });
      return;
    }

    startTransition(() => {
      setOptimisticContent(newContent);
    });
    handleCancel();

    try {
      onTaskUpdate?.(task.id, newContent);
    } catch (error) {
      console.error("Failed to update task:", error);
      setOptimisticContent(task.content);
      alert("Une erreur inattendue est survenue.");
    }
  };

  const editContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tags prédéfinis avec couleurs
  const predefinedTags = [
    { name: "urgent", color: "bg-red-500" },
    { name: "important", color: "bg-orange-500" },
    { name: "bug", color: "bg-red-600" },
    { name: "feature", color: "bg-blue-500" },
    { name: "enhancement", color: "bg-green-500" },
    { name: "documentation", color: "bg-purple-500" },
    { name: "testing", color: "bg-yellow-700" },
    { name: "review", color: "bg-indigo-500" },
  ];

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddNewTag = () => {
    if (newTagName.trim() && !selectedTags.includes(newTagName.trim())) {
      setSelectedTags((prev) => [...prev, newTagName.trim()]);
      setNewTagName("");
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagName));
  };

  const handleSaveTags = async () => {
    try {
      startTransition(() => {
        setOptimisticTag(selectedTags);
      });

      setIsTagsDialogOpen(false);
      handleCancel();

      await boardStore?.handleTaskTagsUpdate(task.id, selectedTags);
      toast("Tags updated successfully!");
    } catch (error) {
      console.error("Error saving tags:", error);
      toast("Failed to update tags");
      // En cas d'erreur, on peut rétablir l'état précédent
      setOptimisticTag(task.tags || []);
    }
  };

  const getTagColor = (tagName: string) => {
    const predefined = predefinedTags.find((tag) => tag.name === tagName);
    return predefined?.color || "bg-gray-500";
  };

  return (
    <div
      suppressHydrationWarning
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex bg-muted border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-grab active:cursor-grabbing select-none group"
    >
      {!isEditing ? (
        <TooltipProvider>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium mb-2">
              {optimisticContent}
            </span>
            {optimisticTag && optimisticTag.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {optimisticTag.map((tag) => (
                  <Badge
                    key={tag}
                    onClick={() => {
                      setIsTagsDialogOpen(true);
                    }}
                    className={`${getTagColor(
                      tag
                    )} text-white cursor-pointer text-xs px-2 py-0.5`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleEdit}
                variant="ghost"
                className="size-5 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <Edit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Edit card</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div ref={editContainerRef} className="w-full">
          <Textarea
            ref={ref}
            defaultValue={optimisticContent}
            autoFocus
            className="text-sm font-medium w-full bg-transparent outline-none mb-2"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancel();
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div
            ref={containerRef}
            className="flex items-center gap-2 mt-1 px-1 py-1 bg-muted/40 rounded-lg border border-muted-foreground/10"
          >
            <Button
              onMouseDown={submit}
              disabled={isPending}
              className="px-4 py-1 h-8 text-sm font-semibold rounded-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <Save size={16} className="mr-1" />
              Save
            </Button>
            <Button
              variant="outline"
              size="icon"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              className="h-8 w-8 p-0 border-none hover:bg-destructive/10 hover:text-destructive transition"
              aria-label="Cancel"
            >
              <X size={16} />
            </Button>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded cursor-pointer hover:bg-primary/50 transition">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableColumns?.map((column) => (
                      <DropdownMenuItem
                        key={column.id}
                        onClick={() => {
                          onMoveTask?.(task.id, currentColumnId, column.id);
                          handleCancel();
                        }}
                      >
                        {column.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {hasPermission && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Assign to</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {boardStore?.board?.organization?.members
                        ?.filter((member) => member.user.id !== currentUserId)
                        .map((member) => (
                          <DropdownMenuItem key={member.id}>
                            <User className="mr-2" />
                            {member.user.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsTagsDialogOpen(true);
                  }}
                >
                  Edit tags
                  <DropdownMenuShortcut>
                    <Tags />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {hasPermission && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                    <DropdownMenuShortcut>
                      <Trash2 />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* delete dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete it ?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* tags dialog */}
      <Dialog open={isTagsDialogOpen} onOpenChange={setIsTagsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tags actuels */}
            {selectedTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Current Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      className={`${getTagColor(
                        tag
                      )} text-white hover:opacity-80 cursor-pointer`}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X size={12} className="ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags prédéfinis */}
            <div>
              <h4 className="text-sm font-medium mb-2">Available Tags</h4>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant={
                      selectedTags.includes(tag.name) ? "default" : "outline"
                    }
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag.name)
                        ? `${tag.color} text-white`
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.name) ? (
                      <X size={12} className="ml-1" />
                    ) : (
                      <Plus size={12} className="ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ajouter un nouveau tag */}
            <div>
              <h4 className="text-sm font-medium mb-2">Add New Tag</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNewTag}
                  disabled={
                    !newTagName.trim() ||
                    selectedTags.includes(newTagName.trim())
                  }
                  size="sm"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSaveTags}
              disabled={boardStore?.isUpdatingTaskTags}
            >
              {boardStore?.isUpdatingTaskTags ? "Saving..." : "Save Tags"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
