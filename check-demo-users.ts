import { createClient } from "@supabase/supabase-js";
import * as fs from 'fs';
import * as path from 'path';

// Simple .env file parser
function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  content.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        const keyTrimmed = key.trim();
        let value = valueParts.join('=').trim();

        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }

        env[keyTrimmed] = value;
      }
    }
  });

  return env;
}

async function checkDemoUsers() {
  // Load environment variables from .env.local
  const env = parseEnvFile('./.env.local');

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration");
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!serviceRoleKey);
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const demoEmails = [
    'demo-student@thesis.ai',
    'demo-advisor@thesis.ai',
    'demo-critic@thesis.ai',
    'demo-admin@thesis.ai'
  ];

  console.log("Checking for demo users in Supabase...");

  try {
    const { data: usersData, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (error) {
      console.error("Error listing users:", error);
      return;
    }

    console.log(`Total users in system: ${usersData?.users?.length || 0}`);

    for (const email of demoEmails) {
      const user = usersData?.users?.find(u => u.email === email);
      if (user) {
        console.log(`✅ Demo user found: ${email} (ID: ${user.id})`);
        console.log(`   Role: ${user.user_metadata?.role || 'unknown'}`);
        console.log(`   Created: ${user.created_at}`);
      } else {
        console.log(`❌ Demo user not found: ${email}`);
      }
    }
  } catch (error) {
    console.error("Error checking demo users:", error);
  }
}

// Run the check
checkDemoUsers().catch(console.error);