// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getCorsHeaders } from '../_shared/cors.ts';

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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    const { text } = await req.json()
    if (!text) throw new Error('Text is required')

    // Check against existing documents in database
    const { data: existingDocs } = await supabaseAdmin
      .from('documents')
      .select('content')
      .neq('user_id', user.id)

    let highestSimilarity = 0
    
    if (existingDocs && existingDocs.length > 0) {
      // Simple similarity check
      const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '')
      for (const doc of existingDocs) {
        if (doc.content) {
          const docText = doc.content.toLowerCase().replace(/[^a-z0-9\s]/g, '')
          const words1 = new Set(cleanText.split(/\s+/).filter(Boolean))
          const words2 = new Set(docText.split(/\s+/).filter(Boolean))
          
          const intersection = [...words1].filter(word => words2.has(word)).length
          const union = new Set([...words1, ...words2]).size
          
          const similarity = union > 0 ? intersection / union : 0
          highestSimilarity = Math.max(highestSimilarity, similarity)
        }
      }
    }

    return new Response(JSON.stringify({ 
      similarity: highestSimilarity,
      isOriginal: highestSimilarity < 0.3 // Below 30% similarity considered original
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in check-originality function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(Boolean))
  const words2 = new Set(text2.split(/\s+/).filter(Boolean))
  
  const intersection = [...words1].filter(word => words2.has(word)).length
  const union = new Set([...words1, ...words2]).size
  
  return union > 0 ? intersection / union : 0
}