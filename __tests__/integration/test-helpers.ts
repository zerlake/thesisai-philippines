import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Type for test configuration
export interface TestConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  testUserId?: string;
  testDocumentId?: string;
}

// Default test configuration
export const DEFAULT_TEST_CONFIG: TestConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
};

// Create a Supabase client specifically for testing
export function createTestSupabaseClient(config: TestConfig = DEFAULT_TEST_CONFIG): SupabaseClient<Database> {
  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}

// Function to test if a Supabase function exists and is callable
export async function testSupabaseFunction(
  supabase: SupabaseClient<Database>,
  functionName: string,
  testBody: any = {},
  directFetch: boolean = false,
  directUrl?: string
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    let response: any;

    if (directFetch && directUrl) {
      // For functions called via direct fetch (like call-arxiv-mcp-server)
      response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseAnonKey}`,
          'apikey': config.supabaseAnonKey,
        },
        body: JSON.stringify(testBody),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, response: data };
    } else {
      // For standard Supabase functions
      response = await supabase.functions.invoke(functionName, { body: testBody });
      
      // Check for errors in the response
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return { success: true, response: response.data };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Type for test result
export interface TestResult {
  testName: string;
  section: string;
  functionName: string;
  success: boolean;
  error?: string;
  duration?: number;
}

// Function to run a test and return structured results
export async function runTest(
  testName: string,
  section: string,
  supabase: SupabaseClient<Database>,
  functionName: string,
  testBody: any = {},
  directFetch: boolean = false,
  directUrl?: string
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const result = await testSupabaseFunction(
      supabase,
      functionName,
      testBody,
      directFetch,
      directUrl
    );
    
    const duration = Date.now() - startTime;
    
    return {
      testName,
      section,
      functionName,
      success: result.success,
      error: result.error,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    return {
      testName,
      section,
      functionName,
      success: false,
      error: error.message || 'Unknown error occurred',
      duration
    };
  }
}

// Function to create test documents for testing
export async function createTestDocument(
  supabase: SupabaseClient<Database>,
  userId: string,
  title: string = 'Test Document',
  content: string = '<p>This is a test document for AI integration testing.</p>'
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title,
        content
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, documentId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}