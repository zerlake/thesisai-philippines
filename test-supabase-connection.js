// Simple Supabase connection test
import { createClient } from '@supabase/supabase-js';

// Use the same values as your app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Test by fetching the current session (doesn't require auth)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session fetch successful:', session ? 'Has session' : 'No session');
    }
    
    // Test by attempting to query a table (will fail without auth but will test connection)
    const { data, error } = await supabase
      .from('profiles') // Test with profiles table
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error.message, error.code);
    } else {
      console.log('Connection test successful - can reach database');
      console.log('Sample profile ID:', data[0]?.id);
    }
  } catch (err) {
    console.error('Network error during connection test:', err);
  }
}

testConnection();