"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";

interface AdvisorReplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
}

export function AdvisorReplyModal({
  open,
  onOpenChange,
  documentId,
  documentTitle,
}: AdvisorReplyModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("You must be logged in to send a message.");
      return;
    }
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    setIsSending(true);
    // Placeholder for sending message to advisor
    // In a real application, this would involve a Supabase function call or API route
    console.log(
      `Sending message for document ${documentId} (${documentTitle}): ${message}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    toast.success("Message sent to advisor!");
    setMessage("");
    onOpenChange(false);
    setIsSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reply to Advisor for &quot;{documentTitle}&quot;</DialogTitle>
          <DialogDescription>
            Send a message to your advisor regarding this document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending}>
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
