// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    const { action, ...payload } = await req.json()

    if (action === 'create') {
      const { advisor_email } = payload;
      if (!advisor_email) throw new Error("Advisor email is required.");

      // Check if advisor exists and has the correct role
      const { data: advisorUser } = await supabaseAdmin.auth.admin.getUserByEmail(advisor_email);
      if (!advisorUser || !advisorUser.user) throw new Error("No advisor found with this email.");
      
      const { data: advisorProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', advisorUser.user.id).single();
      if (!advisorProfile || advisorProfile.role !== 'advisor') throw new Error("This user is not registered as an advisor.");

      // Create the request
      const { error } = await supabaseAdmin.from('advisor_requests').insert({ student_id: user.id, advisor_email });
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Request sent successfully' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'accept' || action === 'decline') {
      const { request_id } = payload;
      if (!request_id) throw new Error("Request ID is required.");

      // Verify the user is the intended advisor
      const { data: request, error: requestError } = await supabaseAdmin.from('advisor_requests').select('*').eq('id', request_id).single();
      if (requestError || !request) throw new Error("Request not found.");
      if (user.email !== request.advisor_email) throw new Error("You are not authorized to respond to this request.");

      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      
      if (newStatus === 'accepted') {
        const { data: advisorProfile, error: advisorProfileError } = await supabaseAdmin.from('profiles').select('id, free_student_slots').eq('id', user.id).single();
        if (advisorProfileError || !advisorProfile) throw new Error("Advisor profile not found.");

        const { data: studentProfile, error: studentProfileError } = await supabaseAdmin.from('profiles').select('plan').eq('id', request.student_id).single();
        if (studentProfileError || !studentProfile) throw new Error("Student profile not found.");

        const studentHasPaidPlan = studentProfile.plan === 'pro_plus_advisor';
        const advisorHasFreeSlots = advisorProfile.free_student_slots > 0;

        if (!studentHasPaidPlan && !advisorHasFreeSlots) {
          throw new Error("Cannot accept request. The student must upgrade to a 'Pro + Advisor' plan, or you must have free slots available.");
        }

        if (!studentHasPaidPlan && advisorHasFreeSlots) {
          const { error: decrementError } = await supabaseAdmin.from('profiles').update({ free_student_slots: advisorProfile.free_student_slots - 1 }).eq('id', user.id);
          if (decrementError) throw new Error("Failed to update advisor's free slots.");
        }
        
        await supabaseAdmin.from('advisor_student_relationships').delete().eq('student_id', request.student_id);
        const { error: insertError } = await supabaseAdmin.from('advisor_student_relationships').insert({ student_id: request.student_id, advisor_id: advisorProfile.id });
        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabaseAdmin.from('advisor_requests').update({ status: newStatus }).eq('id', request_id);
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ message: `Request ${newStatus}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in manage-advisor-request function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})