/**
 * Sample data for Defense PPT Coach
 * Realistic thesis defense presentations for demonstration and testing
 */

export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number;
  order: number;
}

export interface DefensePlan {
  id: string;
  thesisId?: string;
  defenseType: 'proposal' | 'final';
  totalTime: number;
  slideCount: number;
  chaptersToInclude: number[];
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
}

// Sample Proposal Defense (15 minutes, Chapters 1-3)
export const sampleProposalDefense: DefensePlan = {
  id: 'sample-proposal-001',
  defenseType: 'proposal',
  totalTime: 15,
  slideCount: 8,
  chaptersToInclude: [1, 2, 3],
  createdAt: new Date('2024-11-15'),
  updatedAt: new Date('2024-11-20'),
  slides: [
    {
      id: 'slide-0',
      title: 'Factors Affecting Student Academic Performance in Philippine Public Schools',
      bullets: [
        '• A Thesis Proposal',
        '• College of Education, UP Diliman',
        '• November 2024'
      ],
      notes: 'Good morning. I\'m presenting my thesis proposal on factors affecting student academic performance in Philippine public schools. This research aims to identify and analyze the key variables that influence student success.',
      timeEstimate: 30,
      order: 0,
    },
    {
      id: 'slide-1',
      title: 'Background & Significance',
      bullets: [
        '• 56% of public school students drop out before completing high school',
        '• Limited research on contextual factors in Philippine settings',
        '• Need for localized interventions and policies'
      ],
      notes: 'The problem is significant because over half of our public school students don\'t complete their education. While international studies exist, they don\'t capture the unique challenges in Philippine classrooms. Understanding local factors will help create more effective policies.',
      timeEstimate: 90,
      order: 1,
    },
    {
      id: 'slide-2',
      title: 'Research Problem',
      bullets: [
        '• Which socioeconomic factors most impact performance?',
        '• How do teacher qualifications affect student outcomes?',
        '• What role does school infrastructure play?'
      ],
      notes: 'The main problem is we don\'t know which factors matter most in our context. Is it poverty? Teacher quality? School facilities? Or a combination? This research will help policymakers prioritize interventions.',
      timeEstimate: 90,
      order: 2,
    },
    {
      id: 'slide-3',
      title: 'Research Questions & Objectives',
      bullets: [
        '• RQ1: What socioeconomic variables predict student achievement?',
        '• RQ2: How do teacher factors influence academic performance?',
        '• Objective: Develop evidence-based recommendations'
      ],
      notes: 'We have three research questions. First, we\'re examining socioeconomic factors like family income and parental education. Second, we\'re looking at teacher characteristics including certification and professional development. Our goal is to create actionable recommendations.',
      timeEstimate: 60,
      order: 3,
    },
    {
      id: 'slide-4',
      title: 'Proposed Methodology',
      bullets: [
        '• Quantitative design: Survey of 40 public schools (n=800 students)',
        '• Data collection: Academic records, student surveys, teacher interviews',
        '• Analysis: Multiple regression and structural equation modeling'
      ],
      notes: 'We\'re using a quantitative approach with mixed methods. We\'ll survey 800 students across 40 schools. We\'ll analyze academic records, gather student perspectives through surveys, and interview teachers. For analysis, we\'ll use regression models to identify predictors of performance.',
      timeEstimate: 120,
      order: 4,
    },
    {
      id: 'slide-5',
      title: 'Expected Outcomes',
      bullets: [
        '• Identify top 5 factors affecting student performance',
        '• Comparative analysis across school types',
        '• Policy recommendations for Department of Education'
      ],
      notes: 'We expect to identify the most important factors influencing academic success. We\'ll also compare findings across urban, suburban, and rural schools. This will lead to concrete recommendations that DepEd can use to improve student outcomes.',
      timeEstimate: 60,
      order: 5,
    },
    {
      id: 'slide-6',
      title: 'Timeline',
      bullets: [
        '• Month 1-2: Data collection and survey administration',
        '• Month 3: Data cleaning and analysis',
        '• Month 4: Final defense and report submission'
      ],
      notes: 'The timeline spans four months. Months one and two focus on collecting data from schools. Month three is for analysis and interpretation. Month four includes the final defense and report submission to the college.',
      timeEstimate: 45,
      order: 6,
    },
    {
      id: 'slide-7',
      title: 'Questions?',
      bullets: [
        '• Thank you for your time',
        '• Open to questions and suggestions',
        '• Contact: student@up.edu.ph'
      ],
      notes: 'Thank you for listening. I\'m happy to answer any questions about the research design, timeline, or expected outcomes. I\'m also open to feedback that might strengthen the proposal.',
      timeEstimate: 60,
      order: 7,
    },
  ],
};

