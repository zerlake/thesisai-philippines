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
import { documentTemplates } from "@/lib/document-templates";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function NewDocumentDialog({ children }: { children: React.ReactNode }) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreateDocument = async (template: { title: string; content: string }) => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: template.title === "Blank Document" ? "Untitled Document" : template.title,
        content: template.content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create document.");
      console.error(error);
    } else if (data) {
      toast.success("Document created!");
      router.push(`/drafts/${data.id}`);
      setOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Document</DialogTitle>
          <DialogDescription>
            Start from scratch or use a template to get a head start.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            {documentTemplates.map((template) => (
              <Card
                key={template.title}
                className="cursor-pointer hover:border-primary"
                onClick={() => handleCreateDocument(template)}
              >
                <CardHeader>
                  <CardTitle>{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}