import { createClient } from "@supabase/supabase-js";
import { readFileSync } from 'fs';

// Simple .env file parser
function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  
  content.split('\n').forEach((line: string) => {
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

async function createMissingDemoUsers() {
  // Load environment variables from .env.local
  const env = parseEnvFile('./.env.local');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration");
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Define the missing demo users
  const missingUsers = [
    {
      email: 'demo-advisor@thesis.ai',
      role: 'advisor',
      first_name: 'Advisor',
      // Expected UUID: ff79d401-5614-4de8-9f17-bc920f360dcf
    },
    {
      email: 'demo-critic@thesis.ai',
      role: 'critic', 
      first_name: 'Critic',
      // Expected UUID: 14a7ff7d-c6d2-4b27-ace1-32237ac28e02
    }
  ];

  console.log("Creating missing demo users in Supabase...");

  for (const user of missingUsers) {
    try {
      // Check if user already exists
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (listError) {
        console.error(`Error listing users when checking ${user.email}:`, listError);
        continue;
      }

      const existingUser = usersData?.users?.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`✅ ${user.email} already exists: ${existingUser.id}`);
        continue;
      }

      // Create the user
      console.log(`Creating user: ${user.email}`);
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: 'demo123456', // Default demo password
        email_confirm: true,
        user_metadata: {
          role: user.role,
          first_name: user.first_name,
          last_name: 'Demo User',
          plan: 'demo',
          isDemoAccount: true,
        },
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        }
      });

      if (createError) {
        console.error(`❌ Error creating ${user.email}:`, createError);
      } else {
        console.log(`✅ Successfully created ${user.email}:`, userData?.user?.id);

        // Create profile record in the profiles table
        if (userData?.user?.id) {
          const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
              id: userData.user.id,
              role: user.role,
              first_name: user.first_name,
              last_name: 'Demo User',
              email: user.email,
              plan: 'demo',
              avatar_url: null,
              updated_at: new Date().toISOString(),
              isDemoAccount: true
            }, { onConflict: 'id' });

          if (profileError) {
            console.error(`Error creating profile for ${user.email}:`, profileError);
          } else {
            console.log(`   ✅ Profile created for ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }
}

// Run the function
createMissingDemoUsers().catch(console.error);