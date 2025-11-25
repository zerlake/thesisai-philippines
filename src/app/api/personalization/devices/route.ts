import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth'; // Add this import
import { userDeviceSchema } from '@/lib/personalization/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line to create supabase client for data operations

    const userId = user.id; // Replace session.user.id with user.id

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
    if (error instanceof AuthenticationError) { // Add this block
        return Response.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Add this line
    const supabase = createServerSupabaseClient(); // Add this line

    const userId = user.id; // Replace session.user.id with user.id
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
    if (error instanceof AuthenticationError) { // Add this block
        return Response.json(
            { error: error.message },
            { status: 401 }
        );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
