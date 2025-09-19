// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

async function generateQuestionsWithGemini(textContent: string, apiKey: string) {
  const prompt = `
    You are an expert thesis defense panelist at a top Philippine university. Your task is to analyze the following text from a student's thesis (e.g., an abstract or chapter summary) and generate a list of 10 challenging and insightful questions that a panel would likely ask during an oral defense.

    Use the following list of real-world questions as a model for the style, depth, and range of questions you should generate. Your questions should be tailored to the provided thesis text but reflect the critical thinking demonstrated in these examples.

    ---
    MODEL QUESTIONS:

    **Introduction & Rationale**
    - What motivated you to choose this research topic?
    - Why is this research important or relevant today in the Philippine context?
    - How does your research align with current gaps in the literature?

    **Literature Review & Theoretical Framework**
    - What are the most influential studies or theories that guided your work?
    - How does your research contribute to, contradict, or build upon previous studies?
    - Can you explain your conceptual or theoretical framework and why you chose it?

    **Methodology**
    - Why did you choose your particular research design?
    - What are the strengths and limitations of your chosen methods?
    - How did you ensure validity and reliability (or trustworthiness in qualitative work)?
    - Were there ethical considerations, and how did you address them?

    **Results & Discussion**
    - What are your main findings, and how do they answer your research questions?
    - Can you summarize any surprising or counterintuitive results?
    - How do your findings compare with previous research or theory?
    - Are there limitations in your analysis that might affect interpretation?

    **Conclusions & Implications**
    - What are the key practical or policy implications of your findings?
    - Who will benefit from your research, and how can your findings be applied?
    - What would you do differently if repeating this study?

    **Defense of Originality and Contribution**
    - In what ways is your work novel or innovative?
    - How does your research advance the field or open new directions for study?
    - Can you restate your research in layman's terms?
    ---

    Now, analyze the following thesis text and generate your questions.

    Your entire output MUST be a single, valid JSON object. Do not include any markdown formatting like 
    \`\`\`json
    or any text outside of the JSON object.

    The JSON object must have the following structure:
    {
      "questions": [
        "Question 1...",
        "Question 2...",
        "..."
      ]
    }

    Thesis Text: "${textContent.substring(0, 4000)}"

    Generate the JSON object now.
  `;

  const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
      "generationConfig": {
        "responseMimeType": "application/json",
      }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini API request failed: ${errorBody.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    console.error("Invalid response structure from Gemini:", data);
    throw new Error("Failed to parse the questions from the Gemini API response.");
  }

  return JSON.parse(generatedText);
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
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) {
      throw new Error('Invalid JWT')
    }

    // @ts-ignore
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase project secrets.");
    }

    const { textContent } = await req.json();
    if (!textContent) {
      return new Response(JSON.stringify({ error: 'Text content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const questionData = await generateQuestionsWithGemini(textContent, geminiApiKey);

    return new Response(JSON.stringify(questionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in generate-defense-questions function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})