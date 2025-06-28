"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProject } from "server/project";

interface CreateProjectButtonProps {
  userId: string;
  disabled?: boolean;
}

export const CreateProjectButton = ({ userId, disabled }: CreateProjectButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    startTransition(async () => {
      try {
        const { success, error } = await createProject({ title: title.trim() });
        if (!success) {
          toast.error(error || "Failed to create project");
          return;
        }

        toast.success("Project created!");
        setOpen(false);
        setTitle("");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <>
      <button
        disabled={pending || disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "col-span-1 w-48 h-48 bg-gradient-to-b from-[#76Edb6] to-[#76E396] border border-[#76Edb6] shadow-[0_4px_8px_rgba(0,0,0,0.15)] rounded-[2px] flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.02]",
          (pending || disabled) && "opacity-75 hover:scale-100 cursor-not-allowed"
        )}
      >
        <Plus className="h-10 w-10 text-black stroke-1" />
        <p className="text-sm text-black font-medium mt-2">New Project</p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter board title"
            className="my-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={pending} onClick={handleCreate}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>

  );
};
