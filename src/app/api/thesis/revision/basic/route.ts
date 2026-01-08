import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithCapabilities } from '@/lib/server-auth';
import { getAIServiceProvider } from '@/lib/ai-service-provider';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserWithCapabilities();

    // Check capabilities
    if (!user.capabilities?.basicRevision) {
      return NextResponse.json(
        { error: 'Basic revision feature not available on your plan.' },
        { status: 403 }
      );
    }

    const { text, instruction } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for revision.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a high-quality academic writing assistant.
Your task is to improve the following text's grammar, clarity, and academic flow.

constraints:
- Do NOT change the underlying meaning.
- Do NOT add new sections or headings unless necessary for clarity.
- Maintain a formal academic tone.
- If specific instructions are provided, prioritize them.`;

    const userPrompt = `Instruction: ${instruction || "Improve clarity and flow."}

Text to revise:
"""
${text}
"""`;

    // combine prompts
    const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Call AI service
    const aiService = getAIServiceProvider();
    const response = await aiService.generate({
       prompt: finalPrompt,
       temperature: 0.3,
       maxTokens: 2000
    });

    return NextResponse.json({ revisedText: response.text });

  } catch (error: any) {
    console.error('Error in basic revision:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process revision.' },
      { status: 500 }
    );
  }
}
