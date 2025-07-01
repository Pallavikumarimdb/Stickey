"use client";

import { useState } from "react";
import { Plus, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
interface InviteButtonProps {
  roomId: string;
  isOwner: boolean;
}

export const InviteButton = ({ roomId, isOwner }: InviteButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOwner) return null; // Only room owner can invite

  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/board/${roomId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: "Invite link copied!" });
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Invite members
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 bg-white rounded-md max-w-[500px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Invite to Room</h2>
          <div className="flex gap-2">
            <Input readOnly value={inviteLink} />
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this link with anyone to invite them to the canvas room. Unauthenticated users can join as guests.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
