import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
import { AuthenticationError, ensureError } from '@/lib/errors';
import { User } from '@supabase/supabase-js';
import { capabilitiesFor, Capabilities } from '@/lib/capabilities';

// Re-export AuthenticationError for convenience
export { AuthenticationError };

// Define a more specific user type for our application
export interface AuthenticatedUser extends User {
  // Add any custom profile properties here if you join with a profiles table
  // e.g., full_name: string;
  plan?: string;
  capabilities?: Capabilities;
}

/**
 * Retrieves the currently authenticated user from the server-side session.
 * Throws an AuthenticationError if no user is found.
 *
 * @returns A promise that resolves to the authenticated user object.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError('Unauthorized: No active session found.');
  }

  return user as AuthenticatedUser;
}

/**
 * A shorthand function to get only the ID of the authenticated user.
 * Throws an AuthenticationError if no user is found.
 *
 * @returns A promise that resolves to the user's ID string.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser();
  return user.id;
}

/**
 * Retrieves the user and their profile data from the 'profiles' table.
 * Throws an error if the user or profile is not found.
 *
 * @returns A promise that resolves to the user object with their profile.
 */
export async function getAuthenticatedUserWithProfile(): Promise<AuthenticatedUser> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new AuthenticationError('Unauthorized: No active session found.');
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        throw new AuthenticationError('User profile not found.');
    }

    // Combine user and profile data
    return { ...user, ...profile } as AuthenticatedUser;
}

/**
 * Retrieves the user along with their plan capabilities.
 * If the user has no profile, 'free' plan is assumed.
 *
 * @returns A promise that resolves to the user object with plan and capabilities.
 */
export async function getAuthenticatedUserWithCapabilities(): Promise<AuthenticatedUser & { plan: string; capabilities: Capabilities }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError('Unauthorized: No active session found.');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    throw new AuthenticationError('User profile not found.');
  }

  const plan = profile.plan_type || profile.plan || 'free';
  const capabilities = capabilitiesFor(plan);

  return { ...user, ...profile, plan, capabilities } as AuthenticatedUser & { plan: string; capabilities: Capabilities };
}


/**
 * Enforces that the authenticated user is the owner of a given resource.
 *
 * @param resourceUserId The user ID associated with the resource to check.
 * @throws {AuthenticationError} If there is no authenticated user or if the user IDs do not match.
 */
export async function requireOwnership(resourceUserId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  if (userId !== resourceUserId) {
    throw new AuthenticationError('Forbidden: User does not have ownership of this resource.');
  }
}

/**
 * Enforces that the authenticated user has a specific role.
 *
 * @param requiredRole The role to check for.
 * @throws {AuthenticationError} If the user does not have the required role.
 */
export async function requireRole(requiredRole: string): Promise<void> {
  const user = await getAuthenticatedUserWithProfile();
  // This assumes the user object has a 'role' property from the joined profiles table
  const userRole = (user as any).role;
  if (userRole !== requiredRole) {
    throw new AuthenticationError(`Forbidden: User requires role '${requiredRole}'.`);
  }
}


/**
 * A utility to run multiple authorization checks sequentially.
 * If any check fails, it stops and throws the error.
 *
 * @param checks An array of functions that perform authorization checks.
 * @example
 * await requireAllAuthorizationChecks([
 *   () => requireRole('admin'),
 *   () => requireOwnership(document.user_id),
 * ]);
 */
export async function requireAllAuthorizationChecks(
  checks: Array<() => Promise<void> | void>
): Promise<void> {
  try {
    for (const check of checks) {
      await check();
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    const errorInstance = ensureError(error);
    throw new AuthenticationError(
      errorInstance.message || 'Authorization check failed',
      { originalError: errorInstance }
    );
  }
}

/**
 * A higher-order function to wrap Next.js API route handlers with authentication.
 * It automatically handles user session checking and error responses.
 *
 * @param handler The API route handler function, which receives the request and the authenticated user.
 * @returns A new API route handler with authentication built-in.
 */
export function withAuth(
  handler: (
    request: Request,
    user: AuthenticatedUser,
    context?: any
  ) => Promise<Response>
): (request: Request, context?: any) => Promise<Response> {
  return async (request: Request, context?: any) => {
    try {
      const user = await getAuthenticatedUser();
      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Response.json(
          { error: error.message },
          { status: error.message.includes('Forbidden') ? 403 : 401 }
        );
      }
      console.error('Unexpected error in withAuth:', error);
      return Response.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * An enhanced version of `withAuth` for POST, PUT, or PATCH requests
 * that automatically parses the JSON request body.
 *
 * @param handler The handler function, receiving request, parsed body, and user.
 * @returns A new API route handler.
 */
export function withAuthAndBody(
  handler: (
    request: Request,
    body: unknown,
    user: AuthenticatedUser,
    context?: any
  ) => Promise<Response>
): (request: Request, context?: any) => Promise<Response> {
  return async (request: Request, context?: any) => {
    try {
      const user = await getAuthenticatedUser();
      let body: unknown;
      try {
        body = await request.json();
      } catch (parseError) {
        return Response.json(
          { error: 'Invalid JSON in request body.' },
          { status: 400 }
        );
      }
      return await handler(request, body, user, context);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Response.json(
          { error: error.message },
          { status: error.message.includes('Forbidden') ? 403 : 401 }
        );
      }
      console.error('Unexpected error in withAuthAndBody:', error);
      return Response.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
