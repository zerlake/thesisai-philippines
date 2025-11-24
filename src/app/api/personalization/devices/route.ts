import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { userDeviceSchema } from '@/lib/personalization/validation';
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

    // Fetch user devices
    const { data: devices, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
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
      userDeviceSchema.parse({
        userId,
        ...body,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return Response.json(
          { error: 'Invalid device format', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Insert device
    const { data: device, error } = await supabase
      .from('user_devices')
      .insert({
        user_id: userId,
        device_id: body.deviceId,
        device_name: body.deviceName,
        device_type: body.deviceType,
        os_name: body.osName,
        os_version: body.osVersion,
        browser_name: body.browserName,
        browser_version: body.browserVersion,
        device_token: body.deviceToken,
        is_trusted: body.isTrusted || false,
        last_seen: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Duplicate device
        return Response.json(
          { error: 'Device already registered' },
          { status: 409 }
        );
      }
      throw error;
    }

    return Response.json(device, { status: 201 });
  } catch (error) {
    console.error('Error registering device:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
