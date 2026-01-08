import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithCapabilities } from '@/lib/server-auth';
import { getAIServiceProvider } from '@/lib/ai-service-provider';
import { RevisionJob, RevisionResult } from '@/lib/types/revision';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

// Helper to extract JSON from AI response
function extractJSON(text: string): any {
  try {
    // Try processing as pure JSON first
    return JSON.parse(text);
  } catch (e) {
    // Attempt to match JSON code block
    const match = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    // Attempt to match raw JSON if no code blocks
    const rawMatch = text.match(/(\{[\s\S]*\})/);
    if (rawMatch) {
      return JSON.parse(rawMatch[1]);
    }
    throw new Error("Could not parse JSON response from AI");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserWithCapabilities();
    const capabilities = user.capabilities;

    if (!capabilities?.advisorAlignedRevision) {
      return NextResponse.json({
        error: "Advisor-aligned revision is available only on Pro + Advisor and Pro Complete.",
        upgradeHint: "pro_advisor"
      }, { status: 403 });
    }

    const job: RevisionJob = await request.json();

    const systemPrompt = `You are an academic writing assistant operating in ADVISOR-ALIGNED REVISION MODE.

Your job is to revise ONLY the provided text to satisfy the advisor’s comments, with MINIMAL necessary changes.

HARD CONSTRAINTS:
- Do NOT change the document structure (no new sections, no removed sections, no heading renaming) unless explicitly allowed.
- Do NOT alter any text in the PROTECTED_SPANS.
- Do NOT introduce new theories, constructs, or citations unless explicitly requested.
- Do NOT change research questions, objectives, hypotheses, or key definitions unless the advisor comment directly requests it.
- Preserve the original voice and argument as much as possible; your goal is to improve, not to reframe.

REVISION LEVELS:
- If rewrite_level = "polish": Only fix grammar, clarity, cohesion, and citation formatting; no content additions/removals.
- If rewrite_level = "light_revision": You may add or slightly rephrase sentences to clarify, but you may not change headings or overall structure.
- If rewrite_level = "deep_revision": You may reorganize paragraphs inside the given scope, but headings and high-level outline must remain.

REQUIREMENT STATUS CHECK:
- For each advisor requirement, decide whether it is:
  - "already_fully_satisfied",
  - "partially_satisfied",
  - or "not_satisfied".
- Only make changes where the requirement is partially_satisfied or not_satisfied.
- If all requirements are already_fully_satisfied, perform at most minor language polishing, or return the text unchanged.

CITATIONS:
- Maintain ${job.styleConstraints?.citationStyle || "APA 7"} style if specified.
- Do not fabricate sources; if advisor requests more local studies and none are provided, use explicit placeholders instead of inventing citations.

Your output must:
1) Preserve all headings and section boundaries.
2) Preserve all protected spans verbatim.
3) Apply changes ONLY within the provided original_text.
4) Obey the specified rewrite_level.
`;

    const userPrompt = `You are revising a thesis chapter based on advisor feedback.

Context:
- Chapter ID: ${job.chapterId}
- Scope ID: ${job.scopeId}
- Revision scope: ${job.revisionScope}
- Rewrite level: ${job.rewriteLevel}
- Citation style: ${job.styleConstraints?.citationStyle || "APA7"}

Advisor comments for this scope:
"""
${job.advisorComments}
"""

Student additional instructions (if any):
"""
${job.studentInstructions || "None"}
"""

Protected spans (must NOT be changed):
${job.protectedSpans.map(span => `[${span.label}]\n${span.text}\n`).join("\n")}

Original text to revise (this is the ONLY editable text):
"""
${job.originalText}
"""

TASK:
1. Infer and list the advisor’s concrete requirements as a numbered checklist.
2. For each checklist item, decide if it is "already_fully_satisfied", "partially_satisfied", or "not_satisfied" in the current text.
3. Revise the ORIGINAL TEXT so that all requirements are fully satisfied, applying the specified REWRITE LEVEL and constraints.
4. Output ONLY in the following JSON structure:

{
  "advisor_requirements_checklist": [
    "Requirements 1...",
    "Requirement 2..."
  ],
  "requirement_status": [
    "already_fully_satisfied",
    "partially_satisfied"
  ],
  "revised_text": "...",
  "diff_notes": "Brief notes on what you changed, tied to checklist items."
}
`;

    // combine prompts
    const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const aiService = getAIServiceProvider();
    const response = await aiService.generate({
       prompt: finalPrompt,
       temperature: 0.3,
       // We can't force JSON mode via the generic provider easily,
       // but the prompt explicitly requests JSON structure.
       // response_format: { type: "json_object" }
    });

    let parsedResult: RevisionResult;
    try {
        parsedResult = typeof response.text === 'string' ? extractJSON(response.text) : response.text;
    } catch (e) {
         console.error("Failed to parse AI response:", response.text);
         return NextResponse.json({ error: "Failed to parse AI response", raw: response.text }, { status: 500 });
    }

    // Update advisor comment statuses if comment IDs were provided
    if (job.advisorCommentIds && job.advisorCommentIds.length > 0) {
        const allSatisfied = parsedResult.requirement_status.every(status => status === 'already_fully_satisfied');
        const newStatus = allSatisfied ? 'verified' : 'integrated';

        const supabase = createServerSupabaseClient();
        const { error: updateError } = await supabase
            .from('advisor_comments')
            .update({ status: newStatus })
            .in('id', job.advisorCommentIds);

        if (updateError) {
            console.error("Failed to update advisor comment statuses:", updateError);
            // We continue anyway as the revision was successful
        }
    }

    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error('Error in advisor-aligned revision:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
