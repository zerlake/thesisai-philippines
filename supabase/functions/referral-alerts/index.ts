// supabase/functions/referral-alerts/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Discord webhook URL
const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

interface PoolAlertPayload {
  type: 'INSERT' | 'UPDATE';
  table: string;
  record: {
    id: string;
    period_start: string;
    pool_amount: number;
    student_allocation: number;
    advisor_allocation: number;
    critic_allocation: number;
    spent_student: number;
    spent_advisor: number;
    spent_critic: number;
    status: string;
  };
}

interface ReferralAlertPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    referrer_id: string;
    referred_id: string;
    event_type: string;
    status: string;
    commission_amount: number;
    pool_allocation: string;
    created_at: string;
  };
}

interface AuditAlertPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    referral_event_id: string;
    audit_type: string;
    score: number;
    action_taken: string;
    notes: string;
    created_at: string;
  };
}

async function sendDiscordAlert(message: string) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("DISCORD_WEBHOOK_URL not set, skipping alert");
    return;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        embeds: [{
          color: 15158332, // Red color
          timestamp: new Date().toISOString(),
        }]
      }),
    });

    if (!response.ok) {
      console.error("Failed to send Discord alert:", await response.text());
    }
  } catch (error) {
    console.error("Error sending Discord alert:", error);
  }
}

async function handlePoolAlert(payload: PoolAlertPayload) {
  const { record } = payload;
  
  // Calculate utilization percentages
  const studentUtilization = record.student_allocation > 0 
    ? ((record.spent_student / record.student_allocation) * 100) 
    : 0;
    
  const advisorUtilization = record.advisor_allocation > 0 
    ? ((record.spent_advisor / record.advisor_allocation) * 100) 
    : 0;
    
  const criticUtilization = record.critic_allocation > 0 
    ? ((record.spent_critic / record.critic_allocation) * 100) 
    : 0;

  // Send alerts if utilization exceeds thresholds
  if (studentUtilization > 85) {
    await sendDiscordAlert(
      `🚨 ThesisAI Student Pool Alert\n` +
      `Utilization: ${studentUtilization.toFixed(2)}%\n` +
      `Remaining: ₱${(record.student_allocation - record.spent_student).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `Period: ${record.period_start}`
    );
  }

  if (advisorUtilization > 85) {
    await sendDiscordAlert(
      `🚨 ThesisAI Advisor Pool Alert\n` +
      `Utilization: ${advisorUtilization.toFixed(2)}%\n` +
      `Remaining: ₱${(record.advisor_allocation - record.spent_advisor).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `Period: ${record.period_start}`
    );
  }

  if (criticUtilization > 85) {
    await sendDiscordAlert(
      `🚨 ThesisAI Critic Pool Alert\n` +
      `Utilization: ${criticUtilization.toFixed(2)}%\n` +
      `Remaining: ₱${(record.critic_allocation - record.spent_critic).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `Period: ${record.period_start}`
    );
  }
}

async function handleReferralAlert(payload: ReferralAlertPayload) {
  const { record } = payload;
  
  // Check for potential fraud signals
  if (record.commission_amount > 1000) { // High commission amount
    await sendDiscordAlert(
      `⚠️ High Commission Referral Alert\n` +
      `Event Type: ${record.event_type}\n` +
      `Commission: ₱${record.commission_amount}\n` +
      `Pool Allocation: ${record.pool_allocation}\n` +
      `Created: ${record.created_at}`
    );
  }
}

async function handleAuditAlert(payload: AuditAlertPayload) {
  const { record } = payload;
  
  // Send alerts for high-risk audits
  if (record.score >= 75) {
    await sendDiscordAlert(
      `🚨 High Risk Referral Audit Alert\n` +
      `Audit Type: ${record.audit_type}\n` +
      `Score: ${record.score}/100\n` +
      `Action: ${record.action_taken}\n` +
      `Notes: ${record.notes}\n` +
      `Created: ${record.created_at}`
    );
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // Handle different types of alerts
    if (payload.table === 'recruitment_pool') {
      await handlePoolAlert(payload as PoolAlertPayload);
    } else if (payload.table === 'referral_events') {
      await handleReferralAlert(payload as ReferralAlertPayload);
    } else if (payload.table === 'referral_audits') {
      await handleAuditAlert(payload as AuditAlertPayload);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Alert processed" }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing alert:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});