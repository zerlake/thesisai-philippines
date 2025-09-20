// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.js' // Corrected import path

interface RequestBody {
  student_email: string;
}

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

    // 2. Verify advisor role and get their profile
    const { data: advisorProfile, error: advisorError } = await supabaseAdmin
      .from('profiles')
      .select('role, free_student_slots, first_name, last_name')
      .eq('id', advisorUser.id)
      .single()
    if (advisorError || !advisorProfile || advisorProfile.role !== 'advisor') {
      throw new Error('Forbidden: Not an advisor');
    }

    // 3. Get student email and find their profile
    const { student_email } = await req.json() as RequestBody;
    if (!student_email) throw new Error('Student email is required.')

    const { data: studentUser, error: studentUserError } = await supabaseAdmin.auth.admin.getUserByEmail(student_email);
    if (studentUserError || !studentUser.user) throw new Error('Student not found with this email.');

    const { data: studentProfile, error: studentError } = await supabaseAdmin
      .from('profiles')
      .select('id, plan')
      .eq('id', studentUser.user.id)
      .single()
    if (studentError || !studentProfile) throw new Error('Student profile not found.')

    // 4. Check for existing relationship
    const { data: existingRel, error: relError } = await supabaseAdmin
      .from('advisor_student_relationships')
      .select('id')
      .eq('advisor_id', advisorUser.id)
      .eq('student_id', studentProfile.id)
      .maybeSingle()
    if (relError) throw relError;
    if (existingRel) throw new Error('You are already advising this student.');

    // 5. Check for slots/plan
    const studentHasPaidPlan = studentProfile.plan === 'pro_plus_advisor';
    const advisorHasFreeSlots = advisorProfile.free_student_slots > 0;
    if (!studentHasPaidPlan && !advisorHasFreeSlots) {
      throw new Error("You are out of free student slots. The student must upgrade to a 'Pro + Advisor' plan for you to connect.");
    }

    // 6. Create relationship and update slots if necessary
    const { error: insertError } = await supabaseAdmin
      .from('advisor_student_relationships')
      .insert({ advisor_id: advisorUser.id, student_id: studentProfile.id })
    if (insertError) throw insertError;

    if (!studentHasPaidPlan && advisorHasFreeSlots) {
      const { error: decrementError } = await supabaseAdmin
        .from('profiles')
        .update({ free_student_slots: advisorProfile.free_student_slots - 1 })
        .eq('id', advisorUser.id)
      if (decrementError) throw decrementError;
    }

    // 7. Notify the student
    const advisorName = `${advisorProfile.first_name || ''} ${advisorProfile.last_name || 'An advisor'}`.trim();
    await supabaseAdmin.from('notifications').insert({
        user_id: studentProfile.id,
        actor_id: advisorUser.id,
        type: 'advisor_added_student',
        message: `${advisorName} has added you as their advisee.`,
        link: '/settings'
    });

    return new Response(JSON.stringify({ message: 'Student invited successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in advisor-invite-student function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})