const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

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

const envConfig = loadEnvFile(".env.local");
Object.assign(process.env, envConfig);

async function checkProfiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  console.log("Checking profiles and their roles...\n");

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, email, role, first_name, last_name')
    .in('email', ['demo-student@thesis.ai', 'demo-advisor@thesis.ai', 'demo-critic@thesis.ai', 'demo-admin@thesis.ai']);

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.log("No profiles found!");
    return;
  }

  console.log("Profiles with roles:");
  data.forEach(p => {
    console.log(`  ${p.email.padEnd(28)} | Role: ${(p.role || 'NULL').padEnd(10)} | Name: ${p.first_name} ${p.last_name}`);
  });

  // Check for any with role = 'user' (default) instead of correct role
  const wrongRoles = data.filter(p => p.role === 'user' || !p.role);
  if (wrongRoles.length > 0) {
    console.log("\n⚠️  Profiles with wrong/missing roles:");
    wrongRoles.forEach(p => {
      console.log(`  - ${p.email}: role='${p.role || 'NULL'}'`);
    });
  }
}

checkProfiles().catch(console.error);
