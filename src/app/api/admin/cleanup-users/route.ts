import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';

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

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate request (admin endpoint requires JWT)
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.CRITICAL,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/admin/cleanup-users', reason: 'Missing auth token' },
      });
      return NextResponse.json({ error: "Unauthorized", code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Verify admin role (check profile role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users',
        ipAddress: request.ip,
        details: { endpoint: 'POST /api/admin/cleanup-users', reason: 'Missing Supabase configuration' },
      });
      return NextResponse.json({ error: "Missing Supabase configuration", code: 'CONFIG_ERROR' }, { status: 500 });
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user is admin
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userProfile?.role !== 'admin') {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.CRITICAL,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users',
        ipAddress: request.ip,
        details: {
          endpoint: 'POST /api/admin/cleanup-users',
          reason: 'Non-admin user attempted to execute cleanup',
          userRole: userProfile?.role || 'unknown',
        },
      });
      return NextResponse.json({ error: "Forbidden - admin access required", code: 'FORBIDDEN' }, { status: 403 });
    }

    // 3. Log the admin action (CRITICAL severity)
    await logAuditEvent(AuditAction.API_CALL, {
      userId,
      severity: AuditSeverity.CRITICAL,
      resourceType: 'admin_action',
      resourceId: 'cleanup_users',
      ipAddress: request.ip,
      details: { endpoint: 'POST /api/admin/cleanup-users', action: 'user_cleanup_initiated' },
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

    // 4. Log completion (CRITICAL - admin action completed)
    const severity = errors.length > 0 ? AuditSeverity.WARNING : AuditSeverity.CRITICAL;
    await logAuditEvent(AuditAction.API_CALL, {
      userId,
      severity,
      resourceType: 'admin_action',
      resourceId: 'cleanup_users',
      statusCode: 200,
      ipAddress: request.ip,
      details: {
        endpoint: 'POST /api/admin/cleanup-users',
        action: 'user_cleanup_completed',
        deletedCount,
        totalToDelete: usersToDelete.length,
        errorsOccurred: errors.length > 0,
      },
    });

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
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.CRITICAL,
      resourceType: 'admin_action',
      resourceId: 'cleanup_users',
      ipAddress: request?.ip,
      details: {
        endpoint: 'POST /api/admin/cleanup-users',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what will be deleted (admin only)
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users_preview',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/admin/cleanup-users', reason: 'Missing auth token' },
      });
      return NextResponse.json({ error: "Unauthorized", code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Verify admin role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users_preview',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/admin/cleanup-users', reason: 'Missing Supabase configuration' },
      });
      return NextResponse.json({ error: "Missing Supabase configuration", code: 'CONFIG_ERROR' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user is admin
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userProfile?.role !== 'admin') {
      await logAuditEvent(AuditAction.SECURITY_RLS_VIOLATION, {
        userId,
        severity: AuditSeverity.WARNING,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users_preview',
        ipAddress: request.ip,
        details: {
          endpoint: 'GET /api/admin/cleanup-users',
          reason: 'Non-admin user attempted to preview cleanup',
          userRole: userProfile?.role || 'unknown',
        },
      });
      return NextResponse.json({ error: "Forbidden - admin access required", code: 'FORBIDDEN' }, { status: 403 });
    }

    // 3. Get preview data
    const { data: allUsers, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (listError) {
      await logAuditEvent(AuditAction.API_ERROR, {
        userId,
        severity: AuditSeverity.ERROR,
        resourceType: 'admin_action',
        resourceId: 'cleanup_users_preview',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/admin/cleanup-users', reason: `Failed to list users: ${listError.message}` },
      });
      return NextResponse.json({ error: `Failed to list users: ${listError.message}`, code: 'DATABASE_ERROR' }, { status: 500 });
    }

    const usersToDelete = allUsers?.users?.filter(u => !USERS_TO_KEEP.includes(u.id)) || [];
    const usersToKeep = allUsers?.users?.filter(u => USERS_TO_KEEP.includes(u.id)) || [];

    // Log preview access
    await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'admin_action',
      resourceId: 'cleanup_users_preview',
      statusCode: 200,
      ipAddress: request.ip,
      details: {
        endpoint: 'GET /api/admin/cleanup-users',
        usersToDeleteCount: usersToDelete.length,
        usersToKeepCount: usersToKeep.length,
      },
    });

    return NextResponse.json({
      preview: true,
      usersToDelete: usersToDelete.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })),
      usersToKeep: usersToKeep.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })),
      totalUsers: allUsers?.users?.length || 0,
      hint: "POST to this endpoint to execute cleanup"
    });

  } catch (error) {
    console.error("Preview error:", error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'admin_action',
      resourceId: 'cleanup_users_preview',
      ipAddress: request?.ip,
      details: {
        endpoint: 'GET /api/admin/cleanup-users',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
