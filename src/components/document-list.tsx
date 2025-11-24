"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { FilePlus2, FileText, MoreVertical, Search, Trash2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { NewDocumentDialog } from "./new-document-dialog";
import { Input } from "./ui/input";
import { useDebounce } from "../hooks/use-debounce";
import { useRouter } from "next/navigation";

type Document = {
  id: string;
  title: string | null;
  updated_at: string;
};

const FREE_PLAN_DOCUMENT_LIMIT = 3;

export function DocumentList() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isMounted, setIsMounted] = useState(false);

  const isFreePlan = profile?.plan === 'free';
  const atLimit = isFreePlan && docCount >= FREE_PLAN_DOCUMENT_LIMIT;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchDocuments = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from("documents")
        .select("id, title, updated_at", { count: 'exact' })
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (debouncedSearchTerm) {
        query = query.ilike("title", `%${debouncedSearchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error("Failed to fetch documents.");
        console.error(error);
      } else {
        setDocuments(data || []);
        setDocCount(count || 0);
      }
      setIsLoading(false);
    };

    fetchDocuments();
  }, [user, supabase, debouncedSearchTerm]);

  const handleDeleteDocument = async () => {
    if (!docToDelete || !user) return;

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docToDelete)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete document.");
      console.error(error);
    } else {
      setDocuments(documents.filter((doc) => doc.id !== docToDelete));
      setDocCount(prev => prev - 1);
      toast.success("Document deleted.");
    }
    setDocToDelete(null);
  };

  const handleNewDocumentClick = () => {
    if (atLimit) {
      toast.error("You've reached the 3-document limit for the Free plan.", {
        description: "Please upgrade to create unlimited documents.",
        action: {
          label: "Upgrade",
          onClick: () => router.push('/settings/billing'),
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Drafts</h1>
          <p className="text-muted-foreground">
            {isFreePlan ? `You have created ${docCount} of ${FREE_PLAN_DOCUMENT_LIMIT} documents.` : 'Create, manage, and edit your documents.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title..."
              className="pl-8 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {atLimit ? (
            <Button onClick={handleNewDocumentClick}>
              <FilePlus2 className="w-4 h-4 mr-2" />
              New Document
            </Button>
          ) : (
            <NewDocumentDialog>
              <Button>
                <FilePlus2 className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </NewDocumentDialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start">
                  <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-500"
                        onSelect={() => setDocToDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle>{doc.title || "Untitled Document"}</CardTitle>
                <CardDescription>
                  Updated{" "}
                  {isMounted && formatDistanceToNow(new Date(doc.updated_at), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/drafts/${doc.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Open
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {debouncedSearchTerm ? "No Matching Documents" : "Your Workspace Awaits"}
          </h3>
          <p className="mt-2 mb-4 text-sm text-muted-foreground max-w-xs">
            {debouncedSearchTerm
              ? "No drafts found for that search. Try another keyword!"
              : "Every great paper begins with a single page. Let's get started."}
          </p>
        </div>
      )}

      <AlertDialog
        open={!!docToDelete}
        onOpenChange={() => setDocToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}