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
import { documentTemplates } from "../lib/document-templates";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface NewDocumentDialogProps {
  children: React.ReactNode;
}

export function NewDocumentDialog({ children }: NewDocumentDialogProps) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCreateDocument = async (template: (typeof documentTemplates)[0]) => {
    if (!user) return;
    setIsCreating(template.title);

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: template.title,
        content: template.content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create a new document.");
      console.error(error);
      setIsCreating(null);
    } else if (newDoc) {
      toast.success("New document created!");
      setOpen(false);
      router.push(`/drafts/${newDoc.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Document</DialogTitle>
          <DialogDescription>
            Start from scratch or use a template to get going faster.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {documentTemplates.map((template) => (
            <Card
              key={template.title}
              className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onClick={() => !isCreating && handleCreateDocument(template)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isCreating === template.title && <Loader2 className="h-4 w-4 animate-spin" />}
                  {template.title}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}