import { NextRequest, NextResponse } from 'next/server';

interface PaperResult {
  id: string;
  title: string;
  link: string;
  publication_info: string;
  snippet: string;
  authors?: string;
}

function parseXMLEntries(xmlText: string): PaperResult[] {
  const papers: PaperResult[] = [];

  // Find all entry tags
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryPattern.exec(xmlText)) !== null) {
    const entryXml = match[1];

    // Extract fields using regex
    const idMatch = entryXml.match(/<id>(.*?)<\/id>/);
    const titleMatch = entryXml.match(/<title>(.*?)<\/title>/);
    const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = entryXml.match(/<published>(.*?)<\/published>/);
    const authorMatches = [...entryXml.matchAll(/<author><name>(.*?)<\/name><\/author>/g)];

    const id = idMatch ? idMatch[1].replace('http://arxiv.org/abs/', '') : '';
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const summary = summaryMatch ? summaryMatch[1].trim().replace(/\n\s+/g, ' ') : 'No summary available';
    const published = publishedMatch ? publishedMatch[1] : '';
    const authors = authorMatches.map(m => m[1]).join(', ');

    if (id && title) {
      papers.push({
        id,
        title,
        link: `https://arxiv.org/pdf/${id}.pdf`,
        publication_info: published ? new Date(published).toLocaleDateString() : '',
        snippet: summary,
        authors,
      });
    }
  }

  return papers;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    // Build ArXiv API URL
    const searchQuery = encodeURIComponent(`all:${query}`);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;

    // Fetch from ArXiv (no CORS issues from server)
    const response = await fetch(arxivUrl, {
      headers: {
        'User-Agent': 'ThesisAI/1.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ArXiv API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // Parse XML and extract papers
    const papers = parseXMLEntries(xmlText);

    return NextResponse.json({ papers });
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('ArXiv search error:', errorMsg, error);
    return NextResponse.json(
      { error: `Failed to search ArXiv papers: ${errorMsg}` },
      { status: 500 }
    );
  }
}
