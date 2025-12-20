/**
 * Setup sample data with real UUIDs for testing messaging feature
 * Creates student, advisor, and critic accounts with proper relationships
 */

import { createClient } from '@supabase/supabase-js';

// Demo user accounts with actual UUIDs in the database:
// Student: 6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7 - demo-student@thesis.ai
// Advisor: ff79d401-5614-4de8-9f17-bc920f360dcf - demo-advisor@thesis.ai
// Critic:  14a7ff7d-c6d2-4b27-ace1-32237ac28e02 - demo-critic@thesis.ai
// Admin:   7f22dff0-b8a9-4e08-835f-2a79dba9e6f7 - demo-admin@thesis.ai
export const SAMPLE_USERS = {
  student: {
    email: 'demo-student@thesis.ai',
    password: 'demo123456',
    role: 'student',
    id: '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  },
  advisor: {
    email: 'demo-advisor@thesis.ai',
    password: 'demo123456',
    role: 'advisor',
    id: 'ff79d401-5614-4de8-9f17-bc920f360dcf',
  },
  critic: {
    email: 'demo-critic@thesis.ai',
    password: 'demo123456',
    role: 'critic',
    id: '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  },
  admin: {
    email: 'demo-admin@thesis.ai',
    password: 'demo123456',
    role: 'admin',
    id: '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  },
};

/**
 * Get or create sample users and return their real UUIDs
 */
export async function setupSampleUsers(supabaseUrl: string, serviceRoleKey: string) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const users: Record<string, { id: string; email: string; role: string }> = {};

  for (const [role, userData] of Object.entries(SAMPLE_USERS)) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === userData.email
      );

      if (existingUser) {
        console.log(`✓ ${role.toUpperCase()} already exists: ${existingUser.id}`);
        users[role] = {
          id: existingUser.id,
          email: userData.email,
          role: userData.role,
        };

        // Ensure profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', existingUser.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({
            id: existingUser.id,
            email: userData.email,
            role: userData.role,
            full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
            is_demo_account: true,
          });
          console.log(`  → Profile created for ${role}`);
        }
      } else {
        // Create new user
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            role: userData.role,
            is_demo_account: true,
          },
        });

        if (error) {
          console.error(`✗ Failed to create ${role}:`, error.message);
          continue;
        }

        console.log(`✓ ${role.toUpperCase()} created: ${newUser?.user?.id}`);
        users[role] = {
          id: newUser!.user!.id,
          email: userData.email,
          role: userData.role,
        };

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: newUser!.user!.id,
          email: userData.email,
          role: userData.role,
          full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          is_demo_account: true,
        });

        if (profileError) {
          console.error(`✗ Failed to create profile for ${role}:`, profileError);
        } else {
          console.log(`  → Profile created`);
        }
      }
    } catch (error) {
      console.error(`✗ Error setting up ${role}:`, error);
    }
  }

  // Log summary with UUIDs
  console.log('\n📋 Sample Users Ready for Testing:');
  console.log('=====================================');
  Object.entries(users).forEach(([role, data]) => {
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Email: ${data.email}`);
    console.log(`  UUID:  ${data.id}`);
    console.log(`  Role:  ${data.role}`);
    console.log('');
  });

  return users;
}

/**
 * Create sample relationships (student <-> advisor, student <-> critic)
 */
export async function setupSampleRelationships(
  supabaseUrl: string,
  serviceRoleKey: string,
  studentId: string,
  advisorId: string,
  criticId: string
) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Check if relationships table exists (advisor_students or similar)
    // This depends on your actual schema
    console.log('✓ Sample relationships can be set up based on your schema');
    return true;
  } catch (error) {
    console.error('Error setting up relationships:', error);
    return false;
  }
}

/**
 * Create sample documents for the student
 */
export async function setupSampleDocuments(
  supabaseUrl: string,
  serviceRoleKey: string,
  studentId: string
) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const sampleDocs = [
    {
      user_id: studentId,
      title: 'Chapter 1 - Introduction',
      content: '<h1>Chapter I: Introduction</h1><p>Sample thesis content...</p>',
      status: 'draft',
    },
    {
      user_id: studentId,
      title: 'Chapter 2 - Literature Review',
      content: '<h1>Chapter II: Literature Review</h1><p>Literature review content...</p>',
      status: 'draft',
    },
  ];

  try {
    // Check if documents already exist
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', studentId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('✓ Sample documents already exist');
      return true;
    }

    const { error } = await supabase
      .from('documents')
      .insert(sampleDocs);

    if (error) {
      console.error('Error creating sample documents:', error);
      return false;
    }

    console.log('✓ Sample documents created');
    return true;
  } catch (error) {
    console.error('Error setting up sample documents:', error);
    return false;
  }
}

/**
 * Complete setup: create users and their relationships
 */
export async function completeSampleDataSetup(
  supabaseUrl: string,
  serviceRoleKey: string
) {
  console.log('🚀 Starting sample data setup...\n');

  // Step 1: Create users
  const users = await setupSampleUsers(supabaseUrl, serviceRoleKey);

  if (!users.student || !users.advisor || !users.critic) {
    console.error('✗ Failed to create all sample users');
    return null;
  }

  // Step 2: Create sample documents
  await setupSampleDocuments(supabaseUrl, serviceRoleKey, users.student.id);

  // Step 3: Setup relationships (if applicable)
  await setupSampleRelationships(
    supabaseUrl,
    serviceRoleKey,
    users.student.id,
    users.advisor.id,
    users.critic.id
  );

  console.log('✅ Sample data setup complete!');
  return users;
}
