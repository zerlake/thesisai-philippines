/**
 * Sample Papers Data Generator
 * 
 * Provides realistic sample paper data for testing and development.
 * Matches the PaperResult interface from /api/arxiv-search
 */

export interface PaperResult {
  id: string;
  title: string;
  link: string;
  publication_info: string;
  snippet: string;
  authors?: string;
}

/**
 * Generate sample papers data
 * @param count - Number of papers to generate (default: 10)
 * @param query - Optional query string (used for filtering/seed)
 */
export function generateSamplePapers(count: number = 10, query?: string): PaperResult[] {
  const papers: PaperResult[] = [
    {
      id: '2401.15123',
      title: 'Attention is All You Need: Transformer Architectures in Modern Deep Learning',
      authors: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, L., Polosukhin, I.',
      publication_info: '1/15/2024',
      link: 'https://arxiv.org/pdf/2401.15123.pdf',
      snippet: 'The transformer architecture has become the foundation of modern deep learning systems. This paper provides a comprehensive overview of attention mechanisms, their applications, and recent advances in transformer models including efficient variants and interpretability techniques.'
    },
    {
      id: '2312.08456',
      title: 'Vision Transformers: Image Recognition with Pure Transformer Models',
      authors: 'Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Desai, S., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., Houlsby, N.',
      publication_info: '12/13/2023',
      link: 'https://arxiv.org/pdf/2312.08456.pdf',
      snippet: 'This work demonstrates that pure transformer models can achieve competitive results on image recognition tasks when trained at scale. We divide images into fixed-size patches and process them with transformer encoders, showing that the inductive bias of CNNs is not necessary for vision tasks.'
    },
    {
      id: '2311.18604',
      title: 'Large Language Models: Training, Optimization, and Scaling',
      authors: 'Kaplan, J., McCandlish, S., Henighan, T., Brown, T.B., Chess, B., Child, R., Cleveland, H., Dario, P., Dasgupta, M., Degraw, D., Duan, Y., Fedus, W., Fiedel, N., Filos, A., Flowers, C., Fowler, G., Gadde, A., Gauthier, J., Glaese, A., Godwin, H., Goodrich, B., Gray, A., Greene, S., Gromov, A., Gross, S., Hardin, J., Henighan, T., Hennessy, B., Henighan, T., Henighan, T.',
      publication_info: '11/15/2023',
      link: 'https://arxiv.org/pdf/2311.18604.pdf',
      snippet: 'This paper investigates the scaling laws for language model training, examining how performance scales with model size, dataset size, and compute. We present empirical results on the scaling relationships and propose efficient training strategies for large language models, with implications for future model development.'
    },
    {
      id: '2310.06825',
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive Tasks',
      authors: 'Lewis, P., Perez, E., Piktus, A., Schwenk, H., Schwab, D., Yih, W., Petrov, S., Kiela, D.',
      publication_info: '10/10/2023',
      link: 'https://arxiv.org/pdf/2310.06825.pdf',
      snippet: 'We propose retrieval-augmented generation (RAG), which combines parametric and non-parametric memory to improve performance on knowledge-intensive tasks. RAG uses a pre-trained retriever and a sequence-to-sequence model to retrieve and generate answers, achieving state-of-the-art results on multiple benchmarks.'
    },
    {
      id: '2309.15496',
      title: 'Efficient Fine-tuning of Large Pre-trained Models with Parameter-Efficient Transfer Learning',
      authors: 'Houlsby, N., Giurgiu, A., Jastrzebski, S., Morrone, B., de Laroussilhe, Q., Gesmundo, A., Attariyan, M., Cosentino, S.',
      publication_info: '9/27/2023',
      link: 'https://arxiv.org/pdf/2309.15496.pdf',
      snippet: 'Fine-tuning large pre-trained models is computationally expensive. We propose adapter modules, which are small neural networks inserted between transformer layers to adapt models to downstream tasks with minimal parameter overhead while maintaining competitive performance.'
    },
    {
      id: '2308.01191',
      title: 'Mixture of Experts Models: Scaling to Trillions of Parameters',
      authors: 'Shazeer, N., Parmar, N., Vaswani, A., Latn, J., Chase, J., LeBedev, V., Zhou, J., Wei, X., Liu, M.',
      publication_info: '8/2/2023',
      link: 'https://arxiv.org/pdf/2308.01191.pdf',
      snippet: 'We introduce a massive scale mixture of experts model trained with 1.6 trillion parameters. By sparsely activating expert modules during inference, we achieve improved efficiency and performance. This work demonstrates the viability of mixture of experts architectures for large-scale language modeling.'
    },
    {
      id: '2307.09288',
      title: 'Prompt Engineering for Large Language Models: A Comprehensive Survey',
      authors: 'White, J., Fu, Q., Zhang, S., Yao, Y., Yiu, H.C., Sharma, S.',
      publication_info: '7/18/2023',
      link: 'https://arxiv.org/pdf/2307.09288.pdf',
      snippet: 'We present a comprehensive survey of prompt engineering techniques for large language models, covering strategies such as chain-of-thought prompting, few-shot learning, and in-context learning. We analyze the effectiveness of different prompting approaches and discuss their implications for LLM applications.'
    },
    {
      id: '2306.13297',
      title: 'Constitutional AI: Harmless from AI Feedback',
      authors: 'Bai, Y., Jones, A., Ndousse, K., Askell, A., Chen, A., DasSarma, N., Drain, D., Fort, S., Ganguli, D., Garfinkel, T., Gatenbee, C., Glaese, A., Godwin, H., Goodrich, B., Gray, A., Gross, S., Hardin, J., Hernandez, D., Hilton, J., Henighan, T., Hsu, A., Hubinger, E., Hui, H., Hummel, J., Hunter, G., Hutchins, D., Ibarz, B., Ivgi, S., Jackson, J., Jeong, S., Joly, K., Jones, A., Joly, K., Jones, A., Joly, K., Kadavath, S., Kamali, K., Kamali, K., Kaplan, J., Kavalunas, A., Kavalunas, A., Kaur, G., Kaur, G., Kayyal, H., Kazer, A.',
      publication_info: '6/19/2023',
      link: 'https://arxiv.org/pdf/2306.13297.pdf',
      snippet: 'We propose Constitutional AI (CAI), a method for training AI systems to be helpful, harmless, and honest. Our approach uses a set of constitutional principles to guide model behavior, combined with self-criticism and revision, resulting in models that are more aligned with human values and safer to deploy.'
    },
    {
      id: '2305.14314',
      title: 'Long Context Understanding in Transformers: From Tokens to Documents',
      authors: 'Beltagy, I., Peters, M.E., Cohan, A.',
      publication_info: '5/23/2023',
      link: 'https://arxiv.org/pdf/2305.14314.pdf',
      snippet: 'Processing long documents with transformers is challenging due to quadratic complexity in sequence length. We explore approaches including sparse attention, hierarchical attention, and sliding window mechanisms to enable efficient processing of longer contexts while maintaining model performance.'
    },
    {
      id: '2304.12244',
      title: 'Multimodal Learning: Bridging Vision and Language with Foundation Models',
      authors: 'Alayrac, J.B., Donahue, J., Luc, P., Miech, A., Barr, I., Hasson, Y., Lenc, K., Mensch, A., Millican, K., Reynolds, M., Ring, R., Rutherford, E., Cabi, S., Han, T., Grangier, D., Huot, B., Izacard, G., Joly, K., Juntunen, M., Kapitsa, V., Koi, M., Kolesnikov, A., Kolesnikov, A., Kolesnikov, A., Kolesnikov, A., Komatsuzaki, S., Kontogiorgos, D., Koohpayegani, S.A., Korobov, M., Korobov, M., Koschmieder, S.',
      publication_info: '4/28/2023',
      link: 'https://arxiv.org/pdf/2304.12244.pdf',
      snippet: 'We introduce a multimodal foundation model that can process and reason about both visual and textual information. Our model demonstrates strong performance on image captioning, visual question answering, and visual reasoning tasks, showing the potential of unified multimodal representations.'
    }
  ];

  // If query provided, optionally filter results (for demo purposes)
  if (query) {
    const queryLower = query.toLowerCase();
    return papers
      .filter(p => 
        p.title.toLowerCase().includes(queryLower) ||
        p.snippet.toLowerCase().includes(queryLower) ||
        p.authors?.toLowerCase().includes(queryLower)
      )
      .slice(0, count);
  }

  return papers.slice(0, count);
}

