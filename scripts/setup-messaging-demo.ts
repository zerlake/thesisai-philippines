#!/usr/bin/env node
/**
 * Script to set up sample data for testing the messaging feature
 * Run with: npx ts-node scripts/setup-messaging-demo.ts
 */

import { completeSampleDataSetup } from '../src/lib/setup-sample-data';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    const users = await completeSampleDataSetup(supabaseUrl, serviceRoleKey);

    if (users) {
      console.log('\n🎉 Setup complete! You can now test the messaging feature.');
      console.log('\n📝 To test real-time messaging:');
      console.log('1. Open the app in two browser windows');
      console.log('2. Log in as student in the first window');
      console.log('3. Log in as advisor in the second window');
      console.log('4. Send messages back and forth');
      console.log('5. Messages should appear in real-time on both sides');
    } else {
      console.error('❌ Failed to set up sample data');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

main();
