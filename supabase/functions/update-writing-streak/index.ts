// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.js' // Corrected import path

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

    // 1. Authenticate the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    // 2. Get current profile data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('writing_streak, last_writing_day')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day in UTC

    const lastWritingDay = profile.last_writing_day ? new Date(profile.last_writing_day) : null;
    if (lastWritingDay) {
        lastWritingDay.setHours(0, 0, 0, 0); // Normalize
    }

    let newStreak = profile.writing_streak || 0;

    if (lastWritingDay) {
      const diffTime = today.getTime() - lastWritingDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Last write was yesterday, increment streak
        newStreak++;
      } else if (diffDays > 1) {
        // Last write was before yesterday, reset streak
        newStreak = 1;
      }
      // If diffDays is 0, do nothing, streak is maintained.
    } else {
      // First time writing
      newStreak = 1;
    }

    // 3. Update the profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        writing_streak: newStreak,
        last_writing_day: today.toISOString().split('T')[0], // Store as YYYY-MM-DD
      })
      .eq('id', user.id)

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'Streak updated successfully', newStreak }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in update-writing-streak function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})