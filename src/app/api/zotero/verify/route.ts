import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Zod schema for request validation
const zoteroRequestSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

// Define types for Zotero API response
interface ZoteroLibrary {
  id: number;
  name: string;
  type: 'user' | 'group';
  version: number;
}

interface ZoteroResponse {
  data: ZoteroLibrary[];
  totalResults: number;
  links: {
    next?: string;
    last?: string;
  };
}

// Main handler for the API route
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = zoteroRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { apiKey } = validationResult.data;

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Verify the Zotero API key by making a test request
    const testResponse = await fetch(`https://api.zotero.org/users/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Zotero-API-Version': '3',
      }
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      return Response.json(
        { 
          error: 'Invalid or expired Zotero API key',
          details: errorData
        },
        { status: testResponse.status }
      );
    }

    // Fetch user's libraries from Zotero
    const librariesResponse = await fetch(`https://api.zotero.org/users/me/libraries`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Zotero-API-Version': '3',
      }
    });

    if (!librariesResponse.ok) {
      const errorData = await librariesResponse.json().catch(() => ({}));
      return Response.json(
        { 
          error: 'Failed to fetch Zotero libraries',
          details: errorData  
        },
        { status: librariesResponse.status }
      );
    }

    const zoteroLibraries: ZoteroLibrary[] = await librariesResponse.json();

    // Transform Zotero libraries to our format
    const transformedLibraries = zoteroLibraries.map(lib => ({
      id: lib.id,
      name: lib.name,
      type: lib.type,
      itemCount: 0, // We'll fetch item counts separately if needed
      selected: true, // Default to selected
    }));

    // Log the successful API key verification
    await supabase
      .from('citation_imports')
      .insert({
        user_id: user.id,
        source: 'zotero',
        status: 'verified',
        metadata: {
          libraries_count: transformedLibraries.length,
          verified_at: new Date().toISOString()
        }
      });

    return Response.json({ 
      success: true, 
      libraries: transformedLibraries,
      totalLibraries: transformedLibraries.length
    });

  } catch (error) {
    console.error('Error in Zotero API verification:', error);
    
    // Log error for debugging (in production, you might send this to an error tracking service)
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return Response.json(
      { error: 'Internal server error during Zotero API verification' },
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

    const items = await itemsResponse.json();

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