/**
 * Get a single sample paper by ID
 */
export function getSamplePaperById(id: string): PaperResult | undefined {
  const allPapers = generateSamplePapers(Infinity);
  return allPapers.find(p => p.id === id);
}

/**
 * Generate random sample papers (useful for infinite scroll/pagination)
 */
export function generateRandomPapers(count: number = 10): PaperResult[] {
  const templates = [
    {
      titleTemplate: '{topic} in {domain}: A Comprehensive Study',
      snippetTemplate: 'This paper provides a thorough investigation of {topic} within {domain}. We present novel approaches and empirical evaluation showing significant improvements in {metric}.',
    },
    {
      titleTemplate: 'Deep Learning Approaches to {problem}',
      snippetTemplate: 'We propose a deep learning solution to address {problem}. Our model combines {technique1} and {technique2} to achieve state-of-the-art results on standard benchmarks.',
    },
    {
      titleTemplate: 'Scaling {technology} to Large-Scale Applications',
      snippetTemplate: 'This work demonstrates how to scale {technology} to handle large-scale applications. We discuss architectural improvements, training optimizations, and deployment considerations.',
    },
  ];

  const topics = ['Transformers', 'Graph Neural Networks', 'Reinforcement Learning', 'Contrastive Learning', 'Self-Supervised Learning'];
  const domains = ['Natural Language Processing', 'Computer Vision', 'Knowledge Graphs', 'Recommendation Systems', 'Time Series Analysis'];
  const metrics = ['performance', 'efficiency', 'robustness', 'interpretability', 'scalability'];

  const papers: PaperResult[] = [];
  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    
    const year = 2023 + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    
    papers.push({
      id: `23${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}${String(i).padStart(5, '0')}`,
      title: template.titleTemplate
        .replace('{topic}', topic)
        .replace('{domain}', domain)
        .replace('{problem}', 'challenging problems')
        .replace('{technology}', topic),
      authors: `Author ${i + 1}, Author ${i + 2}, Author ${i + 3}`,
      publication_info: `${month}/${day}/${year}`,
      link: `https://arxiv.org/pdf/23${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}${String(i).padStart(5, '0')}.pdf`,
      snippet: template.snippetTemplate
        .replace('{topic}', topic.toLowerCase())
        .replace('{domain}', domain.toLowerCase())
        .replace('{technique1}', 'novel architectures')
        .replace('{technique2}', 'optimization strategies')
        .replace('{metric}', metric)
        .replace('{problem}', 'complex real-world problems')
        .replace('{technology}', topic.toLowerCase()),
    });
  }

  return papers;
}
