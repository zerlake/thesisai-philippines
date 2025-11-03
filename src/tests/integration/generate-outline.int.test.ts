
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from openrouter.env
dotenv.config({ path: path.resolve(process.cwd(), 'openrouter.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

// Conditional describe block
const describeIf = (condition: boolean) => condition ? describe : describe.skip;

const areCredentialsSet = supabaseUrl && supabaseServiceKey && openRouterApiKey;

// We will skip this test suite if the necessary credentials are not set.
describeIf(!!areCredentialsSet)('generate-outline integration test', () => {
  if (!areCredentialsSet) {
    console.warn("Skipping integration test: Supabase or OpenRouter credentials are not set in openrouter.env");
    return;
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  it('should call the generate-outline function and receive a valid outline from OpenRouter', async () => {
    const prompt = 'A brief history of artificial intelligence';

    const { data, error } = await supabase.functions.invoke('generate-outline', {
      body: { prompt },
    });

    // Check for function invocation errors
    expect(error).toBeNull();

    // Check for errors returned by the function itself
    if (data && data.error) {
      console.error('Function returned an error:', data.error);
    }
    expect(data.error).toBeUndefined();

    // Check the data returned from the function
    try {
      expect(data).toBeDefined();
      expect(typeof data.outline).toBe('string');
      expect(data.outline.length).toBeGreaterThan(50); // Expect a reasonably long outline
    } catch (e) {
      console.error("Test assertion failed. Received data:", JSON.stringify(data, null, 2));
      throw e;
    }

    console.log(`Successfully received outline starting with: "${data.outline.substring(0, 100)}..."`);
  }, 120000); // Jest timeout for this specific test
});

// Dummy test to ensure the file is not empty if credentials are not set
describeIf(!areCredentialsSet)('generate-outline integration test placeholder', () => {
    it('skips integration tests because credentials are not set', () => {
        console.warn("Skipping generate-outline integration test because SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENROUTER_API_KEY are not set in openrouter.env");
        expect(true).toBe(true);
    });
});
