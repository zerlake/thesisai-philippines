import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slides } = await req.json();

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    // Lazy load Puppeteer only when needed
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Create HTML content from slides
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .slide {
              width: 10in;
              height: 7.5in;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 48px;
              box-sizing: border-box;
              page-break-after: always;
              break-after: page;
            }
            .slide-title {
              font-size: 56px;
              font-weight: bold;
              margin-bottom: 32px;
              line-height: 1.2;
            }
            .slide-bullets {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 16px;
            }
            .bullet {
              font-size: 24px;
              line-height: 1.5;
            }
            .slide-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              padding-top: 32px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
            }
          </style>
        </head>
        <body>
          ${slides
            .map(
              (slide, index) => `
            <div class="slide">
              <div>
                <div class="slide-title">${escapeHtml(slide.title)}</div>
                <div class="slide-bullets">
                  ${slide.bullets
                    .map(
                      (bullet: string) => `<div class="bullet">• ${escapeHtml(bullet)}</div>`
                    )
                    .join('')}
                </div>
              </div>
              <div class="slide-footer">
                <span>Slide ${index + 1} of ${slides.length}</span>
                <span>${Math.floor(slide.timeEstimate / 60)}m ${slide.timeEstimate % 60}s</span>
              </div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="defense-presentation.pdf"'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF generation error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: errorMessage },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
