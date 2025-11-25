import { APIError, AuthenticationError } from '@/lib/errors';

// Define a type for the response to standardize it
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

// Options for the apiCall function, extending RequestInit
export interface FetchOptions<T> extends Omit<RequestInit, 'body'> {
  body?: T;
  timeout?: number; // Timeout in milliseconds
  retries?: number; // Number of retries on failure
  onRetry?: (attempt: number, error: Error) => void; // Callback on retry
}

// Utility to safely clear a timeout
function clearTimeoutSafely(signal: any) {
  if (signal) {
    clearTimeout(signal);
  }
}

/**
 * A robust, type-safe, and centralized API call utility.
 *
 * @param url - The API endpoint URL.
 * @param options - Fetch options including method, body, headers, timeout, and retries.
 * @returns A promise that resolves to an ApiResponse object.
 */
export async function apiCall<T = unknown>(
  url: string,
  options: FetchOptions<any> = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers: customHeaders,
    timeout = 30000, // 30-second default timeout
    retries = 0,
    onRetry,
    ...rest
  } = options;

  const controller = new AbortController();
  const signal = timeout ? setTimeout(() => controller.abort(), timeout) : null;

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...customHeaders,
  });

  // Main request logic encapsulated for retry purposes
  const makeRequest = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
        ...rest,
      });

      // Handle non-2xx responses
      if (!response.ok) {
        // Handle specific 401 Unauthorized error
        if (response.status === 401) {
          throw new AuthenticationError('User is not authenticated');
        }

        // Try to parse error from response body, otherwise use status text
        let data: any = null;
        try {
          data = await response.json();
        } catch (e) {
          // Ignore JSON parsing errors if body is empty or not JSON
        }
        
        throw new APIError(
          data && typeof data === 'object' && data !== null && 'error' in data
            ? (data as Record<string, any>).error
            : `API request failed with status ${response.status}`,
          { status: response.status, data }
        );
      }

      // Clear timeout on successful response
      clearTimeoutSafely(signal);

      // Handle successful but empty responses (e.g., 204 No Content)
      if (response.status === 204) {
        return {
          success: true,
          status: response.status,
        };
      }
      
      const data = await response.json();

      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      // Always clear timeout on error
      clearTimeoutSafely(signal);

      // Re-throw known error types unchanged
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }

      // Handle abort/timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new APIError(`Request timeout after ${timeout}ms`, {
          originalError: error,
        });
      }

      // Handle network errors (DNS failures, connection refused, etc.)
      if (error instanceof TypeError) {
        throw new APIError(
          `Network error: ${error.message}`,
          { originalError: error }
        );
      }

      // Fallback for any other errors
      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        { originalError: error }
      );
    }
  };

  // Implement retry logic with exponential backoff
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await makeRequest();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry if we haven't exhausted attempts
      if (attempt < retries) {
        // Notify caller of retry
        onRetry?.(attempt + 1, lastError);

        // Exponential backoff: 100ms * 2^attempt
        await new Promise(resolve => 
          setTimeout(resolve, 100 * Math.pow(2, attempt))
        );
      }
    }
  }

  // All retries exhausted - throw the last error
  if (lastError) {
    throw lastError;
  }

  // Fallback (shouldn't reach here, but safety check)
  throw new APIError('Request failed after all retries');
}

/**
 * Shorthand for GET requests
 * 
 * @param url - API endpoint URL
 * @param options - Optional fetch options (excluding method and body)
 * @returns Promise resolving to ApiResponse
 * 
 * @example
 * const result = await apiGet('/api/data', { timeout: 60_000 });
 */
export function apiGet<T = unknown>(
  url: string,
  options?: Omit<FetchOptions<T>, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { ...options, method: 'GET' });
}

/**
 * Shorthand for POST requests
 * 
 * @param url - API endpoint URL
 * @param body - Request body to send
 * @param options - Optional fetch options (excluding method)
 * @returns Promise resolving to ApiResponse
 * 
 * @example
 * const result = await apiPost('/api/generate', { prompt: 'Hello' });
 */
export function apiPost<T = unknown>(
  url: string,
  body?: T,
  options?: Omit<FetchOptions<T>, 'method'>
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { ...options, method: 'POST', body });
}

/**
 * Shorthand for PUT requests
 * 
 * @param url - API endpoint URL
 * @param body - Request body to send
 * @param options - Optional fetch options (excluding method)
 * @returns Promise resolving to ApiResponse
 * 
 * @example
 * const result = await apiPut('/api/resource/123', { title: 'Updated' });
 */
export function apiPut<T = unknown>(
  url: string,
  body?: T,
  options?: Omit<FetchOptions<T>, 'method'>
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { ...options, method: 'PUT', body });
}

/**
 * Shorthand for PATCH requests
 * 
 * @param url - API endpoint URL
 * @param body - Request body to send
 * @param options - Optional fetch options (excluding method)
 * @returns Promise resolving to ApiResponse
 * 
 * @example
 * const result = await apiPatch('/api/resource/123', { status: 'archived' });
 */
export function apiPatch<T = unknown>(
  url: string,
  body?: T,
  options?: Omit<FetchOptions<T>, 'method'>
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * Shorthand for DELETE requests
 * 
 * @param url - API endpoint URL
 * @param options - Optional fetch options (excluding method and body)
 * @returns Promise resolving to ApiResponse
 * 
 * @example
 * const result = await apiDelete('/api/resource/123');
 */
export function apiDelete<T = unknown>(
  url: string,
  options?: Omit<FetchOptions<T>, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiCall<T>(url, { ...options, method: 'DELETE' });
}
