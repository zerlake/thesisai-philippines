import { NextResponse } from "next/server";
import { z } from "zod";
import { callLlmProviderOptimized } from "@/services/llm-client-optimized";
import { MemoryMonitor } from "@/lib/memory-monitor";

const generateSchema = z.object({
  task: z.enum([
    "generate_title",
    "generate_outline",
    "paraphrase_text",
    "check_grammar",
  ]),
  prompt: z.string().min(10).max(5000),
  context: z.string().max(10000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request body",
          details: validation.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Construct a more detailed prompt for the LLM
    const fullPrompt = `Task: ${validation.data.task}\n\nPrompt: ${validation.data.prompt}`;

    // Initialize memory monitor for this request
    const monitor = MemoryMonitor.getInstance();
    console.log("Memory usage before LLM call:", monitor.getCurrentUsage());

    // Call the optimized LLM client
    const llmResult = await callLlmProviderOptimized(fullPrompt);

    console.log("Memory usage after LLM call:", monitor.getCurrentUsage());

    return NextResponse.json({ result: llmResult });
  } catch (error: any) {
    // Handle non-JSON body error
    if (error instanceof SyntaxError) {
      return new NextResponse(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("AI Gateway Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
