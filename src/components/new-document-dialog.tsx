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
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Check if user has premium access (Pro + Advisor or Pro Complete)
  const hasPremiumPlusAccess = profile && (
    profile.plan === 'pro_plus_advisor' ||
    profile.plan === 'pro_complete' ||
    profile.is_pro_user === true ||
    profile.role === 'admin'
  );

  // Check if user has Pro access (for Thesis Finalizer without AI)
  const hasProAccess = profile && (
    profile.plan === 'pro' ||
    profile.plan === 'pro_plus_advisor' ||
    profile.plan === 'pro_complete' ||
    profile.is_pro_user === true ||
    profile.role === 'admin'
  );

  // Include Thesis Finalizer template for Pro+ users and Thesis Finalizer Pro for Pro users
  const allTemplates = [...documentTemplates];
  if (hasProAccess) {
    if (hasPremiumPlusAccess) {
      // Pro + Advisor or Pro Complete gets Thesis Finalizer Pro+
      allTemplates.push({
        title: "Thesis Finalizer Pro +",
        description: "Complete thesis with multi-agent AI processing and advisor integration.",
        content: JSON.stringify({ type: "doc", content: [] }),
      });
    } else {
      // Pro users get Thesis Finalizer Pro (without AI)
      allTemplates.push({
        title: "Thesis Finalizer Pro",
        description: "Complete thesis with manual editing tools.",
        content: JSON.stringify({ type: "doc", content: [] }),
      });
    }
  }

  const handleCreateDocument = async (template: (typeof allTemplates)[0]) => {
    if (!user) {
      toast.error("You must be logged in to create a document.");
      return;
    }

    if (!session?.access_token) {
      toast.error("Authentication token not available.");
      console.error("No access token in session");
      return;
    }

    setIsCreating(template.title);

    // Quick health check of the API
    try {
      const healthCheck = await fetch("/api/documents/health");
      if (!healthCheck.ok) {
        console.warn("[Document Creation] Health check returned status:", healthCheck.status);
      } else {
        const healthData = await healthCheck.json();
        console.log("[Document Creation] API health check:", healthData);
      }
    } catch (healthErr) {
      console.warn("[Document Creation] Health check failed:", healthErr);
    }

    // Test auth with server
    try {
      const authTest = await fetch("/api/auth-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
      });
      const authTestData = await authTest.json();
      console.log("[Document Creation] Auth test result:", {
        status: authTest.status,
        ok: authTest.ok,
        ...authTestData,
      });
      if (authTestData.error) {
        console.warn("[Document Creation] Auth test failed:", authTestData.error);
      }
    } catch (authErr) {
      console.warn("[Document Creation] Auth test request failed:", authErr);
    }

    try {
      // Log the user info for debugging
      console.log("[Document Creation] User ID:", user.id);
      console.log("[Document Creation] Template:", template.title);
      console.log("[Document Creation] Session token present:", !!session?.access_token);

      // Use API route for document creation (server-side handles Supabase operations)
      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: template.title,
          content: JSON.stringify({ type: "doc", content: [] }),
        }),
      });

      console.log("[Document Creation] Response status:", response.status);
      console.log("[Document Creation] Response OK:", response.ok);
      console.log("[Document Creation] Response content-type:", response.headers.get("content-type"));

      // Try to parse the response as JSON
      let result: any = {};
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("[Document Creation] Raw response text:", responseText);
        console.log("[Document Creation] Response text length:", responseText.length);
        
        if (responseText && responseText.trim()) {
          result = JSON.parse(responseText);
          console.log("[Document Creation] Parsed response:", result);
          console.log("[Document Creation] Result keys:", Object.keys(result));
        } else {
          console.error("[Document Creation] Empty response body");
          result = { error: "Empty response body" };
        }
      } catch (parseErr: any) {
        console.error("[Document Creation] Failed to parse response:", parseErr);
        console.error("[Document Creation] Parse error message:", parseErr?.message);
        result = { error: `Failed to parse response: ${parseErr?.message}` };
      }

      if (!response.ok) {
        const errorMessage = result?.error || `Failed to create document (Status: ${response.status})`;
        toast.error(errorMessage);
        
        // Log with clear separation
        console.error("=== DOCUMENT CREATION FAILED ===");
        console.error("HTTP Status Code: " + response.status);
        const error = result?.error;
        const details = result?.details;
        const code = result?.code;
        const hint = result?.hint;
        console.error("Error Message: " + error);
        console.error("Details: " + details);
        console.error("Code: " + code);
        console.error("Hint: " + hint);
        
        // Store in window for easy access
        (window as any).lastDocError = {
          status: response.status,
          error,
          details,
          code,
          hint,
          result
        };
        console.log("Full error object stored in window.lastDocError");
        console.log("Type 'window.lastDocError' in console to view");
        console.error("===== END ERROR =====");
        
        setIsCreating(null);
        return;
      }

      if (result?.documentId) {
        toast.success("New document created!");
        setOpen(false);
        router.push(`/drafts/${result.documentId}`);
      } else {
        const errorMsg = result?.error || "Document created but no ID returned.";
        toast.error(errorMsg);
        console.error("No document ID in response:", {
          result,
          success: result?.success,
        });
        setIsCreating(null);
      }
    } catch (err: any) {
      toast.error("Failed to create a new document.");
      console.error("Document creation error:", err);
      console.error("Error message:", err?.message);
      console.error("Error type:", err?.name);
      setIsCreating(null);
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
          {allTemplates.map((template) => (
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