import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractText } from 'npm:unpdf';

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    console.log("Received request to analyze PDF.");
    const pdfBuffer = await req.arrayBuffer();
    console.log("PDF buffer received, size:", pdfBuffer.byteLength);
    const { text } = await extractText(pdfBuffer);
    console.log("Text extracted successfully.");

    return new Response(JSON.stringify({ text }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    console.error("Error in pdf-analyzer function:", error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});
