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

async function checkDemoUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  console.log("Checking demo users in Supabase...\n");

  const { data: usersData, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const demoEmails = ['demo-student@thesis.ai', 'demo-advisor@thesis.ai', 'demo-critic@thesis.ai', 'demo-admin@thesis.ai'];
  
  demoEmails.forEach(email => {
    const user = usersData?.users?.find(u => u.email === email);
    if (user) {
      console.log(`✅ ${email}: ${user.id}`);
    } else {
      console.log(`❌ ${email}: NOT FOUND`);
    }
  });

  console.log("\n\nAll auth users:");
  usersData?.users?.forEach(u => {
    console.log(`  - ${u.email}: ${u.id}`);
  });
}

checkDemoUsers().catch(console.error);
