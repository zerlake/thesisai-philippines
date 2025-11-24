import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { notificationSchema } from '@/lib/personalization/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return Response.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    try {
      notificationSchema.parse({
        userId,
        ...body,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: 'Invalid notification format', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Insert notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: body.title,
        message: body.message,
        notification_type: body.notificationType,
        priority: body.priority || 1,
        channels: body.channels || ['in_app'],
        data: body.data || {},
        expires_at: body.expiresAt,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { notificationIds, action } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return Response.json(
        { error: 'notificationIds array is required' },
        { status: 400 }
      );
    }

    if (!action || !['read', 'unread', 'delete'].includes(action)) {
      return Response.json(
        { error: 'action must be one of: read, unread, delete' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .in('id', notificationIds);

      if (error) {
        throw error;
      }

      return Response.json({ success: true, action: 'deleted' });
    }

    const updateData = {
      read_at: action === 'read' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('user_id', userId)
      .in('id', notificationIds)
      .select();

    if (error) {
      throw error;
    }

    return Response.json({ success: true, action, updated });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
