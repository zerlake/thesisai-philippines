// Debug script to check database state
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  console.log('\n=== CHECKING ADVISOR STUDENT MESSAGES ===\n');

  // Check all messages
  const { data: messages, error: msgError } = await supabase
    .from('advisor_student_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (msgError) {
    console.error('Error fetching messages:', msgError);
  } else {
    console.log(`Found ${messages?.length || 0} messages:`);
    messages?.forEach(msg => {
      console.log(`  - ${msg.sender_name} → ${msg.message.substring(0, 50)}... (${msg.created_at})`);
    });
  }

  console.log('\n=== CHECKING AUTH USERS ===\n');
  
  // Get current session
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current authenticated user:', user?.id, user?.email);
}

checkDatabase().catch(console.error);
