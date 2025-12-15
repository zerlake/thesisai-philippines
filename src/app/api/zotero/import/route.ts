import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { 
  convertZoteroItemsToCitations, 
  ZoteroItem,
  ThesisAICitation,
  mapZoteroItemType,
  normalizeCreators,
  extractTags,
  formatDate
} from '@/lib/zotero-converter';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Zod schema for request validation
const importRequestSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  libraryIds: z.array(z.number()).min(1, "At least one library ID is required"),
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

// Main handler for the import route
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = importRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { apiKey, libraryIds, importSettings } = validationResult.data;

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
        source: 'zotero',
        status: 'in_progress',
        metadata: {
          libraryIds,
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

    // Process each library
    const allCitations: ThesisAICitation[] = [];
    const allGroups: Array<{name: string, source_id: string}> = [];

    for (const libraryId of libraryIds) {
      // Fetch items from this library
      const itemsResponse = await fetch(
        `https://api.zotero.org/${libraryId}/items?limit=100&format=json`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Zotero-API-Version': '3',
          }
        }
      );

      if (!itemsResponse.ok) {
        console.error(`Failed to fetch items from library ${libraryId}`);
        continue; // Skip this library and continue with others
      }

      const zoteroItems: ZoteroItem[] = await itemsResponse.json();

      // Process each item and convert to ThesisAI format
      for (const item of zoteroItems) {
        // Skip if this is not a citation-type item
        if (['attachment', 'note', 'annotation'].includes(item.itemType)) {
          continue;
        }

        // Create a ThesisAI citation from Zotero item
        const convertedCitations = convertZoteroItemsToCitations([item], user.id);
        allCitations.push(...convertedCitations);

        // Collect collections for group creation
        if (item.collections && importSettings.createCollections) {
          for (const collectionKey of item.collections) {
            // In a real implementation, we would fetch collection details separately
            // For now, we'll just store the collection key
            if (!allGroups.some(g => g.source_id === collectionKey)) {
              allGroups.push({
                name: `Zotero Collection: ${collectionKey}`,
                source_id: collectionKey
              });
            }
          }
        }
      }
    }

    // Save all citations to Supabase
    if (allCitations.length > 0) {
      const { error: citationsError } = await supabase
        .from('citations')
        .insert(allCitations);

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
    if (allGroups.length > 0) {
      const groupsToInsert = allGroups.map(group => ({
        user_id: user.id,
        name: group.name,
        source: 'zotero_collection',
        source_id: group.source_id
      }));

      const { error: groupsError } = await supabase
        .from('library_groups')
        .insert(groupsToInsert)
        .select();

      if (groupsError) {
        console.error('Error creating groups:', groupsError);
        // Continue anyway, as the citations were saved
      } else {
        // Link citations to groups (this would require matching the collections from Zotero items)
        // Implementation would involve looking up group IDs and linking to citations
      }
    }

    // Update import status to completed
    await supabase
      .from('citation_imports')
      .update({ 
        status: 'completed',
        total_items: allCitations.length,
        imported_items: allCitations.length,
        metadata: {
          ...importRecord.metadata,
          completed_at: new Date().toISOString(),
          total_citations_imported: allCitations.length,
          total_groups_created: allGroups.length
        }
      })
      .eq('id', importRecord.id);

    return Response.json({ 
      success: true, 
      importedCitations: allCitations.length,
      createdGroups: allGroups.length,
      importId: importRecord.id
    });

  } catch (error) {
    console.error('Error importing Zotero citations:', error);
    
    // Try to update the import record to show failure
    // Note: In a real implementation, we'd need to pass importRecord.id from the beginning
    // This is simplified for this implementation

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return Response.json(
      { error: 'Internal server error during Zotero import' },
      { status: 500 }
    );
  }
}

// GET handler to fetch library items (will be used during import)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const libraryId = searchParams.get('libraryId');
    const limit = searchParams.get('limit') || '100';
    const start = searchParams.get('start') || '0';

    if (!apiKey || !libraryId) {
      return Response.json({ error: 'API key and library ID required' }, { status: 400 });
    }

    // Verify the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch items from the specified library
    const itemsResponse = await fetch(
      `https://api.zotero.org/${libraryId}/items?limit=${limit}&start=${start}&format=json`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Zotero-API-Version': '3',
        }
      }
    );

    if (!itemsResponse.ok) {
      const errorData = await itemsResponse.json().catch(() => ({}));
      return Response.json(
        { 
          error: 'Failed to fetch Zotero library items',
          details: errorData  
        },
        { status: itemsResponse.status }
      );
    }

    const items: ZoteroItem[] = await itemsResponse.json();

    return Response.json({ 
      success: true,
      items,
      totalItems: itemsResponse.headers.get('Total-Results') || items.length
    });

  } catch (error) {
    console.error('Error fetching Zotero library items:', error);
    return Response.json(
      { error: 'Internal server error during Zotero library fetch' },
      { status: 500 }
    );
  }
}