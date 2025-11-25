// supabase/functions/paraphrase-text/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Missing text parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Puter auth token from header
    const puterAuthToken = req.headers.get("X-Puter-Auth");
    
    if (!puterAuthToken) {
      return new Response(
        JSON.stringify({ error: "Missing X-Puter-Auth header" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Construct prompt based on mode
    let prompt = '';
    switch (mode) {
      case 'formal':
        prompt = `You are an expert academic editor. Your task is to rewrite the following text to make it more formal and suitable for a thesis.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text, with no additional comments or explanations.

Original text: "${text}"

Formal text:`;
        break;

      case 'simple':
        prompt = `You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text, with no additional comments or explanations.

Original text: "${text}"

Simplified text:`;
        break;

      case 'expand':
        prompt = `You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be slightly longer but not excessively so.
- Maintain a consistent academic tone.
- Return only the expanded text, with no additional comments or explanations.

Original text: "${text}"

Expanded text:`;
        break;

      case 'standard':
      default:
        prompt = `You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text, with no additional comments or explanations.

Original text: "${text}"

Paraphrased text:`;
    }

    // Call Puter AI via HTTP (since we can't use the SDK in Edge Functions)
    const puterResponse = await fetch(Deno.env.get("PUTER_API_ENDPOINT") || "https://api.puter.com/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${puterAuthToken}`,
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Read response body once
    const responseText = await puterResponse.text();

    if (!puterResponse.ok) {
      let errorMessage = "Puter AI service failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Not JSON, use raw text
        errorMessage = responseText || `HTTP ${puterResponse.status}`;
      }
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: puterResponse.status 
        }),
        { 
          status: puterResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid response from Puter AI" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Extract text from Puter response
    let paraphrasedText = '';
    if (typeof result === 'string') {
      paraphrasedText = result.trim();
    } else if (result && typeof result === 'object') {
      paraphrasedText = 
        result.choices?.[0]?.message?.content?.trim() ||
        result.choices?.[0]?.text?.trim() ||
        result.response?.trim() ||
        result.text?.trim() ||
        result.content?.trim() ||
        '';
    }

    if (!paraphrasedText) {
      return new Response(
        JSON.stringify({ error: "AI returned empty response" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ paraphrasedText }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in paraphrase function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
