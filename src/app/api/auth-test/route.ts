import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("[AUTH-TEST] Request received");

  try {
    const authHeader = req.headers.get("authorization");
    console.log("[AUTH-TEST] Authorization header:", authHeader ? "Present" : "Missing");

    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 400 }
      );
    }

    // Try to extract token
    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    console.log("[AUTH-TEST] Token length:", token.length);
    console.log("[AUTH-TEST] Token prefix:", token.substring(0, 20));

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    console.log("[AUTH-TEST] Created Supabase client, calling auth.getUser() with token");

    const { data, error } = await supabase.auth.getUser(token);

    console.log("[AUTH-TEST] getUser result:", {
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
    });

    return NextResponse.json(
      {
        success: !error,
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
        } : null,
        error: error?.message,
      },
      { status: error ? 401 : 200 }
    );
  } catch (err: any) {
    console.error("[AUTH-TEST] Exception:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
