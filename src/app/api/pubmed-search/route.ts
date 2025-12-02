/**
 * API Route: PubMed Search (Server-side to avoid CORS)
 * 
 * Proxies requests to PubMed API to avoid browser CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const maxResults = Number(searchParams.get('max') ?? '20');

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`[API] PubMed search: ${query}, max: ${maxResults}`);

    // Step 1: Search for UIDs via esearch
    const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    searchUrl.searchParams.set('db', 'pubmed');
    searchUrl.searchParams.set('term', query);
    searchUrl.searchParams.set('retmax', String(Math.min(maxResults, 100)));
    searchUrl.searchParams.set('rettype', 'json');
    searchUrl.searchParams.set('tool', 'ThesisAI');
    searchUrl.searchParams.set('email', 'api@thesis-ai.local');

    const controller1 = new AbortController();
    const timeout1 = setTimeout(() => controller1.abort(), 15000);

    const searchResponse = await fetch(searchUrl.toString(), {
      signal: controller1.signal,
    }).finally(() => clearTimeout(timeout1));

    if (!searchResponse.ok) {
      console.error(`[API] PubMed esearch returned ${searchResponse.status}`);
      return NextResponse.json(
        { error: `PubMed esearch error: ${searchResponse.status}`, articles: [] },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();
    const uids = searchData.esearchresult?.idlist || [];

    if (uids.length === 0) {
      console.log('[API] PubMed esearch found no UIDs');
      return NextResponse.json({
        articles: [],
        count: 0,
        query,
      });
    }

    // Step 2: Get summaries via esummary
    const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
    summaryUrl.searchParams.set('db', 'pubmed');
    summaryUrl.searchParams.set('id', uids.join(','));
    summaryUrl.searchParams.set('rettype', 'json');
    summaryUrl.searchParams.set('tool', 'ThesisAI');
    summaryUrl.searchParams.set('email', 'api@thesis-ai.local');

    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 15000);

    const summaryResponse = await fetch(summaryUrl.toString(), {
      signal: controller2.signal,
    }).finally(() => clearTimeout(timeout2));

    if (!summaryResponse.ok) {
      console.error(`[API] PubMed esummary returned ${summaryResponse.status}`);
      return NextResponse.json(
        { error: `PubMed esummary error: ${summaryResponse.status}`, articles: [] },
        { status: summaryResponse.status }
      );
    }

    const summaryData = await summaryResponse.json();
    
    if (!summaryData.result || typeof summaryData.result !== 'object') {
      console.log('[API] PubMed esummary returned invalid result:', summaryData);
      return NextResponse.json({
        articles: [],
        count: 0,
        query,
      });
    }

    // Filter out non-article entries (result can contain 'uids' and other metadata)
    const articles = Object.entries(summaryData.result)
      .filter(([key, doc]: [string, any]) => key !== 'uids' && typeof doc === 'object' && doc.uid)
      .map(([, doc]) => doc);

    console.log(`[API] PubMed found ${articles.length} articles from esummary`);

    if (articles.length === 0) {
      console.log('[API] PubMed esummary returned no valid articles');
      return NextResponse.json({
        articles: [],
        count: 0,
        query,
      });
    }

    return NextResponse.json({
      articles,
      count: articles.length,
      query,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[API] PubMed search error:', msg, error);
    return NextResponse.json(
      { error: `PubMed search failed: ${msg}`, articles: [] },
      { status: 500 }
    );
  }
}
