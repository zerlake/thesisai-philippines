import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Simple health check endpoint to verify API infrastructure and demo availability
export async function GET(request: NextRequest) {
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Demo login API endpoint is reachable",
    demoAvailable: hasSupabase,
    demoAccounts: [
      { email: 'demo-student@thesis.ai', role: 'student' },
      { email: 'demo-advisor@thesis.ai', role: 'advisor' },
      { email: 'demo-critic@thesis.ai', role: 'critic' },
      { email: 'demo-admin@thesis.ai', role: 'admin' },
    ]
  });
}

// Demo user mapping: old emails -> new emails
// New demo accounts with actual UUIDs in the database:
// Student: 6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7 - demo-student@thesis.ai
// Advisor: ff79d401-5614-4de8-9f17-bc920f360dcf - demo-advisor@thesis.ai
// Critic:  14a7ff7d-c6d2-4b27-ace1-32237ac28e02 - demo-critic@thesis.ai
// Admin:   7f22dff0-b8a9-4e08-835f-2a79dba9e6f7 - demo-admin@thesis.ai
const DEMO_EMAIL_MAPPING: Record<string, string> = {
  'student@demo.thesisai.local': 'demo-student@thesis.ai',
  'advisor@demo.thesisai.local': 'demo-advisor@thesis.ai',
  'critic@demo.thesisai.local': 'demo-critic@thesis.ai',
  'admin@demo.thesisai.local': 'demo-admin@thesis.ai',
};

// Main demo login POST endpoint
export async function POST(request: NextRequest) {
  try {
    console.log("Demo login API called");

    let email, password;
    try {
      // Attempt to parse the request body
      const requestBody = await request.text();
      console.log("Raw request body:", requestBody);

      if (!requestBody) {
        console.error("Empty request body received");
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }

      const parsedBody = JSON.parse(requestBody);
      email = parsedBody.email;
      password = parsedBody.password;

      if (!email || !password) {
        console.error("Missing email or password in request body");
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("Received email:", email);

    // Redirect old demo emails to new ones
    if (DEMO_EMAIL_MAPPING[email]) {
      const newEmail = DEMO_EMAIL_MAPPING[email];
      console.log(`Redirecting old demo email ${email} to ${newEmail}`);
      email = newEmail;
    }

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

    // Check if specific demo user exists by email using a more direct approach
    console.log("Checking if demo user exists in system");
    let existingUser = null;

    try {
      // Supabase doesn't have a direct getUserByEmail method in the admin API
      // We need to list users and find the one with the specific email
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (listError) {
        console.warn("Could not list users to find specific email:", listError?.message);
      } else {
        existingUser = usersData?.users?.find(u => u.email === email);
        if (existingUser) {
          console.log("User found in system:", { id: existingUser?.id, email: existingUser?.email });
        } else {
          console.log("Demo user does not exist in system:", email);
        }
      }
    } catch (error: any) {
      console.warn("Could not retrieve user by email (using list method):", error?.message);
    }

    console.log("User exists check:", { email, exists: !!existingUser, userId: existingUser?.id });

    // Always try to ensure user exists with the correct password
    if (!existingUser) {
      // Create demo user with proper metadata that matches application expectations
      console.log("Creating new demo user:", email);
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
        console.error("Error message:", createError?.message);
        console.error("Full error:", JSON.stringify(createError, null, 2));

        // If creation fails because user exists (likely race condition or email already in use), try to update password
        if (createError.message?.includes('User already exists') || 
            createError.message?.includes('Email already registered') ||
            createError.message?.includes('Database error checking email')) {
          console.log("User already exists (race condition), will attempt to update password");

          // Try to get the existing user by listing and find the user, then update the password
          try {
            const { data: usersData } = await adminClient.auth.admin.listUsers({
              page: 1,
              perPage: 1000
            });
            const foundUser = usersData?.users?.find(u => u.email === email);

            if (foundUser) {
              console.log("Found existing user, updating password...");
              const { error: updateError } = await adminClient.auth.admin.updateUserById(
                foundUser.id,
                { password: password }
              );
              if (updateError) {
                console.error("Failed to update existing user password:", updateError);
              } else {
                console.log("Successfully updated password for existing user");

                // Wait a moment for the password change to propagate
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else {
              console.error("Could not find existing user after creation failed");
            }
          } catch (updateError: any) {
            console.error("Error in password update process:", updateError?.message);
          }
        } else {
          console.error("Failed to create demo user:", createError?.message);
          return NextResponse.json(
            { error: `Failed to create demo user: ${createError?.message}` },
            { status: 500 }
          );
        }
      } else {
        console.log("Demo user created successfully:", userData?.user?.id);
      }
    } else {
      console.log("Demo user already exists, updating password to ensure it's correct...");

      // For existing users, always update the password to ensure it's correct
      try {
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          { password: password }
        );
        if (updateError) {
          console.error("Failed to update existing user password:", updateError);
          // Proceed anyway as the user might still be able to log in with their current password
        } else {
          console.log("Successfully updated password for existing user");

          // Wait a moment for the password to be updated in the auth system
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (updateError: any) {
        console.error("Error updating existing user password:", updateError?.message);
        // Don't fail the request, as the user might still be able to log in with their current password
      }
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
      console.log("Sign-in error details:", JSON.stringify(signInResult.error, null, 2));

      // After ensuring user exists and has correct password, if sign-in still fails,
      // there might be an issue with the auth system propagation, so return a more helpful error
      return NextResponse.json(
        {
          error: `Sign-in failed: ${signInResult.error?.message || 'Authentication error'}. The user account may still be propagating through the system. Please try again.`,
          details: "Could not authenticate demo user"
        },
        { status: 401 }
      );
    }

    const data = signInResult.data;

    console.log("Sign in successful, session data received:", JSON.stringify(data, null, 2));

    // Check if we have session data
    if (!data?.session?.user?.id) {
      console.error("No session data returned from sign-in");
      return NextResponse.json(
        { error: "Sign-in completed but no session data was returned" },
        { status: 500 }
      );
    }

    // After successful sign-in, make sure the user profile exists in the profiles table
    // This is essential for the application to work properly and must happen BEFORE returning the session
    // to avoid race conditions in the frontend auth provider
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
        // Don't return error here as the auth session is still valid, but log it
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
  } catch (error: any) {
    console.error("Demo login outer catch block triggered");
    console.error("Demo login error:", error);
    console.error("Error type:", typeof error);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      isAxiosError: !!error.isAxiosError,
      response: error?.response?.data
    });

    // Ensure we return valid JSON even if the error object is problematic
    const errorMessage = error instanceof Error ? error.message : (error?.message || "Unknown error occurred");
    const errorStack = error instanceof Error ? error.stack : (error?.stack || "No stack trace");

    const errorResponse = {
      error: "Internal server error",
      details: errorMessage || "Unknown error occurred",
      // Only include stack in development, not production
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    };
    
    console.error("Returning error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
