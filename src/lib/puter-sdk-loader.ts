/**
 * Puter SDK Loader - Ensures Puter SDK is fully initialized before use
 * Handles timing conflicts with async script loading and multiple SDK initialization attempts
 */

interface PuterSDKWaitOptions {
  maxWaitTime?: number; // Maximum time to wait in ms (default: 10000)
  checkInterval?: number; // How often to check if SDK is ready (default: 100)
  requireAuth?: boolean; // If true, wait for auth to be ready (default: false)
}

/**
 * Wait for Puter SDK to be fully loaded and available
 */
export async function waitForPuterSDK(options: PuterSDKWaitOptions = {}): Promise<void> {
  const {
    maxWaitTime = 10000,
    checkInterval = 100,
    requireAuth = false,
  } = options;

  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkSDK = () => {
      const elapsed = Date.now() - startTime;
      const sdkStatus = {
        windowPuter: typeof window !== 'undefined' && !!window.puter,
        puterAI: typeof window !== 'undefined' && window.puter && !!window.puter.ai,
        puterAIChat: typeof window !== 'undefined' && window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function',
        puterAuth: typeof window !== 'undefined' && window.puter && !!window.puter.auth,
        elapsedMs: elapsed,
      };
      console.debug('[Puter SDK Loader] Checking SDK status:', sdkStatus);

      // Check if Puter SDK is available
      if (sdkStatus.windowPuter && sdkStatus.puterAI && sdkStatus.puterAIChat) {
        // If auth is required, also check for auth
        if (requireAuth) {
          if (sdkStatus.puterAuth) {
            console.debug('[Puter SDK Loader] SDK and Auth fully loaded');
            resolve();
            return;
          }
        } else {
          console.debug('[Puter SDK Loader] AI SDK fully loaded');
          resolve();
          return;
        }
      }

      // Check timeout
      if (elapsed > maxWaitTime) {
        console.warn('[Puter SDK Loader] SDK initialization timeout. Final status:', sdkStatus);
        reject(new Error(`Puter SDK failed to initialize within ${maxWaitTime}ms`));
        return;
      }

      // Check again after interval
      setTimeout(checkSDK, checkInterval);
    };

    checkSDK();
  });
}

/**
 * Check if Puter SDK is currently available
 */
export function isPuterSDKReady(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function');
}

/**
 * Check if Puter Auth is currently available
 */
export function isPuterAuthReady(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.puter && window.puter.auth && typeof window.puter.auth.getUser === 'function');
}

/**
 * Get Puter SDK with safety checks
 */
export function getPuterSDK(): typeof window.puter | null {
  if (typeof window === 'undefined') return null;
  if (!window.puter) return null;
  return window.puter;
}

/**
 * Call Puter AI with guaranteed SDK availability
 * Note: Puter SDK doesn't support temperature/max_tokens options like other AI APIs.
 * Only the timeout option is used for the call itself.
 */
