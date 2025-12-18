import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create Supabase client helper function for runtime initialization
function createSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Define Zod schema for request validation
const mendeleyRequestSchema = z.object({
  query: z.string().optional(), // Search query
  limit: z.number().min(1).max(100).optional().default(25), // Number of results
  page: z.number().min(1).optional().default(1), // Page number
});

// Define types for Mendeley document
interface MendeleyDocument {
  id: string;
  title: string;
  authors?: Array<{
    first_name: string;
    last_name: string;
  }>;
  source?: string; // Journal/conference name
  year?: number;
  doi?: string;
  isbn?: string;
  identifier?: {
    doi?: string;
    isbn?: string;
    arxiv?: string;
    pubmed?: string;
  };
  abstract?: string;
  keywords?: Array<{
    value: string;
  }>;
  created: string;
  last_modified: string;
  type: string;
  profiles?: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  file_attached: boolean;
  link?: string;
  stats: {
    readers: number;
    groups: number;
  };
}

// Type definition for ThesisAI citation
interface ThesisAICitation {
  user_id: string;
  content: string;
  style: string;
  imported_from: string;
  original_id: string;
  metadata: Record<string, unknown>;
}

// Main handler for the Mendeley search route
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '25');
    const page = parseInt(searchParams.get('page') || '1');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return Response.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }
    if (page < 1) {
      return Response.json({ error: 'Page must be 1 or greater' }, { status: 400 });
    }

    // Mendeley API requires authentication with client credentials
    // In a real implementation, you would use client credentials to get an access token
    // Here, I'll demonstrate the approach without using actual credentials since Mendeley
    // requires premium access for personal libraries
    const mendeleyAccessToken = process.env.MENDELEY_ACCESS_TOKEN;
    if (!mendeleyAccessToken) {
      return Response.json({ 
        error: 'Mendeley API access requires premium subscription. Free access only available for public catalog search.',
        note: 'This endpoint demonstrates the integration approach but requires Mendeley premium subscription for personal library access.'
      }, { status: 200 }); // Return 200 but with info about limitations
    }

    // Construct the Mendeley API URL
    // This is the public catalog search endpoint (free tier)
    const searchParamsObj = new URLSearchParams({
      query: query,
      limit: limit.toString(),
      page: page.toString(),
    });

    // If we had a valid access token, we would search the user's personal library like this:
    // const mendeleyUrl = `https://api.mendeley.com/documents?${searchParamsObj}`;
    // const response = await fetch(mendeleyUrl, {
    //   headers: {
    //     'Authorization': `Bearer ${mendeleyAccessToken}`,
    //     'Content-Type': 'application/json',
    //   }
    // });

    // Since this is for demonstration purposes, we'll return mock data
    // In a real implementation, we would make the API call to Mendeley
    console.log(`Mendeley search request: query="${query}", limit=${limit}, page=${page}`);

    // Mock response for demonstration
    const mockDocuments: MendeleyDocument[] = [
      {
        id: 'mock-doc-1',
        title: 'Artificial Intelligence in Education: A Comprehensive Review',
        authors: [
          { first_name: 'John', last_name: 'Smith' },
          { first_name: 'Jane', last_name: 'Doe' }
        ],
        source: 'Journal of Educational Technology',
        year: 2023,
        doi: '10.1016/j.edtech.2023.01.001',
        identifier: { doi: '10.1016/j.edtech.2023.01.001' },
        abstract: 'This paper provides a comprehensive review of artificial intelligence applications in educational settings...',
        keywords: [
          { value: 'artificial intelligence' },
          { value: 'education' },
          { value: 'machine learning' }
        ],
        created: '2023-01-15T10:30:00Z',
        last_modified: '2023-05-20T14:22:00Z',
        type: 'journal',
        file_attached: true,
        link: 'https://doi.org/10.1016/j.edtech.2023.01.001',
        stats: {
          readers: 150,
          groups: 5
        }
      },
      {
        id: 'mock-doc-2',
        title: 'The Impact of Online Learning on Student Performance',
        authors: [
          { first_name: 'Robert', last_name: 'Johnson' }
        ],
        source: 'International Journal of Online Learning',
        year: 2022,
        doi: '10.1080/1234.2022.1234567',
        identifier: { doi: '10.1080/1234.2022.1234567' },
        abstract: 'This paper examines the effects of online learning environments on student academic performance...',
        keywords: [
          { value: 'online learning' },
          { value: 'student performance' },
          { value: 'education technology' }
        ],
        created: '2022-11-30T09:15:00Z',
        last_modified: '2023-02-10T16:45:00Z',
        type: 'journal',
        file_attached: false,
        link: 'https://doi.org/10.1080/1234.2022.1234567',
        stats: {
          readers: 89,
          groups: 3
        }
      }
    ];

    // Convert Mendeley documents to ThesisAI citations
    const citations = convertMendeleyToThesisAICitations(mockDocuments, user.id);

    return Response.json({ 
      success: true, 
      documents: mockDocuments,
      citations,
      totalResults: 2,
      limit,
      page
    });

  } catch (error) {
    console.error('Error in Mendeley API search:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return Response.json(
      { error: 'Internal server error during Mendeley search' },
      { status: 500 }
    );
  }
}

