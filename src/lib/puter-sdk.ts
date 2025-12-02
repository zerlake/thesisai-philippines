/**
 * Puter.js SDK Loader
 * 
 * Loads the Puter.js SDK dynamically on demand.
 * No API keys required - Puter.js is entirely client-side with built-in auth.
 * 
 * Usage:
 *   const puter = await loadPuterSDK();
 *   await puter.auth.signIn();
 *   const response = await puter.ai.chat("Your prompt here");
 */

let sdkLoadPromise: Promise<Window['puter']> | null = null;

/**
 * Load Puter SDK from CDN
 * Returns the Puter object when ready
 * Deduplicates concurrent load attempts
 */
export async function loadPuterSDK(): Promise<Window['puter']> {
  // If already loaded, return it
  if (typeof window !== 'undefined' && window.puter) {
    return window.puter;
  }

  // If already loading, return the existing promise
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  // Load the Puter.js script from CDN
  sdkLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Puter SDK can only be loaded in browser'));
      return;
    }

    // Double-check it wasn't loaded while we were setting up
    if (window.puter) {
      resolve(window.puter);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/?autoload=false'; // autoload=false to prevent automatic session checks
    script.async = true;
    script.onload = () => {
      // Wait a tick for Puter to initialize globally
      setTimeout(() => {
        if (window.puter) {
          resolve(window.puter);
        } else {
          reject(new Error('Puter.js SDK failed to initialize'));
        }
      }, 100);
    };
    script.onerror = () => {
      sdkLoadPromise = null; // Reset on error so retry works
      reject(new Error('Failed to load Puter.js SDK from CDN'));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

/**
 * Sign in user with Puter
 * Shows Puter's native sign-in dialog
 */
export async function signInWithPuter(): Promise<void> {
  const puter = await loadPuterSDK();
  if (!puter.auth) {
    throw new Error('Puter auth not available');
  }
  await puter.auth.signIn();
}

/**
 * Sign out from Puter
 */
export async function signOutFromPuter(): Promise<void> {
  const puter = await loadPuterSDK();
  if (!puter.auth) {
    throw new Error('Puter auth not available');
  }
  await puter.auth.signOut();
}

/**
 * Get current Puter user
 * Returns user object if signed in, throws if not
 */
export async function getPuterUser(): Promise<any> {
  const puter = await loadPuterSDK();
  if (!puter.auth) {
    throw new Error('Puter auth not available');
  }
  return puter.auth.getUser();
}

/**
 * Call Puter AI chat endpoint
 * No API key needed - uses signed-in user's credentials
 */
export async function chatWithPuter(prompt: string, options?: any): Promise<string> {
  const puter = await loadPuterSDK();
  if (!puter.ai) {
    throw new Error('Puter AI not available');
  }
  console.log('[puter-sdk] Calling puter.ai.chat()');
  const response = await puter.ai.chat(prompt, options);
  console.log('[puter-sdk] Got response type:', typeof response, 'value:', response);
  return response;
}

/**
 * Ensure user is authenticated with Puter
 * If not signed in, prompts for sign-in
 */
export async function ensurePuterAuth(): Promise<void> {
  const puter = await loadPuterSDK();
  try {
    await puter.auth.getUser();
  } catch {
    // User not signed in, initiate sign-in
    await puter.auth.signIn();
  }
}

/**
 * Check if user is authenticated with Puter
 */
export async function isPuterAuthenticated(): Promise<boolean> {
  try {
    const puter = await loadPuterSDK();
    await puter.auth.getUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON response from Puter AI
 */
export function parsePuterJsonResponse(response: any): any {
  let text: string;

  if (typeof response === 'string') {
    text = response;
  } else if (typeof response.message === 'string') {
    text = response.message;
  } else if (response.message?.content) {
    text = Array.isArray(response.message.content)
      ? response.message.content.map((b: any) => typeof b === 'string' ? b : b.text || '').join('')
      : response.message.content;
  } else {
    throw new Error('Unable to extract text from response');
  }

  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  const jsonStart2 = text.indexOf('[');
  const jsonEnd2 = text.lastIndexOf(']') + 1;
  
  let jsonStr = text;
  if (jsonStart !== -1 && jsonEnd !== 0) {
    jsonStr = text.substring(jsonStart, jsonEnd);
  } else if (jsonStart2 !== -1 && jsonEnd2 !== 0) {
    jsonStr = text.substring(jsonStart2, jsonEnd2);
  }

  return JSON.parse(jsonStr);
}

/**
 * AI Task: Generate Flashcards
 * Generates study flashcards for key concepts
 */
export async function generateFlashcards(topic: string, options?: any): Promise<any[]> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate 12 educational flashcards about "${topic}".
For each flashcard, provide:
- A clear question/term (keep it concise)
- A comprehensive answer/definition

Format as JSON array:
[
  { "question": "...", "answer": "..." },
  ...
]`;

  const response = await puter.ai.chat(prompt, options);
  return parsePuterJsonResponse(response);
}

/**
 * AI Task: Generate Defense Questions
 * Generates challenging questions for thesis defense
 */
export async function generateDefenseQuestions(topic: string, options?: any): Promise<string[]> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate 10 challenging and insightful defense questions for a thesis about "${topic}".
These should be questions a thesis defense panel would ask.
Format as JSON array of strings:
["question 1", "question 2", ...]`;

  const response = await puter.ai.chat(prompt, options);
  const parsed = parsePuterJsonResponse(response);
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
}

/**
 * AI Task: Generate Research Questions
 * Generates research questions aligned with thesis structure
 */
export async function generateResearchQuestions(topic: string, options?: any): Promise<any> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate 5-7 research questions for a thesis about "${topic}".
Questions should progress from broad to specific.
Include descriptive, exploratory, explanatory, and evaluative questions.
Format as JSON:
{
  "questions": ["q1", "q2", ...],
  "categories": ["descriptive", "exploratory", ...]
}`;

  const response = await puter.ai.chat(prompt, options);
  return parsePuterJsonResponse(response);
}

/**
 * AI Task: Generate Outline
 * Generates thesis outline with chapter structure
 */
export async function generateOutline(topic: string, options?: any): Promise<string> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate a detailed thesis outline for "${topic}".
Include introduction, literature review, methodology, results, discussion, and conclusion chapters.
Format the outline using Markdown headings (e.g., # Introduction, ## Background, ### Sub-point).`;

  const response = await puter.ai.chat(prompt, options);
  
  if (typeof response === 'string') return response;
  if (typeof response.message === 'string') return response.message;
  if (response.message?.content) {
    return Array.isArray(response.message.content)
      ? response.message.content.map((b: any) => typeof b === 'string' ? b : b.text || '').join('')
      : response.message.content;
  }
  
  throw new Error('Unable to extract outline from response');
}

/**
 * AI Task: Generate Conclusion
 * Generates thesis conclusion based on findings
 */
export async function generateConclusion(findings: string, options?: any): Promise<string> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Write a comprehensive thesis conclusion based on these findings:
"${findings}"

Provide a professional academic conclusion that:
- Summarizes key findings
- Discusses implications
- Suggests future research directions
- Addresses limitations`;

  const response = await puter.ai.chat(prompt, options);
  
  if (typeof response === 'string') return response;
  if (typeof response.message === 'string') return response.message;
  if (response.message?.content) {
    return Array.isArray(response.message.content)
      ? response.message.content.map((b: any) => typeof b === 'string' ? b : b.text || '').join('')
      : response.message.content;
  }
  
  throw new Error('Unable to extract conclusion from response');
}

/**
 * AI Task: Generate Hypotheses
 * Generates research hypotheses
 */
export async function generateHypotheses(topic: string, options?: any): Promise<string[]> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate 5-7 research hypotheses for a study about "${topic}".
Hypotheses should be testable and academically rigorous.
Format as JSON array of strings:
["H1: ...", "H2: ...", ...]`;

  const response = await puter.ai.chat(prompt, options);
  const parsed = parsePuterJsonResponse(response);
  return Array.isArray(parsed) ? parsed : parsed.hypotheses || [];
}

/**
 * AI Task: Align Questions with Literature
 * Aligns research questions with existing literature
 */
export async function alignQuestionsWithLiterature(questions: string[], topic: string, options?: any): Promise<any> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Align these research questions with relevant academic literature about "${topic}":

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, suggest:
- Relevant theories or frameworks
- Key researchers/authors
- Existing literature gaps this addresses

Format as JSON object with question indices as keys.`;

  const response = await puter.ai.chat(prompt, options);
  return parsePuterJsonResponse(response);
}

/**
 * AI Task: Check Plagiarism
 * Analyzes text for potential plagiarism indicators
 */
export async function checkPlagiarism(text: string, options?: any): Promise<any> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Analyze this text for potential plagiarism indicators and areas that need citation:
"${text}"

Provide a detailed analysis including:
- Percentage of potentially problematic content
- Specific phrases that may need attribution
- Suggestions for proper citation
- Overall plagiarism risk assessment

Format as JSON:
{
  "riskLevel": "low|medium|high",
  "percentage": number,
  "issues": [...],
  "suggestions": [...]
}`;

  const response = await puter.ai.chat(prompt, options);
  return parsePuterJsonResponse(response);
}

