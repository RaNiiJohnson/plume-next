"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTaskMutation } from "@app/board/[boardId]/_hooks/useBoardQueries";
import clsx from "clsx";
import { Save } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

interface TaskDescriptionProps {
  taskId: string;
  boardId: string;
  initialDescription: string;
}

export function TaskDescription({
  taskId,
  boardId,
  initialDescription,
}: TaskDescriptionProps) {
  const [, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(!initialDescription);
  const [tempDescription, setTempDescription] = useState(initialDescription);

  // useOptimistic pour gérer la description
  const [optimisticDescription, setOptimisticDescription] = useOptimistic(
    initialDescription,
    (_, newDescription: string) => newDescription
  );

  const updateTask = useUpdateTaskMutation(boardId);

  const handleSave = async () => {
    if (!tempDescription.trim()) return;

    setIsEditing(false);

    // Mise à jour optimiste
    startTransition(() => {
      setOptimisticDescription(tempDescription);
    });

    try {
      await updateTask.mutateAsync({
        taskId,
        description: tempDescription,
      });
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      startTransition(() => {
        setOptimisticDescription(initialDescription);
      });
      setIsEditing(true);
      console.error("Error updating description:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempDescription(optimisticDescription);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempDescription(optimisticDescription);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
        Description
      </h3>

      {!optimisticDescription || isEditing ? (
        <>
          <Textarea
            placeholder="Add a more detailed description..."
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
          />
          <div
            className={clsx("flex gap-2 justify-end", {
              hidden: !tempDescription.trim(),
            })}
          >
            <Button
              onClick={handleSave}
              disabled={updateTask.isPending || !tempDescription.trim()}
            >
              <Save />
              {updateTask.isPending ? "Saving..." : "Save"}
            </Button>
            {optimisticDescription && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="group flex bg-muted/20 rounded-lg p-4 text-sm">
          <div className="text-secondary-foreground/70 whitespace-pre-wrap">
            {optimisticDescription}
          </div>
          <div className="flex-1"></div>
          <div className="opacity-0 group-hover:opacity-100 cursor-pointer items-start">
            <Button onClick={handleEdit} variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
