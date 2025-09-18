"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface ShareDialogProps {
  children: React.ReactNode;
  documentId: string;
  isPublic: boolean;
}

export function ShareDialog({ children, documentId, isPublic: initialIsPublic }: ShareDialogProps) {
  const { supabase } = useAuth();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const shareUrl = `${window.location.origin}/share/${documentId}`;

  const handlePublicToggle = async (checked: boolean) => {
    setIsPublic(checked);
    const { error } = await supabase
      .from("documents")
      .update({ is_public: checked })
      .eq("id", documentId);

    if (error) {
      toast.error("Failed to update sharing settings.");
      setIsPublic(!checked); // Revert on error
    } else {
      toast.success(`Document is now ${checked ? "public" : "private"}.`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this document if you make it public.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch id="public-switch" checked={isPublic} onCheckedChange={handlePublicToggle} />
            <Label htmlFor="public-switch">Make Public</Label>
          </div>
          {isPublic && (
            <div className="relative">
              <Input value={shareUrl} readOnly />
              <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}