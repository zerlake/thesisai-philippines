// Verify the actual demo users in the database with their IDs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');

  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/['"]+/g, '');
      process.env[key.trim()] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase environment variables not set');
  process.exit(1);
}

// Create admin client to access auth tables
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkDemoUsers() {
  console.log('Checking demo users in database...\n');

  try {
    // Check each demo user individually using admin API
    const demoEmails = [
      'demo-student@thesis.ai',
      'demo-advisor@thesis.ai',
      'demo-critic@thesis.ai',
      'demo-admin@thesis.ai'
    ];

    console.log('Found demo users:');
    for (const email of demoEmails) {
      try {
        const { data, error } = await adminClient.auth.admin.getUserByEmail(email);

        if (error) {
          if (error.message.includes('User not found')) {
            console.log(`  - ${email}: NOT FOUND`);
          } else {
            console.log(`  - ${email}: ERROR - ${error.message}`);
          }
        } else {
          console.log(`  - ${email}: ${data.user.id}`);
          console.log(`    Confirmed: ${data.user.email_confirmed_at ? 'YES' : 'NO'}`);
          console.log(`    Created: ${data.user.created_at}`);
          console.log(`    Updated: ${data.user.updated_at}`);
        }

        console.log('');
      } catch (fetchError) {
        console.log(`  - ${email}: FETCH ERROR - ${fetchError.message}`);
        console.log('');
      }
    }

    console.log('\nExpected UUIDs from the migration:');
    console.log('  - demo-student@thesis.ai: 6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7');
    console.log('  - demo-advisor@thesis.ai: ff79d401-5614-4de8-9f17-bc920f360dcf');
    console.log('  - demo-critic@thesis.ai:  14a7ff7d-c6d2-4b27-ace1-32237ac28e02');
    console.log('  - demo-admin@thesis.ai:   7f22dff0-b8a9-4e08-835f-2a79dba9e6f7');
  } catch (error) {
    console.error('Error in checkDemoUsers:', error);
  }
}

checkDemoUsers().catch(console.error);