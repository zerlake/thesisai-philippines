# Migration Guide: Enhancing Thesis AI with New Utilities

This guide provides instructions and code examples for migrating existing components and API routes to utilize the newly implemented `useApiCall()` hook and `getAuthenticatedUser()` utility. These changes standardize API interaction, centralize authentication logic, and improve error handling across the application.

## Table of Contents
1.  [Migrating Components to `useApiCall()` Hook](#migrating-components-to-useapicall-hook)
    *   [Before](#before-component)
    *   [After](#after-component)
    *   [Key Changes](#key-changes-component)
2.  [Migrating API Routes to `getAuthenticatedUser()` Utility](#migrating-api-routes-to-getauthenticateduser-utility)
    *   [Before](#before-api-route)
    *   [After](#after-api-route)
    *   [Key Changes](#key-changes-api-route)

---

## 1. Migrating Components to `useApiCall()` Hook

The `useApiCall()` hook simplifies asynchronous data fetching and state management (loading, data, error) in React components. It also integrates our enhanced error handling.

**Goal:** Replace manual `fetch` calls and associated loading/error states (`useState`) with `useApiCall()`.

### Before (Component Example)

```tsx
// src/components/old-component.tsx
import React, { useState } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';

interface Data {
  id: string;
  name: string;
}

export function OldComponent() {
  const { session } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!session) {
      toast.error('You must be logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/some-endpoint', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      const result: Data = await response.json();
      setData(result);
      toast.success('Data fetched successfully!');
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

### After (Component Example)

```tsx
// src/components/new-component.tsx
import React, { useEffect } from 'react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { useApiCall } from '@/hooks/use-api-call'; // New import

interface Data {
  id: string;
  name: string;
}

export function NewComponent() {
  const { session } = useAuth();

  const {
    execute: fetchData, // Renamed from execute to fetchData for clarity
    loading: isLoading,
    data,
    error,
  } = useApiCall<Data>({ // Specify the data type for better type safety
    onSuccess: (result) => {
      // Data is already set by the hook
      toast.success('Data fetched successfully!');
    },
    onError: (err) => {
      // Error is already set by the hook and toasted by default if autoErrorToast is true
      console.error('Fetch error:', err);
      // If autoErrorToast is false, you would toast here: toast.error(err.message);
    },
    // autoErrorToast: true, // Default behaviour, can be set to false if you want custom toast messages
  });

  // Example of triggering fetch on mount, or based on some condition
  // useEffect(() => {
  //   if (session) {
  //     fetchData('/api/some-endpoint', {
  //       headers: {
  //         Authorization: `Bearer ${session.access_token}`,
  //       },
  //     });
  //   }
  // }, [session, fetchData]);

  const handleButtonClick = () => {
    if (!session) {
      toast.error('You must be logged in.');
      return;
    }
    fetchData('/api/some-endpoint', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  };

  return (
    <div>
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}
```

### Key Changes (Component)

1.  **Import `useApiCall`**: Add `import { useApiCall } from '@/hooks/use-api-call';`.
2.  **Remove manual state**: Eliminate `useState` for `isLoading`, `data`, and `error` related to API calls.
3.  **Instantiate `useApiCall`**:
    ```typescript
    const { execute, loading, data, error } = useApiCall<DataType>({
      onSuccess: (result) => { /* handle success side effects */ },
      onError: (err) => { /* handle error side effects */ },
      // autoErrorToast: true, // Optional: set to false for custom error toasts
    });
    ```
    *   `execute`: The function to trigger the API call. It takes the URL and `RequestInit` options.
    *   `loading`: A boolean indicating if the API call is in progress.
    *   `data`: The response data (typed as `DataType`).
    *   `error`: An `AppError` instance if the call fails.
4.  **Update Call Site**: Replace direct `fetch` calls with `execute(url, options)`.
5.  **Access State**: Use `isLoading`, `data`, and `error` from `useApiCall` in your JSX.
6.  **Error Handling**: `useApiCall` automatically transforms `fetch` errors into instances of `AppError` subclasses. By default, it also shows a `sonner` toast for errors. You can customize `onError` for specific error handling or set `autoErrorToast: false` for full control.

---

## 2. Migrating API Routes to `getAuthenticatedUser()` Utility

The `getAuthenticatedUser()` utility centralizes user authentication logic for server-side Next.js API routes, ensuring consistency and proper error handling for unauthenticated requests.

**Goal:** Replace manual `createServerSupabaseClient()` and `supabase.auth.getSession()` calls with `getAuthenticatedUser()`.

### Before (API Route Example)

```tsx
// src/app/api/some-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';
// Assume dashboardErrorHandler is also defined or imported

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Manual error handling
      return NextResponse.json(
        { error: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    // ... rest of API logic using userId and supabase client for data access
    const { data, error } = await supabase.from('items').select('*').eq('user_id', userId);

    if (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ userId, data });
  } catch (error) {
    console.error('Error in API route:', error);
    // Generic catch-all for unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### After (API Route Example)

```tsx
// src/app/api/some-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client'; // Keep for data access
import { getAuthenticatedUser, AuthenticationError, handleErrorResponse, toAppError } from '@/lib/server-auth'; // New imports

const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(); // Authenticates user or throws AuthenticationError
    const supabase = createServerSupabaseClient(); // Get Supabase client for data operations

    const userId = user.id;
    // ... rest of API logic using userId and supabase client for data access
    const { data, error } = await supabase.from('items').select('*').eq('user_id', userId);

    if (error) {
        console.error("Database error:", error);
        // Use handleErrorResponse for database errors as well if they can be mapped to AppErrors
        throw new Error(error.message); // Or wrap in a more specific AppError
    }

    return NextResponse.json({ userId, data });
  } catch (error) {
    console.error('Error in API route:', error);
    // Use the centralized handleErrorResponse utility
    if (error instanceof AuthenticationError) {
        return handleErrorResponse(error); // Automatically returns 401
    }
    // Convert other errors to AppError if not already, then handle
    return handleErrorResponse(toAppError(error)); // Generic 500 for unexpected errors
  }
}
```

### Key Changes (API Route)

1.  **Import `getAuthenticatedUser`, `AuthenticationError`, `handleErrorResponse`, `toAppError`**:
    Add `import { getAuthenticatedUser, AuthenticationError, handleErrorResponse, toAppError } from '@/lib/server-auth';` (Note: `handleErrorResponse` and `toAppError` are from `src/lib/errors.ts`, but it's good practice to re-export them from `server-auth` if they are commonly used together in API routes, or import directly from `errors.ts`). For simplicity in this guide, assume they are readily available or re-exported.
2.  **Remove direct session retrieval**: Delete lines like `const supabase = createServerSupabaseClient();` and `const { data: { session }, } = await supabase.auth.getSession();` that are solely for user session acquisition.
3.  **Call `getAuthenticatedUser()`**:
    ```typescript
    const user = await getAuthenticatedUser();
    ```
    This function will automatically check for an authenticated session and return the `User` object if successful. If no valid session is found, it will throw an `AuthenticationError`.
4.  **Instantiate `createServerSupabaseClient()` for data operations**: If your API route needs to interact with the Supabase database (e.g., `supabase.from('items').select('*')`), you will still need to create a Supabase client. Do this *after* successfully authenticating the user.
    ```typescript
    const supabase = createServerSupabaseClient();
    ```
5.  **Update `userId` references**: Replace any uses of `session.user.id` with `user.id`.
6.  **Centralized Error Handling**: Wrap the API logic in a `try...catch` block.
    *   Catch `AuthenticationError` specifically and use `handleErrorResponse(error)` for standardized 401 responses.
    *   For other errors, use `handleErrorResponse(toAppError(error))` to ensure all errors are converted to a consistent `AppError` type before being processed into a `NextResponse`.

These migrations ensure a more robust, maintainable, and consistent approach to handling API calls and user authentication across your Thesis AI application.
