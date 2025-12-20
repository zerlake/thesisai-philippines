import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const listAllDemoUsers = async () => {
  console.log("Listing all demo users from auth.users...");

  const { data: usersData, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const demoUsers = usersData?.users?.filter(u => u.email?.includes('demo')) || [];
  console.log("\nFound demo users:");
  demoUsers.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  });

  if (demoUsers.length === 0) {
    console.log("  (none found)");
  }

  console.log("\nChecking specific emails:");
  const emails = ["demo-student@thesis.ai", "demo-advisor@thesis.ai", "demo-critic@thesis.ai", "demo-admin@thesis.ai"];
  
  for (const email of emails) {
    const user = usersData?.users?.find(u => u.email === email);
    if (user) {
      console.log(`  ✓ ${email} exists`);
    } else {
      console.log(`  ✗ ${email} NOT FOUND`);
    }
  }
};

listAllDemoUsers().catch(console.error);
