'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { FilePlus2, FileText, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewDocumentDialog } from './new-document-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Document = {
  id: string;
  title: string | null;
  updated_at: string;
  created_at: string;
};

const FREE_PLAN_DOCUMENT_LIMIT = 3;

export function NewDocumentList() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string | null } | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isMounted, setIsMounted] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const lastSearchTermRef = useRef<string>('');

  const isFreePlan = profile?.plan === 'free';
  const atLimit = isFreePlan && docCount >= FREE_PLAN_DOCUMENT_LIMIT;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoized fetch function
  const fetchDocuments = useCallback(async (userId: string, searchQuery: string) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // Only show loading on initial fetch, not on search updates
    if (!hasFetched) {
      setIsLoading(true);
    }

    try {
      let query = supabase
        .from('documents')
        .select('id, title, updated_at, created_at', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error('Failed to fetch documents.');
        console.error(error);
      } else {
        setDocuments(data || []);
        setDocCount(count || 0);
      }
    } finally {
      setIsLoading(false);
      setHasFetched(true);
      fetchingRef.current = false;
    }
  }, [supabase, hasFetched]);

  // Load documents - only when user ID or search term actually changes
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Check if we actually need to fetch (user or search changed)
    const userChanged = lastUserIdRef.current !== user.id;
    const searchChanged = lastSearchTermRef.current !== debouncedSearchTerm;

    if (!userChanged && !searchChanged && hasFetched) {
      return;
    }

    lastUserIdRef.current = user.id;
    lastSearchTermRef.current = debouncedSearchTerm;

    fetchDocuments(user.id, debouncedSearchTerm);
  }, [user?.id, debouncedSearchTerm, fetchDocuments, hasFetched]);

  const handleDeleteDocument = async () => {
    if (!docToDelete?.id || !user) return;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docToDelete.id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete document.');
      console.error(error);
    } else {
      setDocuments(documents.filter(doc => doc.id !== docToDelete.id));
      setDocCount(prev => Math.max(0, prev - 1));
      toast.success('Document deleted.');
    }
    
    setDeleteDialogOpen(false);
    setDocToDelete(null);
  };

  const handleNewDocumentClick = () => {
    if (atLimit) {
      toast.error('You\'ve reached the 3-document limit for the Free plan.', {
        description: 'Please upgrade to create unlimited documents.',
        action: {
          label: 'Upgrade',
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
            {isFreePlan 
              ? `You have created ${docCount} of ${FREE_PLAN_DOCUMENT_LIMIT} documents.` 
              : 'Create, manage, and edit your documents.'}
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
            <Card key={doc.id} className="flex flex-col transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start">
                  <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDocToDelete({ id: doc.id, title: doc.title });
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="truncate">
                  {doc.title || "Untitled Document"}
                </CardTitle>
                <CardDescription className="mt-2">
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
          {!atLimit && (
            <NewDocumentDialog>
              <Button>
                <FilePlus2 className="w-4 h-4 mr-2" />
                Create New Document
              </Button>
            </NewDocumentDialog>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && docToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Document</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete &quot;{docToDelete.title || "Untitled Document"}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDocToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteDocument}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}