export async function callPuterAIWithSDKCheck(
  prompt: string,
  options: {
    temperature?: number; // Note: Currently not used by Puter SDK
    max_tokens?: number;  // Note: Currently not used by Puter SDK
    timeout?: number;
  } = {}
): Promise<any> {
  try {
    // Ensure SDK is ready
    try {
      await waitForPuterSDK({ maxWaitTime: 15000 });
    } catch (sdkError) {
      console.error('[Puter AI Call] SDK failed to initialize:', sdkError);
      // Provide helpful error message
      throw new Error(
        'AI service is not available. The Puter SDK failed to load. ' +
        'Please refresh the page or try again in a few moments. ' +
        'If the problem persists, check your internet connection.'
      );
    }

    const sdk = getPuterSDK();
    if (!sdk || !sdk.ai || typeof sdk.ai.chat !== 'function') {
      throw new Error(
        'Puter AI SDK is not properly initialized. ' +
        'Please refresh the page to reload the AI service.'
      );
    }

    // Call the AI
    let result;
    try {
      // Ensure prompt is properly formatted string
      const safePrompt = typeof prompt === 'string' ? prompt.trim() : String(prompt);

      if (!safePrompt) {
        throw new Error('Prompt cannot be empty');
      }

      console.debug('[Puter AI Call] Sending request with:', {
        promptLength: safePrompt.length,
        timeout: options.timeout ?? 60000,
      });
      console.log('Prompt:', safePrompt);
      // Note: Puter SDK doesn't support temperature/max_tokens options
      console.log('Options (timeout only):', { timeout: options.timeout });

      // Verify that the chat function exists before calling it
      if (typeof sdk.ai?.chat !== 'function') {
        throw new Error('Puter AI chat function is not available');
      }

      console.debug('[Puter AI Call] About to call sdk.ai.chat with prompt length:', safePrompt.length);

      result = await new Promise((resolve, reject) => {
        // Increase default timeout to 60 seconds for more complex AI operations
        const timeout = setTimeout(() => {
          console.error('[Puter AI Call] Call timed out after', (options.timeout ?? 60000), 'ms');
          reject(new Error('Puter AI call timed out after 60 seconds. The AI service may be experiencing high load or connectivity issues.'));
        }, options.timeout ?? 60000); // Changed from 30s to 60s

        // Call Puter AI with the correct format - just the prompt string
        // The Puter SDK expects a single string parameter, not an object
        // Note: Puter SDK doesn't seem to support temperature/max_tokens options in the same way
        // as other AI APIs, so we just pass the prompt
        console.debug('[Puter AI Call] Calling sdk.ai.chat now...');
        sdk.ai.chat(safePrompt).then(response => {
          console.debug('[Puter AI Call] Received response:', response);
          clearTimeout(timeout);
          resolve(response);
        }).catch(error => {
          clearTimeout(timeout);
          console.error('[Puter AI Call] sdk.ai.chat rejected with:', error);
          // Handle case where error might be an empty object
          const errorForLogging = error || { message: 'Unknown error occurred' };
          console.error('[Puter AI Call] sdk.ai.chat rejected with (stringified):', JSON.stringify(errorForLogging));
          reject(error);
        });
      });

      console.debug('[Puter AI Call] Received result:', { resultType: typeof result, resultKeys: result && typeof result === 'object' ? Object.keys(result) : undefined });
    } catch (callError) {
      console.error('[Puter AI Call] Chat API call failed:', callError);
      console.error('[Puter AI Call] Chat API call failed (stringified):', JSON.stringify(callError));
      debugger;
      
      // If it's an empty object, provide a helpful error
      if (callError && typeof callError === 'object' && Object.keys(callError).length === 0) {
        throw new Error('The AI service returned an empty error. Please try again in a moment.');
      }
      
      // Safe error message extraction
      const errorMessage = callError instanceof Error 
        ? callError.message 
        : String(callError);
      
      if (errorMessage && errorMessage.includes('timed out')) {
        throw new Error('The AI service took too long to respond. Please try again.');
      }
      
      // If it's an empty object, provide a helpful error
      if (callError && typeof callError === 'object' && Object.keys(callError).length === 0) {
        throw new Error('The AI service returned an error. Please try again in a moment.');
      }
      
      throw callError;
    }

    // Validate result
    if (!result) {
      throw new Error('Puter AI returned no response. The service may be temporarily unavailable.');
    }

    // Check if result is an error response from Puter (success: false)
    if (result && typeof result === 'object' && (result as any).success === false) {
      const errorMsg = (result as any).error || 'Unknown error';
      console.error('[Puter AI Call] Puter returned error response:', errorMsg);
      throw new Error(`AI service error: ${errorMsg}`);
    }

    // Check if result is an empty object
    if (typeof result === 'object' && Object.keys(result).length === 0) {
      throw new Error(
        'Puter AI returned an empty response. The service may be temporarily unavailable. ' +
        'Please try again in a few moments.'
      );
    }

    // If result is a string starting with error indicators, throw
    if (typeof result === 'string' && result.toLowerCase().includes('error')) {
      throw new Error('Puter AI returned an error: ' + result);
    }

    return result;
  } catch (error) {
    // Log detailed error info for debugging
    const errorDetails = {
      error,
      errorType: typeof error,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    console.warn('[Puter AI Call] Error details:', errorDetails);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to call Puter AI: ' + String(error));
  }
}
