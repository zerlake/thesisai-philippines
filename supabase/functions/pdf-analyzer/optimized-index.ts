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

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

  try {
    console.log("Received request to analyze PDF.");
    
    // Check content length to prevent extremely large uploads
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` 
        }), 
        { 
          status: 413,
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const pdfBuffer = await req.arrayBuffer();
    console.log("PDF buffer received, size:", pdfBuffer.byteLength);
    
    // Process with unpdf which should be more memory efficient
    const { text } = await extractText(pdfBuffer);
    console.log("Text extracted successfully.");

    // Explicitly clear the buffer reference to help with garbage collection
    (pdfBuffer as any) = null;

    return new Response(JSON.stringify({ 
      text, 
      size: text.length,
      message: "PDF processed successfully"
    }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    console.error("Error in pdf-analyzer function:", error);
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});