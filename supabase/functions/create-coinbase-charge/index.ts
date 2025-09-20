// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.js' // Using shared CORS utility

const PLAN_PRICES: { [key: string]: number } = {
  pro: 499.00,
  pro_plus_advisor: 799.00,
  pro_complete: 999.00, // Added Pro Complete plan
};

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
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
    if (!user) throw new Error('Invalid JWT');

    const { planId } = await req.json();
    if (!planId || !PLAN_PRICES[planId]) {
      throw new Error('Invalid plan ID provided.');
    }

    const planPrice = PLAN_PRICES[planId];

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credit_balance')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const creditBalance = Number(profile.credit_balance || 0);
    const finalPrice = Math.max(0, planPrice - creditBalance);

    if (finalPrice <= 0) {
      // Credit covers the entire cost
      const newCreditBalance = creditBalance - planPrice;
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: planId, credit_balance: newCreditBalance })
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Log credit usage, no chargeId as no Coinbase charge was made
      const { error: logError } = await supabaseAdmin
        .from('credit_usage')
        .insert({
          user_id: user.id,
          amount_used: planPrice,
          description: `Applied to ${planId.replace('_', ' ')} subscription purchase.`,
          // source_charge_id is omitted as no external charge was created
        });
      if (logError) console.error("Failed to log credit usage:", logError.message);

      return new Response(JSON.stringify({ success: true, message: 'Upgraded using credits!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // Credit partially covers the cost
      const creditToUse = creditBalance;
      
      // @ts-ignore
      const coinbaseApiKey = Deno.env.get('COINBASE_COMMERCE_API_KEY');
      if (!coinbaseApiKey) throw new Error("The Coinbase Commerce API key (COINBASE_COMMERCE_API_KEY) is not set in your project secrets.");

      const origin = req.headers.get('origin');
      if (!origin) {
        throw new Error("Could not determine request origin for redirect URLs.");
      }

      const chargeData = {
        name: `ThesisAI Philippines - ${planId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Plan`,
        description: `Payment for one month of the ${planId} plan.`,
        local_price: {
          amount: finalPrice.toFixed(2),
          currency: 'PHP',
        },
        pricing_type: 'fixed_price',
        metadata: {
          user_id: user.id,
          plan: planId,
          credit_used: creditToUse.toFixed(2),
        },
        redirect_url: `${origin}/dashboard?upgrade=success`,
        cancel_url: `${origin}/settings/billing?upgrade=cancelled`,
      };

      const response = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': coinbaseApiKey,
          'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify(chargeData),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Coinbase API error: ${errorBody.error?.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      const chargeId = responseData.data.id; // Define chargeId here

      // Log credit usage with the actual chargeId
      if (creditToUse > 0) {
        const { error: logError } = await supabaseAdmin
          .from('credit_usage')
          .insert({
            user_id: user.id,
            amount_used: creditToUse,
            description: `Applied to ${planId.replace('_', ' ')} subscription purchase.`,
            source_charge_id: chargeId,
          });
        if (logError) console.error("Failed to log credit usage:", logError.message);
      }
      
      // Reset credit balance after use
      const { error: creditUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ credit_balance: 0 })
        .eq('id', user.id);
      if (creditUpdateError) console.error(`Failed to reset credit balance for user ${user.id}:`, creditUpdateError.message);
      

      return new Response(JSON.stringify({ hosted_url: responseData.data.hosted_url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error in create-coinbase-charge function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})