import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// List of UUIDs to KEEP
const USERS_TO_KEEP = [
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',  // demo-student@thesis.ai
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',  // demo-critic@thesis.ai
  'ff79d401-5614-4de8-9f17-bc920f360dcf',  // demo-advisor@thesis.ai
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',  // demo-admin@thesis.ai
  '2e21b303-cfbb-48a9-928e-cffbd530e777',  // zerlake1@gmail.com
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',  // zerlake@gmail.com
  'a39d0467-bb04-4b2c-96af-4e4a35197715',  // elezerlake@gmail.com
];

// Security: Only allow this endpoint to be called with a secret key
const CLEANUP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-10); // Use last 10 chars as simple secret

export async function POST(request: NextRequest) {
  try {
    // Verify the secret key
    const { secret } = await request.json();

    if (secret !== CLEANUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: string[] = [];
    const errors: string[] = [];

    // Step 1: Get all users to delete from auth.users
    console.log("Fetching users to delete...");
    const { data: allUsers, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (listError) {
      return NextResponse.json({ error: `Failed to list users: ${listError.message}` }, { status: 500 });
    }

    const usersToDelete = allUsers?.users?.filter(u => !USERS_TO_KEEP.includes(u.id)) || [];
    const usersToKeep = allUsers?.users?.filter(u => USERS_TO_KEEP.includes(u.id)) || [];

    results.push(`Found ${usersToDelete.length} users to delete`);
    results.push(`Keeping ${usersToKeep.length} users: ${usersToKeep.map(u => u.email).join(', ')}`);

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to delete",
        results,
        usersKept: usersToKeep.map(u => ({ id: u.id, email: u.email }))
      });
    }

    // Step 2: Delete related data from tables (in order of FK dependencies)
    const userIdsToDelete = usersToDelete.map(u => u.id);

    // Delete from advisor_student_messages
    const { error: msgError } = await adminClient
      .from('advisor_student_messages')
      .delete()
      .or(`sender_id.in.(${userIdsToDelete.join(',')}),recipient_id.in.(${userIdsToDelete.join(',')})`);
    if (msgError) errors.push(`advisor_student_messages: ${msgError.message}`);
    else results.push("Deleted from advisor_student_messages");

    // Delete from messages
    const { error: msg2Error } = await adminClient
      .from('messages')
      .delete()
      .or(`sender_id.in.(${userIdsToDelete.join(',')}),recipient_id.in.(${userIdsToDelete.join(',')})`);
    if (msg2Error) errors.push(`messages: ${msg2Error.message}`);
    else results.push("Deleted from messages");

    // Delete from notifications
    const { error: notifError } = await adminClient
      .from('notifications')
      .delete()
      .in('user_id', userIdsToDelete);
    if (notifError) errors.push(`notifications: ${notifError.message}`);
    else results.push("Deleted from notifications");

    // Delete from activity_logs
    const { error: actError } = await adminClient
      .from('activity_logs')
      .delete()
      .in('user_id', userIdsToDelete);
    if (actError) errors.push(`activity_logs: ${actError.message}`);
    else results.push("Deleted from activity_logs");

    // Delete from documents
    const { error: docError } = await adminClient
      .from('documents')
      .delete()
      .in('user_id', userIdsToDelete);
    if (docError) errors.push(`documents: ${docError.message}`);
    else results.push("Deleted from documents");

    // Delete from advisors
    const { error: advError } = await adminClient
      .from('advisors')
      .delete()
      .in('profile_id', userIdsToDelete);
    if (advError) errors.push(`advisors: ${advError.message}`);
    else results.push("Deleted from advisors");

    // Delete from critics
    const { error: critError } = await adminClient
      .from('critics')
      .delete()
      .in('profile_id', userIdsToDelete);
    if (critError) errors.push(`critics: ${critError.message}`);
    else results.push("Deleted from critics");

    // Delete from profiles
    const { error: profError } = await adminClient
      .from('profiles')
      .delete()
      .in('id', userIdsToDelete);
    if (profError) errors.push(`profiles: ${profError.message}`);
    else results.push("Deleted from profiles");

    // Step 3: Delete users from auth.users using admin API
    let deletedCount = 0;
    for (const user of usersToDelete) {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
      if (deleteError) {
        errors.push(`auth.users (${user.email}): ${deleteError.message}`);
      } else {
        deletedCount++;
      }
    }
    results.push(`Deleted ${deletedCount}/${usersToDelete.length} users from auth.users`);

    return NextResponse.json({
      success: errors.length === 0,
      message: `Cleanup completed. Deleted ${deletedCount} users.`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      deletedUsers: usersToDelete.map(u => ({ id: u.id, email: u.email })),
      keptUsers: usersToKeep.map(u => ({ id: u.id, email: u.email }))
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what will be deleted
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: allUsers, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (listError) {
      return NextResponse.json({ error: `Failed to list users: ${listError.message}` }, { status: 500 });
    }

    const usersToDelete = allUsers?.users?.filter(u => !USERS_TO_KEEP.includes(u.id)) || [];
    const usersToKeep = allUsers?.users?.filter(u => USERS_TO_KEEP.includes(u.id)) || [];

    return NextResponse.json({
      preview: true,
      usersToDelete: usersToDelete.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })),
      usersToKeep: usersToKeep.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })),
      totalUsers: allUsers?.users?.length || 0,
      hint: "POST to this endpoint with { secret: '<last 10 chars of service role key>' } to execute cleanup"
    });

  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
