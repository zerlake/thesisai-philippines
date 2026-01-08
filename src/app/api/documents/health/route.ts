import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Health check endpoint is working",
    },
    { status: 200 }
  );
}
