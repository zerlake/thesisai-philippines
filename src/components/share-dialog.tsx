"use client";

import { Copy, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useState } from "react";
import { useAuth } from "./auth-provider";

interface ShareDialogProps {
  children: React.ReactNode;
  documentId: string;
  isPublic: boolean;
}

export function ShareDialog({ children, documentId, isPublic: initialIsPublic }: ShareDialogProps) {
  const { supabase } = useAuth();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const shareLink = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${documentId}` 
    : "";

  const handleCopy = () => {
    if (!isPublic) {
      toast.warning("You must make the document public to share the link.");
      return;
    }
    navigator.clipboard.writeText(shareLink);
    toast.success("Public link copied to clipboard!");
  };

  const handlePublicToggle = async (checked: boolean) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("documents")
      .update({ is_public: checked })
      .eq("id", documentId);

    if (error) {
      toast.error("Failed to update document status.");
      console.error(error);
    } else {
      setIsPublic(checked);
      toast.success(`Document is now ${checked ? "public" : "private"}.`);
    }
    setIsUpdating(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Toggle the switch to make your document public and share the link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <Label htmlFor="public-switch" className="flex-1 font-medium">
            Share publicly
          </Label>
          <Switch
            id="public-switch"
            checked={isPublic}
            onCheckedChange={handlePublicToggle}
            disabled={isUpdating}
          />
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={shareLink} readOnly disabled={!isPublic} />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy} disabled={!isPublic}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}