// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.js' // Using shared CORS utility

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Authenticate the advisor
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user: advisorUser } } = await supabaseAdmin.auth.getUser(jwt)
    if (!advisorUser) throw new Error('Invalid JWT')

    // 2. Get student_id from payload
    const { student_id } = await req.json()
    if (!student_id) throw new Error('Student ID is required.')

    // 3. Verify relationship (SECURITY CHECK)
    const { data: relationship, error: relError } = await supabaseAdmin
      .from('advisor_student_relationships')
      .select('id')
      .eq('advisor_id', advisorUser.id)
      .eq('student_id', student_id)
      .single()

    if (relError || !relationship) {
      throw new Error('You are not authorized to send a reminder to this student.')
    }

    // 4. Get advisor's name
    const { data: advisorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', advisorUser.id)
      .single()
    
    if (profileError) throw profileError;
    const advisorName = `${advisorProfile.first_name || ''} ${advisorProfile.last_name || 'Your advisor'}`.trim();

    // 5. Insert notification
    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: student_id,
        actor_id: advisorUser.id,
        type: 'milestone_reminder',
        message: `${advisorName} sent you a reminder to check on your overdue milestones.`,
        link: '/dashboard'
      })
    
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'Reminder sent successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in send-reminder-notification function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})