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

    return NextResponse.json({ slides });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF generation data error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to get presentation data', details: errorMessage },
      { status: 500 }
    );
  }
}