// Sample Final Defense (25 minutes, All chapters)
export const sampleFinalDefense: DefensePlan = {
  id: 'sample-final-001',
  defenseType: 'final',
  totalTime: 25,
  slideCount: 10,
  chaptersToInclude: [1, 2, 3, 4, 5],
  createdAt: new Date('2024-08-01'),
  updatedAt: new Date('2024-11-20'),
  slides: [
    {
      id: 'slide-0',
      title: 'Digital Literacy Programs and Student Achievement in Rural Philippine Schools',
      bullets: [
        '• Final Thesis Defense',
        '• Ateneo de Manila University',
        '• November 2024'
      ],
      notes: 'Good morning everyone. I\'m defending my thesis on digital literacy programs and their impact on student achievement in rural Philippine schools.',
      timeEstimate: 30,
      order: 0,
    },
    {
      id: 'slide-1',
      title: 'Introduction & Background',
      bullets: [
        '• Digital divide affects 65% of rural students',
        '• Limited access to technology and internet',
        '• Need for evidence-based digital literacy interventions'
      ],
      notes: 'The digital divide in rural Philippines is significant. Most students lack basic computer skills and internet access. My research examines whether structured digital literacy programs can improve academic outcomes.',
      timeEstimate: 90,
      order: 1,
    },
    {
      id: 'slide-2',
      title: 'Literature Review Summary',
      bullets: [
        '• Global studies show mixed results (Cohen\'s d = 0.42)',
        '• Asian context differs from Western findings',
        '• Gap: No Philippine-specific longitudinal studies'
      ],
      notes: 'The international literature shows mixed findings. Some studies report significant improvements, others don\'t. Asian contexts show different patterns than Western countries. Notably, there are very few long-term studies in the Philippine context.',
      timeEstimate: 120,
      order: 2,
    },
    {
      id: 'slide-3',
      title: 'Research Methodology',
      bullets: [
        '• Quasi-experimental design (n=600 students, 12 schools)',
        '• Intervention: 6-month digital literacy curriculum',
        '• Outcomes: Academic performance, digital skills, engagement'
      ],
      notes: 'I used a quasi-experimental design comparing treatment and control schools. 600 students across 12 rural schools participated. The intervention was a 6-month curriculum covering basic digital literacy. I measured academic performance through grades, digital skills through assessments, and engagement through surveys.',
      timeEstimate: 120,
      order: 3,
    },
    {
      id: 'slide-4',
      title: 'Key Findings',
      bullets: [
        '• 23% improvement in academic performance (p < 0.01)',
        '• Digital confidence increased from 2.1 to 4.3 (scale 1-5)',
        '• Effects stronger for females and low-income students'
      ],
      notes: 'The results were significant. Academic performance improved by 23%, which is statistically significant. Students\' confidence using digital tools more than doubled. Interestingly, the intervention was most effective for female students and those from low-income families.',
      timeEstimate: 150,
      order: 4,
    },
    {
      id: 'slide-5',
      title: 'Discussion',
      bullets: [
        '• Digital literacy addresses achievement gap in rural areas',
        '• Curriculum design crucial for student engagement',
        '• Teacher training essential for program success'
      ],
      notes: 'These findings suggest that digital literacy is an effective lever for improving rural education outcomes. The quality of curriculum design matters significantly. We also learned that teacher training and support are critical for implementation success.',
      timeEstimate: 120,
      order: 5,
    },
    {
      id: 'slide-6',
      title: 'Conclusions',
      bullets: [
        '• Digital literacy programs improve student achievement',
        '• Cost-benefit ratio favorable for DepEd scale-up',
        '• Recommend: National rollout with localization support'
      ],
      notes: 'In conclusion, digital literacy programs do improve student achievement in rural schools. The benefits outweigh the costs, making it feasible for nationwide implementation. I recommend a phased rollout with support for local adaptation.',
      timeEstimate: 90,
      order: 6,
    },
    {
      id: 'slide-7',
      title: 'Limitations & Future Research',
      bullets: [
        '• 6-month timeframe (long-term effects unknown)',
        '• Sample limited to Luzon region',
        '• Future: Multi-year follow-up study across regions'
      ],
      notes: 'Some limitations to note: we only measured effects over 6 months, so long-term sustainability isn\'t known. Our sample was limited to Luzon schools. Future research should track students longer and include other regions.',
      timeEstimate: 90,
      order: 7,
    },
    {
      id: 'slide-8',
      title: 'Contributions to Knowledge',
      bullets: [
        '• First large-scale study in Philippine rural context',
        '• Evidence for education policy and practice',
        '• Foundation for scale-up research'
      ],
      notes: 'This research contributes significantly to our understanding of digital literacy in the Philippines. It provides policymakers with evidence to guide investment decisions. And it opens the door for larger scale-up studies.',
      timeEstimate: 60,
      order: 8,
    },
    {
      id: 'slide-9',
      title: 'Thank You',
      bullets: [
        '• Questions and discussion',
        '• Thank you to my adviser and committee',
        '• Contact: researcher@ateneo.edu.ph'
      ],
      notes: 'Thank you for your attention and for the time you\'ve spent reviewing my work. I appreciate the guidance from my adviser and committee members. I\'m ready for your questions and feedback.',
      timeEstimate: 60,
      order: 9,
    },
  ],
};

