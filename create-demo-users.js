const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Simple .env loader
function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
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

// Load .env.local
const envConfig = loadEnvFile(".env.local");
Object.assign(process.env, envConfig);

async function createMissingDemoUsers() {
  // Use environment variables from process.env (which .env.local loads)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
    console.error("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey);
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Define the demo users
  const demoUsers = [
    {
      email: 'demo-student@thesis.ai',
      role: 'student',
      first_name: 'Student',
    },
    {
      email: 'demo-advisor@thesis.ai',
      role: 'advisor',
      first_name: 'Advisor',
    },
    {
      email: 'demo-critic@thesis.ai',
      role: 'critic', 
      first_name: 'Critic',
    },
    {
      email: 'demo-admin@thesis.ai',
      role: 'admin',
      first_name: 'Admin',
    }
  ];

  console.log("Creating/verifying demo users in Supabase...");

  for (const user of demoUsers) {
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
  
  console.log("\nDemo users setup complete!");
}

// Run the function
createMissingDemoUsers().catch(console.error);
