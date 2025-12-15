'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { DEMO_DOCUMENTS } from '@/lib/seed-demo-documents';

export default function TestSampleDataPage() {
  const { session, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  if (!session?.user?.id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in first to seed documents.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSeedDocuments = async () => {
    setLoading(true);
    try {
      console.log('Seeding documents for user:', session.user.id);

      // Prepare documents to insert
      const documentsToInsert = DEMO_DOCUMENTS.map((doc, index) => ({
        user_id: session.user.id,
        title: doc.title,
        content: doc.content,
        status: index === 0 ? 'submitted' : 'draft',
        created_at: new Date(Date.now() - (2 - index) * 86400000).toISOString(),
        updated_at: new Date(Date.now() - (2 - index) * 43200000).toISOString(),
      }));

      console.log('Inserting documents:', documentsToInsert.length);

      // Upsert documents to avoid errors on re-seeding
      const { data: upsertedDocs, error: upsertError } = await supabase
        .from('documents')
        .upsert(documentsToInsert, { onConflict: 'user_id,title' })
        .select('id, title, status');

      if (upsertError) {
        console.error('Upsert error details:', JSON.stringify(upsertError, null, 2));
        const errorMessage = upsertError.message || 'An unknown error occurred. See console for details.';
        toast.error(`Failed to seed documents: ${errorMessage}`);
        return;
      }

      console.log('Documents upserted:', upsertedDocs);
      toast.success(`✓ Successfully seeded/updated ${upsertedDocs?.length || 0} documents`);
      
      // Wait a moment then check
      setTimeout(() => {
        checkDocuments();
      }, 500);
    } catch (error) {
      toast.error('Error seeding documents');
      console.error('Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDocuments = async () => {
    setChecking(true);
    try {
      console.log('Checking documents for user:', session.user.id);
      
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, status, created_at, updated_at, content')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (docsError) {
        const errorMsg = docsError?.message || JSON.stringify(docsError);
        console.error('Fetch error:', errorMsg, docsError);
        toast.error(`Failed to fetch: ${errorMsg}`);
        return;
      }

      console.log('Found documents:', docs?.length);

      const formattedDocs = (docs || []).map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        hasContent: !!d.content,
        contentLength: d.content?.length || 0,
        created_at: d.created_at,
        updated_at: d.updated_at
      }));

      setDocuments(formattedDocs);
      if (formattedDocs.length > 0) {
        toast.success(`Found ${formattedDocs.length} documents`);
      } else {
        toast.info('No documents found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Error: ${errorMsg}`);
      console.error('Exception:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleViewInDrafts = () => {
    window.location.href = '/drafts';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test Sample Data</h1>
        <p className="text-muted-foreground">Seed and verify demo documents for testing</p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="font-semibold">Email:</span> {session?.user?.email}
          </p>
          <p className="text-sm">
            <span className="font-semibold">User ID:</span> {session?.user?.id}
          </p>
        </CardContent>
      </Card>

      {/* Seeding Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Seed Documents</CardTitle>
          <CardDescription>Insert sample documents for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click "Seed Documents" to add sample chapters to your account. You'll then see them in your /drafts.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleSeedDocuments}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Seeding...' : 'Seed Documents'}
            </Button>
            <Button
              onClick={checkDocuments}
              variant="outline"
              disabled={checking}
              className="flex-1"
            >
              {checking ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Results */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents Found ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="border rounded p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">ID: {doc.id}</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm">
                  Content: {doc.hasContent ? '✓ Present' : '✗ Missing'} ({doc.contentLength} chars)
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(doc.created_at).toLocaleString()}
                </p>
              </div>
            ))}

            <Button
              onClick={handleViewInDrafts}
              className="w-full"
            >
              View Documents in Drafts
            </Button>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && !checking && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Click "Seed Documents" to create sample data, then "Check Status" to verify.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              <span className="font-semibold">Seed:</span> Click "Seed Documents" to insert sample documents
            </li>
            <li>
              <span className="font-semibold">Verify:</span> Click "Check Status" to see what was created
            </li>
            <li>
              <span className="font-semibold">View:</span> Click "View Documents in Drafts" or navigate to /drafts
            </li>
            <li>
              <span className="font-semibold">Open:</span> Click "Open" on "Chapter 2 - Literature Review"
            </li>
            <li>
              <span className="font-semibold">Test:</span> Verify the editor shows content with "Literature Review" section
            </li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-xs">
            <p className="font-semibold mb-1">Demo Accounts:</p>
            <p>student@demo.thesisai.local</p>
            <p>advisor@demo.thesisai.local</p>
            <p>critic@demo.thesisai.local</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
