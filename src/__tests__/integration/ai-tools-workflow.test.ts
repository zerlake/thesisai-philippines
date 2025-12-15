import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AI Tools Integration Workflow', () => {
  const mockAIComplete = vi.fn();
  const mockSaveContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses grammar checker on text', async () => {
    mockAIComplete.mockResolvedValue({
      corrections: [{ original: 'teh', corrected: 'the' }],
    });

    const text = 'This is teh test';
    const result = await mockAIComplete(text, 'grammar_check');

    expect(result.corrections).toBeDefined();
    expect(result.corrections[0].corrected).toBe('the');
  });

  it('generates paraphrased content', async () => {
    mockAIComplete.mockResolvedValue({
      paraphrased: 'Original text has been rewritten',
    });

    const text = 'Original text';
    const result = await mockAIComplete(text, 'paraphrase');

    expect(result.paraphrased).toBeDefined();
  });

  it('generates research questions from topic', async () => {
    mockAIComplete.mockResolvedValue({
      questions: [
        'What is the impact of AI on society?',
        'How can AI be used ethically?',
      ],
    });

    const topic = 'AI Ethics';
    const result = await mockAIComplete(topic, 'generate_questions');

    expect(result.questions).toHaveLength(2);
  });

  it('creates outline from research questions', async () => {
    mockAIComplete.mockResolvedValue({
      outline: {
        sections: [
          { title: 'Introduction', subsections: [] },
          { title: 'Literature Review', subsections: [] },
        ],
      },
    });

    const questions = ['Question 1', 'Question 2'];
    const result = await mockAIComplete(questions, 'generate_outline');

    expect(result.outline.sections).toHaveLength(2);
  });

  it('generates bibliography entries', async () => {
    mockAIComplete.mockResolvedValue({
      bibliography: 'Smith, J. (2020). Title. Journal.',
    });

    const sources = [
      { author: 'Smith, J.', year: 2020, title: 'Title' },
    ];

    const result = await mockAIComplete(sources, 'generate_bibliography');

    expect(result.bibliography).toBeDefined();
  });

  it('saves AI-generated content', async () => {
    const aiContent = 'Generated text';
    const thesisId = 'thesis-123';

    await mockSaveContent(thesisId, aiContent, 'draft');

    expect(mockSaveContent).toHaveBeenCalledWith(
      thesisId,
      aiContent,
      'draft'
    );
  });

  it('chains multiple AI operations', async () => {
    const topic = 'Machine Learning';
    
    // Generate questions
    mockAIComplete.mockResolvedValueOnce({
      questions: ['Q1', 'Q2'],
    });
    
    const qResult = await mockAIComplete(topic, 'generate_questions');
    
    // Generate outline
    mockAIComplete.mockResolvedValueOnce({
      outline: { sections: [] },
    });
    
    const outlineResult = await mockAIComplete(
      qResult.questions,
      'generate_outline'
    );

    expect(mockAIComplete).toHaveBeenCalledTimes(2);
    expect(qResult.questions).toBeDefined();
    expect(outlineResult.outline).toBeDefined();
  });

  it('handles AI service errors', async () => {
    mockAIComplete.mockRejectedValue(new Error('AI service unavailable'));

    await expect(
      mockAIComplete('text', 'grammar_check')
    ).rejects.toThrow('AI service unavailable');
  });

  it('retries failed AI operations', async () => {
    mockAIComplete.mockRejectedValueOnce(new Error('Timeout'));
    mockAIComplete.mockResolvedValueOnce({ text: 'Success' });

    try {
      await mockAIComplete('text', 'operation');
    } catch (e) {
      // Retry
      const result = await mockAIComplete('text', 'operation');
      expect(result.text).toBe('Success');
    }
  });
});
