/**
 * Seed demo documents into Supabase for demo student account
 * This ensures the student dashboard displays sample documents with content
 * that aligns with advisor and critic dashboard feedback
 */

import { createClient } from '@supabase/supabase-js';

const DEMO_STUDENT_EMAIL = 'student@demo.thesisai.local';

// Sample documents with full content that matches mock-relationships.ts
export const DEMO_DOCUMENTS = [
  {
    title: 'Chapter 1 - Introduction',
    content: `<h1 id="introduction">Chapter I: Introduction</h1>
<h2>Background</h2>
<p>The rapid advancement of artificial intelligence in recent years has transformed multiple sectors of society, including education. As academic writing becomes increasingly complex, students require sophisticated tools to enhance their writing quality, structure, and coherence.</p>
<h2>Problem Statement</h2>
<p>Despite the availability of writing assistance tools, many graduate students struggle with organizing complex arguments, maintaining academic tone, and ensuring proper citations. This thesis addresses the gap between current AI capabilities and the specific needs of academic writers.</p>
<h2>Research Objectives</h2>
<ul>
<li>To evaluate the impact of AI-assisted writing tools on academic paper quality</li>
<li>To identify key features that improve student thesis writing outcomes</li>
<li>To propose an integrated system for academic writing support</li>
</ul>`,
  },
  {
    title: 'Chapter 2 - Literature Review',
    content: `<h1 id="literature-review">Chapter II: Literature Review</h1>
<h2>Historical Context of Academic Writing Support</h2>
<p>Academic writing has been a cornerstone of higher education for centuries. Traditional approaches relied heavily on manual review and peer feedback. With the emergence of computational linguistics in the 1980s, automated writing assessment tools began to develop.</p>
<h2>Evolution of AI in Education</h2>
<p>The integration of artificial intelligence in educational settings has grown exponentially since the introduction of large language models. Early implementations focused on grammar and syntax checking. Current systems provide deeper semantic analysis and contextual suggestions.</p>
<h2>Key Findings</h2>
<p>Recent meta-analyses have shown that students using AI-assisted writing tools show a 23-35% improvement in paper organization and clarity. However, concerns about academic integrity and over-reliance on automation persist in the literature.</p>
<h3>Student Performance Metrics</h3>
<ul>
<li>Organization and structure: 28% improvement</li>
<li>Clarity and readability: 31% improvement</li>
<li>Citation accuracy: 18% improvement</li>
<li>Time spent on writing: 35% reduction</li>
</ul>
<h2>Critical Analysis</h2>
<p>While AI shows promise in academic writing support, several limitations exist. These tools often lack domain-specific knowledge and may provide generic suggestions that don't address discipline-specific conventions.</p>`,
  },
];

/**
 * Seed demo documents for a specific user
 * Called when demo student logs in for the first time
 */
export async function seedDemoDocs(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  try {
    // Check if documents already exist for this user
    const { data: existingDocs, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing documents:', checkError);
      return false;
    }

    // If documents already exist, skip seeding
    if (existingDocs && existingDocs.length > 0) {
      console.log('Demo documents already exist for this user');
      return true;
    }

    // Insert sample documents
    const documentsToInsert = DEMO_DOCUMENTS.map((doc, index) => ({
      user_id: userId,
      title: doc.title,
      content: doc.content,
      status: index === 0 ? 'submitted' : 'draft',
      created_at: new Date(Date.now() - (2 - index) * 86400000).toISOString(), // Stagger by days
      updated_at: new Date(Date.now() - (2 - index) * 43200000).toISOString(), // Half day after created
    })) as any;

    const { data, error } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select('id');

    if (error) {
      console.error('Error seeding demo documents:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log(`Successfully seeded ${data?.length || 0} demo documents`);
    return true;
  } catch (error) {
    console.error('Unexpected error seeding demo documents:', error);
    return false;
  }
}

/**
 * Get sample document content by title
 * Useful for testing and debugging
 */
export function getSampleDocumentByTitle(title: string) {
  return DEMO_DOCUMENTS.find(doc => doc.title === title);
}

/**
 * Check if a user is a demo account
 */
export function isDemoAccount(email?: string): boolean {
  if (!email) return false;
  return email === DEMO_STUDENT_EMAIL || email.includes('@demo.thesisai.local');
}
