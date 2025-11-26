import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json(
        { error: "Supabase configuration incomplete" },
        { status: 500 }
      );
    }

    // Create admin client for user management
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Determine role based on email
    let role = "student";
    if (email.includes("advisor")) {
      role = "advisor";
    } else if (email.includes("critic")) {
      role = "critic";
    } else if (email.includes("admin")) {
      role = "admin";
    }

    // Check if demo user exists
    const { data: existingUser } = await adminClient.auth.admin.listUsers();
    const demoUserExists = existingUser?.users?.some(
      (user) => user.email === email
    );

    if (!demoUserExists) {
      // Create demo user
      const { error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          isDemoAccount: true,
        },
      });

      if (createError) {
        return NextResponse.json(
          { error: `Failed to create demo account: ${createError.message}` },
          { status: 400 }
        );
      }
    }

    // Sign in with anon client
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: signInError.message },
        { status: 401 }
      );
    }

    // Create response with session cookies
    const response = NextResponse.json({
      success: true,
      session: data.session,
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
