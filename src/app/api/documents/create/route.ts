import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("[API] /api/documents/create POST request started");

  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error("[API] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body", details: parseError.message },
        { status: 400 }
      );
    }

    const { title, content } = body;
    console.log("[API] Request body parsed:", { title, hasContent: !!content });
    console.log("[API] Title value:", title, "Type:", typeof title);
    console.log("[API] Content value:", content?.substring?.(0, 50), "Type:", typeof content);

    if (!title || typeof title !== "string" || title.trim() === "") {
      console.error("[API] Title validation failed:", { title, type: typeof title });
      return NextResponse.json(
        { 
          error: "Title is required and must be a non-empty string", 
          success: false,
          received: { title, titleType: typeof title }
        },
        { status: 400 }
      );
    }

    // Get the auth header
    let authHeader = req.headers.get("authorization");
    console.log("[API] Auth header present:", !!authHeader);
    console.log("[API] Auth header format:", authHeader?.substring(0, 20) + "...");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required", success: false },
        { status: 401 }
      );
    }

    // Extract Bearer token if present
    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
      console.log("[API] Extracted token from Bearer format");
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[API] Supabase environment variables not configured");
      return NextResponse.json(
        { error: "Supabase configuration missing", success: false },
        { status: 500 }
      );
    }

    console.log("[API] Creating Supabase client with token");

    // Create Supabase client - don't set auth in global headers, we'll use the token directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("[API] Supabase client created");

    // Get current user by decoding the JWT token and calling auth.getUser with the token
    console.log("[API] Attempting to get authenticated user with token...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    console.log("[API] Auth check:", { hasUser: !!user, userEmail: user?.email, hasError: !!userError });

    if (userError) {
      console.error("[API] Auth error details:", {
        message: userError.message,
        status: userError.status,
        name: userError.name,
      });
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: userError?.message,
          success: false,
        },
        { status: 401 }
      );
    }

    if (!user) {
      console.error("[API] No user returned from auth.getUser()");
      return NextResponse.json(
        {
          error: "No user information available",
          success: false,
        },
        { status: 401 }
      );
    }

    console.log("[API] User authenticated:", { userId: user.id });

    // Now create a new client with the token for database operations
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

    console.log("[API] Created authenticated Supabase client for database operations");

    // Import crypto for UUID generation if needed
    // Create the document with an explicit ID to avoid database UUID generation issues
    const crypto = await import('crypto');
    const documentId = crypto.randomUUID();

    const insertData = {
      id: documentId, // Explicitly provide the ID to avoid database UUID generation issues
      user_id: user.id.toString(),
      title,
      content: content || JSON.stringify({ type: "doc", content: [] }),
      status: "draft",
    };

    console.log("[API] Attempting to insert document:", {
      userId: insertData.user_id,
      title: insertData.title,
      hasContent: !!insertData.content,
    });

    const { data, error } = await authenticatedSupabase
      .from("documents")
      .insert([insertData])
      .select("id")
      .single();

    console.log("[API] Insert result:", { hasData: !!data, hasError: !!error });

    if (error) {
      console.error("[API] === DOCUMENT INSERT ERROR ===");
      console.error("[API] Message:", error.message);
      console.error("[API] Code:", error.code);
      console.error("[API] Details:", error.details);
      console.error("[API] Hint:", error.hint);
      console.error("[API] Status:", error.status);
      console.error("[API] Full Error:", JSON.stringify(error, null, 2));
      console.error("[API] ===== END ERROR =====");

      // Return detailed error information
      return NextResponse.json(
        {
          error: error.message || "Failed to create document",
          details: error.details,
          code: error.code,
          hint: error.hint,
          success: false,
        },
        { status: error.status || 400 }
      );
    }

    if (!data) {
      console.error("[API] No data returned from insert");
      return NextResponse.json(
        { error: "Document created but no ID returned", success: false },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log("[API] Document created successfully:", {
      documentId: data.id,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      { success: true, documentId: data.id },
      { status: 201 }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error("[API] Unhandled exception:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
