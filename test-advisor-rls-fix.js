// Test script to verify advisor RLS policies are working
// This tests the fix for the 403 Forbidden error

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdvisorRLS() {
  console.log('Testing advisor RLS fix...\n');

  // Test 1: Check if advisor_requests table is accessible
  console.log('1. Testing advisor_requests table access...');
  try {
    const { data, error } = await supabase
      .from('advisor_requests')
      .select('id, status, advisor_email')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Error accessing advisor_requests:', error.message);
    } else {
      console.log('   ✅ advisor_requests table is accessible');
      console.log(`   Retrieved ${data.length} records`);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err.message);
  }

  // Test 2: Check if profiles table is publicly readable
  console.log('\n2. Testing profiles table access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Error accessing profiles:', error.message);
    } else {
      console.log('   ✅ profiles table is accessible');
      console.log(`   Retrieved ${data.length} records`);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err.message);
  }

  // Test 3: Check if critic_requests table works (same fix applied)
  console.log('\n3. Testing critic_requests table access...');
  try {
    const { data, error } = await supabase
      .from('critic_requests')
      .select('id, status, critic_email')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Error accessing critic_requests:', error.message);
    } else {
      console.log('   ✅ critic_requests table is accessible');
      console.log(`   Retrieved ${data.length} records`);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err.message);
  }

  console.log('\n✅ RLS fix verification complete');
  console.log('\nNext steps:');
  console.log('1. Log in as an advisor account');
  console.log('2. Navigate to /dashboard');
  console.log('3. Check that "Student Requests" card no longer shows 403 error');
  console.log('4. Verify pending requests are displayed');
}

testAdvisorRLS().catch(console.error);
