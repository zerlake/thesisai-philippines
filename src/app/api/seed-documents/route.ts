/**
 * Simple endpoint to seed demo documents
 * Uses authenticated session to insert documents (RLS-safe)
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
    // Use service role for seeding
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);

    // Get user ID from request body
    const body = await request.json();
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', success: false },
        { status: 400 }
      );
    }

    // Check if documents already exist
    const { data: existingDocs, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('Check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing documents', success: false },
        { status: 500 }
      );
    }

    // If documents exist, return early
    if (existingDocs && existingDocs.length > 0) {
      return NextResponse.json({
        message: 'Documents already exist',
        count: existingDocs.length,
        success: true
      }, { status: 200 });
    }

    // Prepare documents to insert
    const documentsToInsert = DEMO_DOCUMENTS.map((doc, index) => ({
      user_id: userId,
      title: doc.title,
      content: doc.content,
      status: index === 0 ? 'submitted' : 'draft',
      created_at: new Date(Date.now() - (2 - index) * 86400000).toISOString(),
      updated_at: new Date(Date.now() - (2 - index) * 43200000).toISOString(),
    }));

    // Insert documents
    const { data: insertedDocs, error: insertError } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select('id, title, status');

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert documents', success: false, details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedDocs?.length || 0} documents`,
      documents: insertedDocs,
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server error', success: false, details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Seed documents endpoint is ready',
    usage: 'POST with { userId: "user-id" } to seed demo documents',
    success: true,
  });
}