/**
 * AI Task: Generate Abstract
 * Generates thesis abstract
 */
export async function generateAbstract(topic: string, findings: string, options?: any): Promise<string> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const prompt = `Generate a professional academic abstract for a thesis about "${topic}".
Key findings: ${findings}

The abstract should:
- Be 150-300 words
- Include purpose, methodology, key findings, and implications
- Be suitable for academic publication`;

  const response = await puter.ai.chat(prompt, options);
  
  if (typeof response === 'string') return response;
  if (typeof response.message === 'string') return response.message;
  if (response.message?.content) {
    return Array.isArray(response.message.content)
      ? response.message.content.map((b: any) => typeof b === 'string' ? b : b.text || '').join('')
      : response.message.content;
  }
  
  throw new Error('Unable to extract abstract from response');
}

/**
 * AI Task: Paraphrase Text
 * Rewrite text in different styles
 */
export async function paraphraseText(
  text: string,
  mode: 'formal' | 'simple' | 'expand' | 'standard' = 'standard',
  options?: any
): Promise<string> {
  const puter = await loadPuterSDK();
  await ensurePuterAuth();

  const modeInstructions = {
    formal: 'Rewrite in formal academic language with technical terminology.',
    simple: 'Rewrite using simpler, more accessible language.',
    expand: 'Expand the text with more details and explanations (2-3x longer).',
    standard: 'Rewrite naturally while maintaining the original meaning.'
  };

  const prompt = `${modeInstructions[mode]}

Original text:
"${text}"

Provide only the rewritten text without explanations.`;

  const response = await puter.ai.chat(prompt, options);
  
  if (typeof response === 'string') return response;
  if (typeof response.message === 'string') return response.message;
  if (response.message?.content) {
    return Array.isArray(response.message.content)
      ? response.message.content.map((b: any) => typeof b === 'string' ? b : b.text || '').join('')
      : response.message.content;
  }
  
  throw new Error('Unable to extract paraphrased text from response');
}