// Sample Q&A data
export const sampleQAPairs = {
  proposal: [
    {
      question: 'Why focus on socioeconomic factors rather than individual student characteristics?',
      answer: 'While individual factors are important, socioeconomic variables are more actionable for policy interventions. Schools can\'t change individual student background, but policies can address school infrastructure, teacher quality, and resource allocation.',
    },
    {
      question: 'How will you ensure the survey is valid and reliable?',
      answer: 'We\'re using validated instruments from international studies, adapted for the Philippine context. We\'ll conduct pilot testing with 200 students first, then revise based on reliability coefficients (targeting Cronbach\'s α > 0.7).',
    },
    {
      question: 'What is your sample size justification?',
      answer: 'Using power analysis (G*Power software) with effect size f = 0.15 (medium), α = 0.05, and power = 0.80, we calculated n = 800 across 40 schools gives us adequate power to detect meaningful differences.',
    },
    {
      question: 'How will you handle missing data?',
      answer: 'We\'ll use multiple imputation techniques if data is missing at random (MCAR). We\'ll first assess missingness patterns. For MCAR assumptions, we\'ll use MICE (Multivariate Imputation by Chained Equations).',
    },
  ],
  final: [
    {
      question: 'Why did you use a quasi-experimental design instead of randomized controlled trial?',
      answer: 'RCTs are ideal but ethically problematic in school settings—we can\'t deny intervention to control schools. Quasi-experimental design with propensity score matching provides strong causal inference while being ethically sound.',
    },
    {
      question: 'The 23% improvement seems high. How confident are you in this result?',
      answer: 'The 95% confidence interval is [18%, 28%], so the improvement is robust. We also verified results using multiple regression models and found consistent effects (β = 0.23, p < 0.001).',
    },
    {
      question: 'You mention effects are stronger for females. Why might this be?',
      answer: 'Several possibilities: females may have higher baseline motivation, or digital literacy particularly appeals to their learning styles. Boys may have had more prior informal exposure. This opens interesting questions for future qualitative research.',
    },
    {
      question: 'What is the cost per student for this intervention?',
      answer: 'Implementation cost was ₱2,500 per student for the 6-month program. Given the 23% improvement in academic performance, the cost-benefit ratio is favorable compared to other education interventions.',
    },
    {
      question: 'How will teachers maintain program quality during scale-up?',
      answer: 'We recommend a cascade training model: national trainers → regional coordinators → school teachers. Quality assurance through classroom observations and student assessments at 3-month intervals ensures fidelity.',
    },
  ],
};

// Additional sample presentations by topic
export const samplePresentationsByTopic = {
  engineering: {
    title: 'Optimization of Water Purification Systems for Rural Communities',
    defenseType: 'final' as const,
    totalTime: 25,
    keyPoints: [
      'Technical specifications and water quality standards',
      'Cost analysis and affordability for rural adoption',
      'Field testing results from 5 communities',
      'Maintenance and sustainability recommendations',
      'Scale-up potential and impact assessment'
    ]
  },
  medicine: {
    title: 'Effectiveness of Community Health Worker Programs in Maternal Mortality Reduction',
    defenseType: 'final' as const,
    totalTime: 25,
    keyPoints: [
      'Literature review on community health interventions',
      'Study design and methodology (prospective cohort)',
      'Maternal mortality reduction outcomes (from 500 to 350 per 100k births)',
      'Cost-effectiveness analysis',
      'Policy implications and scale-up recommendations'
    ]
  },
  business: {
    title: 'Digital Transformation and SME Performance in the Philippine Retail Sector',
    defenseType: 'final' as const,
    totalTime: 25,
    keyPoints: [
      'Business landscape and digital readiness gaps',
      'Survey of 150 SMEs across 3 regions',
      'Digital adoption patterns and barriers',
      'Performance metrics: sales growth, customer retention, efficiency',
      'Strategic recommendations for DepEd and DTI support'
    ]
  },
  psychology: {
    title: 'Mental Health Support Systems in Philippine Universities: A Case Study',
    defenseType: 'final' as const,
    totalTime: 25,
    keyPoints: [
      'Current mental health landscape in Philippine universities',
      'Survey and interview data from 8 institutions',
      'Barriers to help-seeking among students',
      'Effectiveness of support interventions',
      'Comprehensive recommendations for institutional policies'
    ]
  }
};

// Template for quick start
export const emptyDefensePlan: DefensePlan = {
  id: '',
  defenseType: 'proposal',
  totalTime: 15,
  slideCount: 0,
  chaptersToInclude: [],
  slides: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
