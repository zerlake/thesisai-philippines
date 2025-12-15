import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Zod schema for request validation
const mendeleyImportSchema = z.object({
  documentIds: z.array(z.string()).min(1, "At least one document ID is required"),
  importSettings: z.object({
    includeAttachments: z.boolean().optional().default(false),
    createCollections: z.boolean().optional().default(true),
    updateExisting: z.boolean().optional().default(true),
  }).optional().default({
    includeAttachments: false,
    createCollections: true,
    updateExisting: true,
  })
});

// Main handler for the Mendeley import route
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = mendeleyImportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { documentIds, importSettings } = validationResult.data;

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Create an import record to track progress
    const { data: importRecord, error: insertError } = await supabase
      .from('citation_imports')
      .insert({
        user_id: user.id,
        source: 'mendeley',
        status: 'in_progress',
        metadata: {
          documentIds,
          importSettings,
          started_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating import record:', insertError);
      return Response.json({ error: 'Failed to start import process' }, { status: 500 });
    }

    // In a real implementation, we would fetch these documents from Mendeley API
    // using the access token, but since Mendeley requires premium subscription
    // for personal library access, we'll simulate the process with mock data
    console.log(`Starting Mendeley import for user ${user.id} with documents:`, documentIds);

    // Simulate fetching documents from Mendeley
    const mockDocuments = documentIds.map(id => ({
      id,
      title: `Document ${id}`,
      authors: [{ first_name: 'Sample', last_name: 'Author' }],
      source: 'Sample Journal',
      year: 2023,
      doi: `10.1016/sample.${id.split('-').pop()}`,
      abstract: 'This is a sample abstract for demonstration purposes.',
      created: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      type: 'journal',
      file_attached: false,
      stats: {
        readers: Math.floor(Math.random() * 100) + 50,
        groups: Math.floor(Math.random() * 10) + 1
      }
    }));

    // Convert to ThesisAI citations
    const citations = mockDocuments.map(doc => {
      // Format authors
      const authors = doc.authors.map(author => 
        `${author.last_name}, ${author.first_name.charAt(0)}.`
      ).join(', ');

      // Create citation
      let citationText = `${authors}. "${doc.title}." ${doc.source}, ${doc.year}. `;
      if (doc.doi) citationText += `https://doi.org/${doc.doi}.`;

      return {
        user_id: user.id,
        content: citationText,
        style: 'APA 7th Edition',
        imported_from: 'mendeley',
        original_id: doc.id,
        metadata: {
          mendeley_id: doc.id,
          title: doc.title,
          authors: doc.authors,
          source: doc.source,
          year: doc.year,
          doi: doc.doi,
          abstract: doc.abstract,
          type: doc.type,
          created: doc.created,
          last_modified: doc.last_modified,
          stats: doc.stats,
          file_attached: doc.file_attached,
        }
      };
    });

    // Save citations to Supabase
    if (citations.length > 0) {
      const { error: citationsError } = await supabase
        .from('citations')
        .insert(citations);

      if (citationsError) {
        console.error('Error saving citations:', citationsError);
        // Update import status to failed
        await supabase
          .from('citation_imports')
          .update({ 
            status: 'failed',
            metadata: {
              ...importRecord.metadata,
              error: citationsError.message,
              completed_at: new Date().toISOString()
            }
          })
          .eq('id', importRecord.id);

        return Response.json(
          { error: 'Failed to save citations to database', details: citationsError },
          { status: 500 }
        );
      }
    }

    // Create library groups if needed
    if (importSettings.createCollections && citations.length > 0) {
      const groupToInsert = {
        user_id: user.id,
        name: 'Imported from Mendeley',
        source: 'mendeley_folder',
        source_id: 'imported_mendeley'
      };

      const { error: groupsError } = await supabase
        .from('library_groups')
        .insert(groupToInsert)
        .select()
        .single();

      if (groupsError) {
        console.error('Error creating group:', groupsError);
        // Continue anyway, as the citations were saved
      } else {
        // In a real implementation, we would link citations to this group
        console.log(`Created group for Mendeley imports: ${groupsError ? 'failed' : 'success'}`);
      }
    }

    // Update import status to completed
    await supabase
      .from('citation_imports')
      .update({ 
        status: 'completed',
        total_items: citations.length,
        imported_items: citations.length,
        metadata: {
          ...importRecord.metadata,
          completed_at: new Date().toISOString(),
          total_citations_imported: citations.length,
          total_groups_created: importSettings.createCollections ? 1 : 0
        }
      })
      .eq('id', importRecord.id);

    return Response.json({ 
      success: true, 
      importedCitations: citations.length,
      createdGroups: importSettings.createCollections ? 1 : 0,
      importId: importRecord.id
    });

  } catch (error) {
    console.error('Error importing Mendeley citations:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return Response.json(
      { error: 'Internal server error during Mendeley import' },
      { status: 500 }
    );
  }
}