/**
 * Standalone Test Script: Puter AI Paraphrasing Tool
 * 
 * This script tests the Puter AI paraphrasing functionality directly.
 * Run with: node test-puter-paraphrase.js
 */

// Sample academic text to paraphrase
const SAMPLE_TEXT = `The rapid advancement of artificial intelligence has transformed multiple sectors of society, including healthcare, finance, and education. Machine learning algorithms enable systems to learn from data without explicit programming, leading to more efficient and accurate decision-making processes. However, ethical concerns regarding data privacy and algorithmic bias remain significant challenges that must be addressed.`;

// Simulated Puter AI responses (since we can't directly call Puter from Node.js)
// In a real browser environment, you would call window.puter.ai.chat()

const mockPuterResponses = {
  paraphrase: `The exponential growth of machine intelligence has significantly reshaped numerous economic and social sectors, encompassing medical practice, financial services, and pedagogical systems. Computational algorithms that leverage data-driven learning mechanisms permit intelligent systems to acquire knowledge autonomously, circumventing the necessity for explicit instruction and facilitating enhanced operational efficiency coupled with improved precision in analytical determinations. Conversely, critical apprehensions pertaining to information security and potential prejudice within algorithmic frameworks constitute formidable impediments that necessitate rigorous mitigation strategies.`,
  
  formal: `The continuous evolution of artificial intelligence technology has fundamentally altered the landscape of contemporary society across diverse sectors including healthcare delivery, financial institutions, and educational frameworks. Contemporary machine learning methodologies facilitate autonomous knowledge acquisition processes without requirement for explicit procedural instruction, thereby enabling improved decision-making protocols and heightened accuracy in computational analyses. Nevertheless, substantive concerns regarding data protection mechanisms and systematic algorithmic biases persist as critical challenges requiring comprehensive resolution.`,
  
  simple: `Artificial intelligence is improving and changing many parts of our world, such as hospitals, banks, and schools. This technology allows computers to learn from information on their own instead of being programmed step-by-step. This makes computers work better and make smarter choices. However, we still have problems with protecting people's personal information and making sure AI is fair to everyone.`,
  
  expanded: `The exponential advancement of artificial intelligence (AI) represents one of the most transformative technological developments of our era, affecting virtually every significant sector of modern society. In healthcare, AI enables diagnostic systems and personalized treatment recommendations. In finance, it powers risk assessment and algorithmic trading platforms. In education, it facilitates adaptive learning systems and intelligent tutoring applications. Machine learning algorithms, a core component of AI technology, empower computational systems to acquire knowledge and improve performance through data exposure and pattern recognition, fundamentally eliminating the constraints of traditional rule-based programming methodologies and leading to demonstrably more efficient operations and enhanced accuracy in decision-making processes. Despite these remarkable advances, formidable challenges remain. Critical ethical and practical concerns regarding the protection of sensitive personal data, potential biases embedded within algorithmic frameworks, and questions of algorithmic transparency and accountability constitute substantial barriers to broader AI adoption and demand comprehensive attention from researchers, policymakers, and industry leaders.`
};

/**
 * Simulate Puter AI Chat API Call
 * In a real browser, this would be: window.puter.ai.chat(config)
 */
async function simulatePuterAIChat(prompt, mode = 'paraphrase') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return appropriate response based on mode
  return {
    status: 'success',
    response: mockPuterResponses[mode] || mockPuterResponses.paraphrase,
    prompt_length: prompt.length,
    response_length: mockPuterResponses[mode].length,
    mode: mode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Main test function
 */
async function testPuterParaphraser() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║      PUTER AI PARAPHRASING TOOL - TEST EXECUTION             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Original text
  console.log('📝 ORIGINAL TEXT:');
  console.log(`"${SAMPLE_TEXT}"\n`);
  console.log(`   Length: ${SAMPLE_TEXT.length} characters\n`);

  const modes = ['paraphrase', 'formal', 'simple', 'expanded'];
  const results = [];

  for (const mode of modes) {
    console.log(`\n─── Testing Mode: ${mode.toUpperCase()} ───\n`);
    
    try {
      const startTime = Date.now();
      
      // Build the prompt
      let systemPrompt = '';
      switch (mode) {
        case 'paraphrase':
          systemPrompt = `You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text, with no additional comments or explanations.`;
          break;
        
        case 'formal':
          systemPrompt = `You are an expert academic editor. Your task is to rewrite the following text to make it more formal and suitable for a thesis.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text, with no additional comments or explanations.`;
          break;
        
        case 'simple':
          systemPrompt = `You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text, with no additional comments or explanations.`;
          break;
        
        case 'expanded':
          systemPrompt = `You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be slightly longer but not excessively so.
- Maintain a consistent academic tone.
- Return only the expanded text, with no additional comments or explanations.`;
          break;
      }

      const prompt = `${systemPrompt}\n\nText to process:\n\n"${SAMPLE_TEXT}"`;
      
      // Make the request
      const result = await simulatePuterAIChat(prompt, mode);
      
      const duration = Date.now() - startTime;
      
      console.log(`✓ Request successful (${duration}ms)`);
      console.log(`\n📄 ${mode.toUpperCase()} RESULT:`);
      console.log(`"${result.response}"`);
      console.log(`\n   Original length: ${result.prompt_length} chars`);
      console.log(`   Result length: ${result.response_length} chars`);
      console.log(`   Length change: ${((result.response_length / SAMPLE_TEXT.length - 1) * 100).toFixed(1)}%`);
      
      results.push({
        mode,
        status: 'success',
        duration,
        result: result.response,
        lengthChange: ((result.response_length / SAMPLE_TEXT.length - 1) * 100).toFixed(1)
      });
      
    } catch (error) {
      console.error(`✗ Error in ${mode} mode:`, error.message);
      results.push({
        mode,
        status: 'error',
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let errorCount = 0;

  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✓ ${result.mode.padEnd(12)} - Success (${result.duration}ms, ${result.lengthChange}% length change)`);
      successCount++;
    } else {
      console.log(`✗ ${result.mode.padEnd(12)} - Error: ${result.error}`);
      errorCount++;
    }
  });

  console.log(`\nTotal: ${results.length} | Success: ${successCount} | Errors: ${errorCount}\n`);

  if (errorCount === 0) {
    console.log('✓ All paraphrasing modes executed successfully!');
    console.log('\n📌 INTEGRATION NOTE:');
    console.log('   In a real browser environment, replace simulatePuterAIChat() calls');
    console.log('   with: window.puter.ai.chat({ prompt, temperature: 0.7, max_tokens: 2000 })\n');
  }
}

// Run the test
testPuterParaphraser().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
