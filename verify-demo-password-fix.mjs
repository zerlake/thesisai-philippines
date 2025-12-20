// This script tests if the direct SQL password fix works
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email, password) {
  console.log(`Testing login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
    return false;
  } else {
    console.log(`  ✓ SUCCESS: ${data.session ? 'Session created' : 'No session data'}`);
    await supabase.auth.signOut(); // Clean up
    return true;
  }
}

async function main() {
  console.log('Testing demo users with expected password (demo123456):\n');
  
  const testUsers = [
    'demo-student@thesis.ai',
    'demo-advisor@thesis.ai', 
    'demo-critic@thesis.ai',
    'demo-admin@thesis.ai'
  ];
  
  for (const email of testUsers) {
    await testLogin(email, 'demo123456');
  }
  
  console.log('\nIf these tests fail, the SQL script needs to be run in Supabase to fix the passwords.');
}

main().catch(console.error);