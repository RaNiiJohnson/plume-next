"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { removeMember } from "../members/member.action";
import { Member } from "@/generated/prisma";

type MemberWithUser = Member & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export function RemoveMemberDialog({ member }: { member: MemberWithUser }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await removeMember(member);

      if (!success) {
        toast.error(error || "Failed to remove member");
        return;
      }

      toast.success("Member removed successfully");
      setOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Remove from workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">{member.user.name}</span> from this
            workspace? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
