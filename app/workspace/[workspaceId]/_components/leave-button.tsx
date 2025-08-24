"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { leaveWorkspace } from "../_actions/worskpace.actions";

type LeaveButtonProps = {
  organizationId: string;
  organizationName?: string;
};

export function LeaveButton({
  organizationId,
  organizationName,
}: LeaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    setIsLoading(true);

    try {
      await leaveWorkspace(organizationId);
      // Redirect to dashboard or home page
      router.push("/");
    } catch (error) {
      toast.error("An error occurred while leaving the workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <LogOut className="w-4 h-4" />
          Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave{" "}
            <span className="text-primary">
              {organizationName ? `"${organizationName}"` : "this workspace"} ?
            </span>
            <br />
            You will lose access to all boards and data in this workspace.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={handleLeave}
          >
            {isLoading ? "Leaving..." : "Leave Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
