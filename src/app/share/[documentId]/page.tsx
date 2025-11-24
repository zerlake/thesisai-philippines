import { notFound } from "next/dist/client/components/not-found";
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

     const safeDocument = document as NonNullable<typeof document>;
     const authorProfile = Array.isArray(safeDocument.profiles) ? safeDocument.profiles[0] : safeDocument.profiles;
     const authorName = authorProfile 
       ? `${(authorProfile as any).first_name || ''} ${(authorProfile as any).last_name || ''}`.trim() 
       : "Anonymous";
     
     const lastUpdated = safeDocument.updated_at 
       ? format(new Date(safeDocument.updated_at), "MMMM d, yyyy")
       : "N/A";

    return (
       <div className="max-w-4xl mx-auto">
         <Card>
           <CardHeader>
             <CardTitle className="text-3xl font-bold">{safeDocument.title}</CardTitle>
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
               dangerouslySetInnerHTML={{ __html: safeDocument.content || "" }}
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
      metadataBase: new URL("https://thesisai-philippines.vercel.app"),
      title: `${document?.title || 'Shared Document'} | ThesisAI Philippines`,
    };
  } catch {
    return {
      metadataBase: new URL("https://thesisai-philippines.vercel.app"),
      title: 'Shared Document | ThesisAI Philippines',
    };
  }
}