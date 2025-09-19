import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { User } from "lucide-react";
import { createServerSupabaseClient } from "@/integrations/supabase/server-client";

interface SharedDocumentPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function SharedDocumentPage({ params }: SharedDocumentPageProps) {
  try {
    const { documentId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: document, error } = await supabase
      .from("documents")
      .select("title, content, is_public, updated_at, profiles(first_name, last_name)")
      .eq("id", documentId)
      .single();

    if (error || !document || !document.is_public) {
      notFound();
    }

    const authorProfile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;
    const authorName = authorProfile 
      ? `${authorProfile.first_name || ''} ${authorProfile.last_name || ''}`.trim() 
      : "Anonymous";
    
    const lastUpdated = document.updated_at 
      ? format(new Date(document.updated_at), "MMMM d, yyyy")
      : "N/A";

    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{document.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-2 text-sm">
              <User className="h-4 w-4" />
              <span>By {authorName}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>Last updated on {lastUpdated}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content || "" }}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("SharedDocumentPage failed to render:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: SharedDocumentPageProps) {
  try {
    const { documentId } = await params;
    const supabase = createServerSupabaseClient();
    const { data: document } = await supabase
      .from("documents")
      .select("title")
      .eq("id", documentId)
      .single();
    
    return {
      title: `${document?.title || 'Shared Document'} | ThesisAI Philippines`,
    };
  } catch (error) {
    return {
      title: 'Shared Document | ThesisAI Philippines',
    };
  }
}