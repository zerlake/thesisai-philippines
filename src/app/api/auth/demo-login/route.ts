import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Simple health check endpoint to verify API infrastructure
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    message: "Demo login API endpoint is reachable"
  });
}

// Main demo login POST endpoint
export async function POST(request: NextRequest) {
  try {
    console.log("Demo login API called");
    
    const { email, password } = await request.json();
    console.log("Received email:", email);

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Environment variables check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasAnonKey: !!anonKey,
    });

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Missing environment variables");
      return NextResponse.json(
        { error: "Supabase configuration incomplete. Demo functionality is not properly configured." },
        { status: 500 }
      );
    }

    // Create admin client for user management
    console.log("Creating admin client");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("Admin client created successfully");

    // Determine role based on email
    let role = "student";
    if (email.includes("advisor")) {
      role = "advisor";
    } else if (email.includes("critic")) {
      role = "critic";
    } else if (email.includes("admin")) {
      role = "admin";
    }
    console.log("Determined role:", role);

    // Check if demo user exists
    console.log("Checking if demo user exists in system");
    let { data: existingUser, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
      return NextResponse.json(
        { error: `Error checking existing users: ${listError.message}` },
        { status: 500 }
      );
    }

    const demoUserExists = existingUser?.users?.some(
      (user) => user.email === email
    );
    console.log("User exists check:", { email, demoUserExists });

    if (!demoUserExists) {
      // Create demo user with proper metadata that matches application expectations
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
          first_name: role.charAt(0).toUpperCase() + role.slice(1),
          last_name: 'Demo User',
          plan: 'demo',
          isDemoAccount: true,
        },
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        }
      });

      if (createError) {
        console.error("Error creating demo user:", createError);
        return NextResponse.json(
          { error: `Failed to create demo account: ${createError.message}` },
          { status: 400 }
        );
      }

      console.log("Demo user created successfully:", userData?.user?.id);
    } else {
      console.log("Demo user already exists, attempting sign-in with provided password");
    }

    // For demo users, we'll sign in with password
    const anonClient = createClient(supabaseUrl, anonKey);
    
    console.log("Attempting sign in for user:", email);
    const signInResult = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      console.error("Password sign-in failed for demo user:", signInResult.error?.message);

      // Password sign-in failed - this indicates an issue with the user setup
      // Check if the user exists by listing users and filtering by email
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        console.error("Could not list users to verify existence:", listError);
        return NextResponse.json(
          { 
            error: `Sign-in failed: ${signInResult.error?.message || 'Authentication error'}`,
            details: "Could not verify user existence"
          },
          { status: 401 }
        );
      }
      
      const user = usersData?.users?.find(u => u.email === email);
      
      if (!user) {
        console.log("User does not exist in auth system:", email);
        return NextResponse.json(
          { 
            error: `Sign-in failed: ${signInResult.error?.message || 'Authentication error'}`,
            details: "User does not exist in system"
          },
          { status: 401 }
        );
      }
      
      console.log("User exists in auth system with ID:", user?.id);
      
      // User exists but password authentication failed
      // This might be due to account confirmation status or password complexity
      // Return an error with more details
      return NextResponse.json(
        { 
          error: `Sign-in failed: ${signInResult.error?.message || 'Authentication error'}`,
          details: {
            email: email,
            userId: user?.id,
            issue: "Password authentication failed but user exists in system"
          }
        },
        { status: 401 }
      );
    }

    const data = signInResult.data;
    console.log("Sign in successful, session data received");

    // Check if we have session data
    if (!data?.session?.user?.id) {
      console.error("No session data returned from sign-in");
      return NextResponse.json(
        { error: "Sign-in completed but no session data was returned" },
        { status: 500 }
      );
    }

    // After successful sign-in, make sure the user profile exists in the profiles table
    // This is essential for the application to work properly
    if (data?.session?.user?.id) {
      console.log("Creating/updating profile for user:", data.session.user.id);
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: data.session.user.id,
          role: role,
          first_name: role.charAt(0).toUpperCase() + role.slice(1),
          last_name: 'Demo User',
          email: email,
          plan: 'demo',
          avatar_url: null,
          updated_at: new Date().toISOString(),
          isDemoAccount: true
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn("Warning: Could not create/update profile:", profileError);
        // Don't return error here as the auth session is still valid
      } else {
        console.log("Profile created/updated successfully for user:", data.session.user.id);
      }
    }

    console.log("Demo login successful, returning session");
    // For the demo login to work properly with the client-side Supabase session,
    // we need to return the session data so the client can handle it properly
    return NextResponse.json({
      success: true,
      session: data.session,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    // Ensure we return valid JSON even if the error object is problematic
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";

    console.error("Detailed error info:", { errorMessage, errorStack });

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage,
        // Only include stack in development, not production
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}