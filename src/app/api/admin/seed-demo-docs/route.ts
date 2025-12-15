/**
 * API endpoint to manually seed demo documents
 * Used for testing and debugging the sample data setup
 * 
 * Usage: POST /api/admin/seed-demo-docs
 * Body: { userId: "user-id" }
 */

import { createClient } from '@supabase/supabase-js';
import { DEMO_DOCUMENTS } from '@/lib/seed-demo-documents';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', success: false },
        { status: 400 }
      );
    }

    // Create service role client for seeding (no auth needed)
    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    );

    // Check if documents already exist first (no auth needed for this check)
    // Use the service role key for this check to bypass RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured', success: false },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check if documents already exist
    const { data: existingDocs, error: checkError } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking existing documents:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing documents', success: false, details: checkError.message },
        { status: 500 }
      );
    }

    if (existingDocs && existingDocs.length > 0) {
      return NextResponse.json(
        {
          message: 'Documents already exist for this user',
          count: existingDocs.length,
          documentIds: existingDocs.map(d => d.id),
          success: true
        },
        { status: 200 }
      );
    }

    // Insert demo documents using service role to bypass RLS
    const documentsToInsert = DEMO_DOCUMENTS.map((doc, index) => ({
      user_id: userId,
      title: doc.title,
      content: doc.content,
      status: index === 0 ? 'submitted' : 'draft',
      created_at: new Date(Date.now() - (2 - index) * 86400000).toISOString(),
      updated_at: new Date(Date.now() - (2 - index) * 43200000).toISOString(),
    }));

    const { data: insertedDocs, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert(documentsToInsert)
      .select('id, title, status');

    if (insertError) {
      console.error('Error inserting documents:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert documents', success: false, details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${insertedDocs?.length || 0} documents`,
        documents: insertedDocs,
        userId: userId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in seed-demo-docs endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check seeding status for current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required', success: false },
        { status: 400 }
      );
    }

    // Use service role to fetch documents (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured', success: false },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check documents for user
    const { data: docs, error: docsError } = await supabaseAdmin
      .from('documents')
      .select('id, title, status, created_at, updated_at, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents', success: false, details: docsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: userId,
      totalDocuments: docs?.length || 0,
      documents: docs?.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        hasContent: !!d.content,
        contentLength: d.content?.length || 0,
        created_at: d.created_at,
        updated_at: d.updated_at
      })),
      success: true
    });
  } catch (error) {
    console.error('Error in seed-demo-docs GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, details: String(error) },
      { status: 500 }
    );
  }
}
