// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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

interface RequestBody {
  action: 'create_doc' | 'update_doc' | 'delete_doc' | 'create_guide' | 'update_guide' | 'delete_guide' | 'create_faq' | 'update_faq' | 'delete_faq';
  data: any;
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

    // 1. Admin check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (callerError || !callerProfile || callerProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, data } = await req.json() as RequestBody;

    let result;
    switch (action) {
      case 'create_doc':
        result = await supabaseAdmin
          .from('onboarding_documentation')
          .insert({
            title: data.title,
            slug: data.slug,
            content: data.content,
            category: data.category,
            status: data.status,
            author_id: user.id
          })
          .select()
          .single();
        break;

      case 'update_doc':
        result = await supabaseAdmin
          .from('onboarding_documentation')
          .update({
            title: data.title,
            slug: data.slug,
            content: data.content,
            category: data.category,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single();
        break;

      case 'delete_doc':
        result = await supabaseAdmin
          .from('onboarding_documentation')
          .delete()
          .eq('id', data.id);
        break;

      case 'create_guide':
        result = await supabaseAdmin
          .from('onboarding_guides')
          .insert({
            title: data.title,
            slug: data.slug,
            content: data.content,
            section: data.section,
            status: data.status,
            author_id: user.id
          })
          .select()
          .single();
        break;

      case 'update_guide':
        result = await supabaseAdmin
          .from('onboarding_guides')
          .update({
            title: data.title,
            slug: data.slug,
            content: data.content,
            section: data.section,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single();
        break;

      case 'delete_guide':
        result = await supabaseAdmin
          .from('onboarding_guides')
          .delete()
          .eq('id', data.id);
        break;

      case 'create_faq':
        result = await supabaseAdmin
          .from('onboarding_faqs')
          .insert({
            question: data.question,
            answer: data.answer,
            category: data.category,
            author_id: user.id
          })
          .select()
          .single();
        break;

      case 'update_faq':
        result = await supabaseAdmin
          .from('onboarding_faqs')
          .update({
            question: data.question,
            answer: data.answer,
            category: data.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single();
        break;

      case 'delete_faq':
        result = await supabaseAdmin
          .from('onboarding_faqs')
          .delete()
          .eq('id', data.id);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (result.error) {
      throw result.error;
    }

    return new Response(JSON.stringify({ 
      message: `Content ${action.split('_')[0]}d successfully`, 
      data: result.data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in manage-onboarding-content function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})