import { NextRequest, NextResponse } from 'next/server';

const SCI_HUB_MIRRORS = [
  'https://sci-hub.se',
  'https://sci-hub.st',
  'https://sci-hub.ru',
  'https://sci-hub.scihubtw.tw',
];

/**
 * Extract PDF URL from Sci-Hub HTML page
 */
function extractPDFUrl(html: string, baseUrl: string): string | null {
  // Try to find PDF URL in various common patterns
  const patterns = [
    // Sci-Hub often uses an iframe or embed with PDF
    /<iframe[^>]+src=["']([^"']+)["']/i,
    /<embed[^>]+src=["']([^"']+)["']/i,
    // Direct PDF links
    /<a[^>]+href=["']([^"']+\.pdf[^"']*)["']/i,
    // JavaScript redirects
    /location\.href\s*=\s*["']([^"']+)["']/i,
    /window\.location\s*=\s*["']([^"']+)["']/i,
    // Meta refresh
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;"]*;\s*url=([^"']+)["']/i,
    // PDF URL in button onclick
    /<button[^>]+onclick=["'][^"']*(?:location\.href|window\.location)\s*=\s*["']([^"']+)["']/i,
    // Direct PDF URL variable
    /(?:pdf_url|pdfUrl|PDF_URL)\s*=\s*["']([^"']+)["']/i,
    // Sci-Hub specific: #id="pdf" src attribute
    /id\s*=\s*["']pdf["'][^>]*src\s*=\s*["']([^"']+)["']/i,
    /src\s*=\s*["']([^"']+)["'][^>]*id\s*=\s*["']pdf["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let pdfUrl = match[1];

      // Skip javascript: and data: URLs
      if (pdfUrl.startsWith('javascript:') || pdfUrl.startsWith('data:')) {
        continue;
      }

      // Handle relative URLs
      if (pdfUrl.startsWith('//')) {
        pdfUrl = 'https:' + pdfUrl;
      } else if (pdfUrl.startsWith('/')) {
        pdfUrl = baseUrl + pdfUrl;
      } else if (!pdfUrl.startsWith('http')) {
        pdfUrl = baseUrl + '/' + pdfUrl;
      }

      // Validate it looks like a PDF URL
      if (pdfUrl.includes('.pdf') || pdfUrl.includes('download') || pdfUrl.includes('pdf')) {
        console.log(`[Sci-Hub] Found potential PDF URL: ${pdfUrl}`);
        return pdfUrl;
      }
    }
  }

  // If no PDF found, log a snippet of the HTML for debugging
  console.log('[Sci-Hub] Could not find PDF URL. HTML snippet:', html.substring(0, 500));

  return null;
}

/**
 * POST /api/papers/unlock
 * Unlocks PDF from Sci-Hub for a given DOI
 * Handles CORS issues and domain rotation server-side
 *
 * Note: This API returns the PDF URL directly instead of base64 data
 * to avoid memory issues with large PDFs
 */
export async function POST(request: NextRequest) {
  try {
    const { doi } = await request.json();

    if (!doi) {
      return NextResponse.json(
        { error: 'DOI is required', success: false },
        { status: 400 }
      );
    }

    // Normalize DOI
    const normalizedDOI = doi.startsWith('10.') ? doi : doi.replace(/.*10\./, '10.');

    let lastError: string | null = null;

    // Try each mirror
    for (const mirror of SCI_HUB_MIRRORS) {
      try {
        const url = `${mirror}/${normalizedDOI}`;
        console.log(`[Sci-Hub] Trying mirror: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          },
          redirect: 'follow',
        });

        if (!response.ok) {
          lastError = `Mirror ${mirror} returned ${response.status}`;
          console.warn(lastError);
          continue;
        }

        const contentType = response.headers.get('content-type') || '';

        // Check if response is directly a PDF
        if (contentType.includes('application/pdf')) {
          console.log(`[Sci-Hub] Direct PDF found at ${mirror}`);
          return NextResponse.json({
            success: true,
            url: url,
            message: `PDF available at ${mirror}`,
          });
        }

        // Parse HTML to extract PDF URL
        const html = await response.text();
        const pdfUrl = extractPDFUrl(html, mirror);

        if (pdfUrl) {
          console.log(`[Sci-Hub] PDF URL found: ${pdfUrl}`);
          return NextResponse.json({
            success: true,
            url: pdfUrl,
            message: `Successfully found PDF from ${mirror}`,
          });
        }

        lastError = `Mirror ${mirror}: Could not extract PDF URL from HTML`;
        console.warn(lastError);
      } catch (error) {
        lastError = `Mirror ${mirror} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(lastError);
        continue;
      }
    }

    // If all automatic attempts failed, provide the Sci-Hub URL for manual access
    const manualUrl = `${SCI_HUB_MIRRORS[0]}/${normalizedDOI}`;

    return NextResponse.json(
      {
        success: false,
        error: 'SCIHUB_FAILED',
        message: lastError || 'Could not automatically extract PDF. Try opening Sci-Hub manually.',
        fallbackUrl: manualUrl, // Provide manual access URL
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Unlock API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