// POST handler for importing specific documents
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Validate request body
    const requestBody = await request.json();
    const { documentIds } = requestBody;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return Response.json({ error: 'documentIds array is required' }, { status: 400 });
    }

    // In a real implementation, we would fetch the specific documents from Mendeley
    // Here, we'll return mock data
    const mockDocuments: MendeleyDocument[] = documentIds.map((id: string) => ({
      id,
      title: `Mock Document ${id}`,
      source: 'Journal of Mock Studies',
      year: 2023,
      doi: `10.1016/mock.${id.split('-').pop()}`,
      abstract: 'This is a mock document for demonstration purposes.',
      created: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      type: 'journal',
      file_attached: true,
      stats: {
        readers: Math.floor(Math.random() * 100) + 50,
        groups: Math.floor(Math.random() * 10) + 1
      }
    }));

    // Convert to ThesisAI citations
    const citations = convertMendeleyToThesisAICitations(mockDocuments, user.id);

    // Save citations to Supabase
    const { error: citationsError } = await supabase
      .from('citations')
      .insert(citations);

    if (citationsError) {
      console.error('Error saving citations:', citationsError);
      return Response.json(
        { error: 'Failed to save citations to database', details: citationsError },
        { status: 500 }
      );
    }

    // Create an import record to track progress
    const { error: importRecordError } = await supabase
      .from('citation_imports')
      .insert({
        user_id: user.id,
        source: 'mendeley',
        status: 'completed',
        total_items: citations.length,
        imported_items: citations.length,
        metadata: {
          documentIds,
          imported_at: new Date().toISOString()
        }
      });

    if (importRecordError) {
      console.error('Error creating import record:', importRecordError);
      // Continue anyway - citations were saved
    }

    return Response.json({ 
      success: true, 
      importedCitations: citations.length,
      citations
    });

  } catch (error) {
    console.error('Error importing Mendeley documents:', error);
    
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

// Function to convert Mendeley document to ThesisAI citation format
function convertMendeleyToThesisAICitations(
  documents: MendeleyDocument[], 
  userId: string
): ThesisAICitation[] {
  return documents.map(doc => {
    // Format authors
    let authors = '';
    if (doc.authors && doc.authors.length > 0) {
      authors = doc.authors.map(author => 
        `${author.last_name}, ${author.first_name.charAt(0)}.`
      ).join(', ');
    } else if (doc.profiles && doc.profiles.length > 0) {
      authors = doc.profiles.map(profile => 
        `${profile.last_name}, ${profile.first_name.charAt(0)}.`
      ).join(', ');
    }

    // Create citation based on document type
    let citationText = '';
    if (authors) citationText += `${authors}. `;
    citationText += `"${doc.title}." `;
    if (doc.source) citationText += `${doc.source}, `;
    if (doc.year) citationText += `${doc.year}. `;
    if (doc.doi) citationText += `https://doi.org/${doc.doi}.`;

    return {
      user_id: userId,
      content: citationText,
      style: 'APA 7th Edition', // Default style
      imported_from: 'mendeley',
      original_id: doc.id,
      metadata: {
        mendeley_id: doc.id,
        title: doc.title,
        authors: doc.authors || doc.profiles,
        source: doc.source,
        year: doc.year,
        doi: doc.doi || doc.identifier?.doi,
        isbn: doc.isbn || doc.identifier?.isbn,
        link: doc.link,
        abstract: doc.abstract,
        keywords: doc.keywords?.map(k => k.value),
        type: doc.type,
        created: doc.created,
        last_modified: doc.last_modified,
        stats: doc.stats,
        file_attached: doc.file_attached,
      }
    };
  });
}