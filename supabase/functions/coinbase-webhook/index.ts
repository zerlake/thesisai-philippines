// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0' // Fixed: Added 'from'
// @ts-ignore
import { crypto } from "https://deno.land/std@0.159.0/crypto/mod.ts";

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    Deno.env.get('NEXT_PUBLIC_APP_BASE_URL') || 'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
  };
}

async function verifySignature(secret: string, payload: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hexSignature = Array.from(new Uint8Array(signedPayload))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  return hexSignature === signature;
}

// Security utilities
function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

function validatePlan(plan: string): string {
  if (!plan || typeof plan !== 'string') {
    throw new Error('Plan must be a string');
  }
  const validPlans = ['free', 'basic', 'pro', 'premium', 'enterprise'];
  const normalized = plan.toLowerCase().trim();
  if (!validPlans.includes(normalized)) {
    throw new Error(`Invalid plan. Allowed plans: ${validPlans.join(', ')}`);
  }
  return normalized;
}

function validateAmount(amount: unknown): number {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Amount must be a valid number');
  }
  if (num < 0) {
    throw new Error('Amount must be non-negative');
  }
  return num;
}

interface CoinbaseEvent {
  type: string;
  data: {
    id: string;
    metadata: {
      user_id: string;
      plan: string;
      credit_used?: string;
    };
    pricing: {
      local: {
        amount: string;
      };
    };
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Get secret from environment variables
    // @ts-ignore
    const webhookSecret = Deno.env.get("COINBASE_COMMERCE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("COINBASE_COMMERCE_WEBHOOK_SECRET is not set.");
    }

    // 2. Verify the webhook signature
    const signature = req.headers.get('X-CC-Webhook-Signature');
    const body = await req.text();
    
    if (!signature) {
      throw new Error("Webhook signature is missing.");
    }

    const isValid = await verifySignature(webhookSecret, body, signature);
    if (!isValid) {
      throw new Error("Webhook signature is invalid.");
    }

    // 3. Process the event
    const event = JSON.parse(body).event as CoinbaseEvent;
    console.log(`Received Coinbase event: ${event.type}`);

    if (event.type === 'charge:confirmed') {
      const metadata = event.data.metadata;
      const userId = metadata.user_id;
      const plan = metadata.plan;
      const chargeAmount = parseFloat(event.data.pricing.local.amount);
      const chargeId = event.data.id;
      const creditUsed = parseFloat(metadata.credit_used || '0');

      // Validate all inputs
      if (!validateUserId(userId)) {
        throw new Error("Invalid user_id format in webhook metadata.");
      }

      const validatedPlan = validatePlan(plan);
      const validatedAmount = validateAmount(chargeAmount);
      const validatedCredit = validateAmount(creditUsed);

      // 4. Create an admin client to update user data
      const supabaseAdmin = createClient(
        // @ts-ignore
        Deno.env.get('SUPABASE_URL') ?? '',
        // @ts-ignore
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // 5. Update the user's profile with their new plan
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: validatedPlan })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Failed to update profile for user ${userId}: ${updateError.message}`);
      }
      console.log(`Successfully upgraded user ${userId} to plan ${plan}.`);

      // 6. Handle credit usage if any was applied
      if (validatedCredit > 0) {
        const { error: creditUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ credit_balance: 0 }) // All remaining credit was used
          .eq('id', userId);
        if (creditUpdateError) console.error(`Failed to reset credit balance for user ${userId}:`, creditUpdateError.message);

        const { error: logError } = await supabaseAdmin
          .from('credit_usage')
          .insert({
            user_id: userId,
            amount_used: validatedCredit,
            description: `Applied to ${validatedPlan.replace('_', ' ')} subscription purchase.`,
            source_charge_id: chargeId,
          });
        if (logError) console.error(`Failed to log credit usage for user ${userId}:`, logError.message);
        console.log(`Logged ${validatedCredit} credit usage for user ${userId}.`);
      }

      // 7. Distribute referral credits based on the cash amount paid
      const { error: referralError } = await supabaseAdmin.rpc('distribute_referral_credits', {
        p_user_id: userId,
        p_charge_amount: validatedAmount,
        p_source_charge_id: chargeId
      });

      if (referralError) {
        console.error(`Failed to distribute referral credits for user ${userId}:`, referralError.message);
      } else {
        console.log(`Successfully processed referral credits for user ${userId}.`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in Coinbase webhook handler:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})