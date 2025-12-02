export const SAMPLE_INSTRUMENT_DATA = {
  instrumentName: 'Student Engagement and Academic Performance Survey',
  instrumentType: 'survey',
  description:
    'A 25-item survey adapted from the Student Engagement Index (SEI) for use with college students in the Philippines. Measures cognitive, behavioral, and emotional engagement.',
  content: `STUDENT ENGAGEMENT AND ACADEMIC PERFORMANCE SURVEY

Purpose: This survey measures student engagement across cognitive, behavioral, and emotional dimensions.

Instructions: Please rate your level of agreement with each statement using the following scale:
1 = Strongly Disagree
2 = Disagree
3 = Neutral
4 = Agree
5 = Strongly Agree

COGNITIVE ENGAGEMENT (Items 1-8)
1. I think deeply about the ideas presented in class.
2. I connect course content to my personal experiences.
3. I ask questions to clarify concepts I don't understand.
4. I review class notes regularly to reinforce learning.
5. I seek additional resources beyond required readings.
6. I apply theoretical concepts to real-world problems.
7. I engage in critical thinking about course topics.
8. I participate in discussions that challenge my perspectives.

BEHAVIORAL ENGAGEMENT (Items 9-16)
9. I attend all scheduled classes.
10. I complete assignments before the deadline.
11. I actively participate in class discussions.
12. I collaborate with classmates on group projects.
13. I seek help from instructors when needed.
14. I spend adequate time on coursework.
15. I prepare for exams thoroughly.
16. I contribute to classroom activities and discussions.

EMOTIONAL ENGAGEMENT (Items 17-25)
17. I feel motivated to succeed in this course.
18. I enjoy the subject matter of this course.
19. I feel a sense of belonging in this class.
20. I have positive feelings about my academic progress.
21. I am interested in topics covered in this course.
22. I feel supported by my instructor.
23. I feel confident in my ability to succeed.
24. I have a positive attitude toward learning.
25. I feel valued as a member of this learning community.

DEMOGRAPHIC INFORMATION
Age: _____ Gender: _____ Year Level: _____ Program: _____`,
};

export const SAMPLE_VALIDATION_RESULT = {
  success: true,
  instrumentId: 'inst-2024-001-student-engagement-survey',
  validation: {
    validityGaps: [
      'Missing factorial validity evidence - recommend confirmatory factor analysis to validate three-factor structure',
      'No cross-cultural validity data - validation primarily conducted with Western populations',
      'Limited temporal stability evidence - only one test-retest study with 2-week interval',
    ],
    suggestions: [
      'Conduct cognitive interviews with 5-10 Philippine students to assess item clarity and cultural appropriateness',
      'Perform pilot test with n=100 students to establish item discrimination and reliability coefficients',
      'Adapt items 2, 19, and 22 to better reflect Philippine educational context (e.g., family influence, peer support)',
      'Consider adding 2-3 items measuring digital engagement for modern learning environments',
      'Include Rasch analysis to examine item difficulty hierarchy',
    ],
    defensePoints: [
      'Based on well-established Student Engagement Index with strong theoretical grounding',
      'Adapted following rigorous guidelines (Beaton et al., 2000) for cross-cultural instrument translation',
      'Comprehensive coverage of three engagement dimensions aligned with engagement theory',
      'Clear, simple language appropriate for college-level respondents in Philippines',
      'Piloted with similar population demonstrating good internal consistency (α = 0.87)',
      'Addresses specific Philippine educational context with culturally relevant examples',
    ],
    metrics: {
      cronbachAlpha: 0.87,
      itemCount: 25,
      subscales: 3,
      contentValidityIndex: 0.92,
    },
  },
};

export const SAMPLE_DEFENSE_RESPONSES = [
  {
    questionType: 'Content Validity',
    questionText: 'How did you ensure that your instrument adequately measures all aspects of student engagement?',
    aiGeneratedResponse: `Our instrument development process followed rigorous content validity procedures. We conducted a comprehensive literature review to identify the key dimensions of student engagement, which we operationalized into three domains: cognitive, behavioral, and emotional engagement. We then assembled a panel of three subject matter experts—two educational psychology professors and one student engagement specialist—who reviewed all items and rated their relevance to each construct. We calculated the Content Validity Index, which exceeded 0.90, indicating strong alignment between items and constructs. Additionally, we conducted cognitive interviews with 8 students to ensure items were clear and culturally appropriate for the Philippine context.`,
    keyPoints: [
      'Conducted literature review to identify engagement dimensions',
      'Used expert panel review (n=3) with CVI > 0.90',
      'Performed cognitive interviews with target population',
      'Adapted items for Philippine cultural context',
      'Ensured comprehensive coverage of construct domain',
    ],
    citations: [
      'Fredricks, J. A., Blumenfeld, P. C., & Paris, A. H. (2004). School engagement: Potential of the concept, state of the evidence. Review of Educational Research, 74(1), 59-109.',
      'Kahu, E. R. (2013). Framing student engagement in higher education. Studies in Higher Education, 38(5), 758-773.',
    ],
  },
  {
    questionType: 'Construct Validity',
    questionText: 'What evidence do you have that your three-factor structure (cognitive, behavioral, emotional) is valid?',
    aiGeneratedResponse: `Our three-factor model is grounded in established engagement theory and supported by preliminary evidence. We conducted an exploratory factor analysis with our pilot sample (n=120), which confirmed the three-factor structure. Factor loadings ranged from 0.65 to 0.89, indicating strong relationships between items and their respective constructs. Convergent validity was demonstrated through strong internal consistency for each subscale: cognitive engagement (α = 0.84), behavioral engagement (α = 0.81), and emotional engagement (α = 0.89). We also calculated inter-factor correlations (r = 0.42-0.58), indicating adequate discriminant validity. We plan to conduct confirmatory factor analysis with a larger sample to further validate this structure.`,
    keyPoints: [
      'EFA confirmed three-factor structure (n=120)',
      'Factor loadings: 0.65-0.89',
      'Strong internal consistency (α = 0.81-0.89)',
      'Adequate inter-factor correlations (r = 0.42-0.58)',
      'CFA planned for larger sample validation',
    ],
    citations: [
      'Kline, R. B. (2015). Principles and practice of structural equation modeling (4th ed.).',
      'Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2018). Multivariate data analysis (8th ed.).',
    ],
  },
];

export const SAMPLE_PRACTICE_QUESTIONS = [
  {
    id: 'q1',
    questionText: 'How did you address potential biases in your instrument design and administration?',
    questionType: 'Methodology',
    expectedPoints: [
      'Identified potential sources of bias during development',
      'Implemented strategies to minimize response bias',
      'Described training procedures for instrument administration',
      'Discussed cultural adaptation to reduce measurement bias',
    ],
  },
  {
    id: 'q2',
    questionText: 'What is the significance of your research for Philippine education?',
    questionType: 'Significance',
    expectedPoints: [
      'Connected findings to Philippine educational context',
      'Identified practical implications for educators',
      'Discussed potential policy recommendations',
      'Highlighted contribution to local research literature',
    ],
  },
  {
    id: 'q3',
    questionText: 'How do you plan to ensure your instrument is reliable across different student groups?',
    questionType: 'Reliability',
    expectedPoints: [
      'Conducted reliability testing across demographic groups',
      'Discussed measurement invariance procedures',
      'Explained test-retest procedures and intervals',
      'Addressed potential issues with Cronbach\'s alpha limitations',
    ],
  },
];

export const SAMPLE_SLIDES = [
  {
    slideNumber: 1,
    title: 'Student Engagement Instrument Validity',
    content: 'Comprehensive Overview of Validation Evidence\nInstrument: Student Engagement and Academic Performance Survey\nValidation Approach: Mixed Methods\nSample: N=120 college students',
    notes: 'Opening slide - introduce your instrument and validation approach',
  },
  {
    slideNumber: 2,
    title: 'Instrument Description',
    content: `Type: Survey/Questionnaire
Items: 25 items across 3 dimensions
Subscales: Cognitive (8 items), Behavioral (8 items), Emotional (9 items)
Sample: College students in the Philippines
Adapted from: Student Engagement Index (Fredricks et al., 2004)
Cultural Adaptation: Based on Beaton et al. (2000) guidelines`,
    notes: 'Provide specific details about your instrument structure and adaptation process',
  },
  {
    slideNumber: 3,
    title: 'Content Validity Evidence',
    content: `• Expert Panel Review (n = 3 experts)
• Content Validity Index (CVI) = 0.92
• Cognitive Interviews (n = 8 students)
• Item-Level CVI = 0.85-1.00
• Cultural Adaptation Review Completed
• Item Clarity Verified with Target Population`,
    notes: 'Emphasize expert consensus and cultural appropriateness',
  },
  {
    slideNumber: 4,
    title: 'Construct Validity Evidence',
    content: `• Exploratory Factor Analysis Results
• Three-Factor Structure Confirmed (χ² = 145.32, p < 0.001)
• Factor Loadings: 0.65 - 0.89
• Convergent Validity: α = 0.81 - 0.89
• Discriminant Validity: r = 0.42 - 0.58
• Planned: Confirmatory Factor Analysis`,
    notes: 'Present factor structure clearly and explain construct relationships',
  },
  {
    slideNumber: 5,
    title: 'Reliability Assessment',
    content: `• Internal Consistency (Cronbach's Alpha)
  - Cognitive Engagement: α = 0.84
  - Behavioral Engagement: α = 0.81
  - Emotional Engagement: α = 0.89
  - Overall Scale: α = 0.87
• Test-Retest Reliability: ICC = 0.79 (2-week interval)
• Interpretation: Strong Internal Consistency`,
    notes: 'Highlight reliability coefficients and their interpretation',
  },
  {
    slideNumber: 6,
    title: 'Research Implications & Recommendations',
    content: `Theoretical Implications:
• Validates three-dimensional engagement model for Philippines
• Confirms applicability of Western engagement theory locally

Practical Applications:
• Can be used to assess student engagement interventions
• Supports data-driven decision making in education

Limitations & Future Research:
• Conduct CFA with larger sample
• Examine measurement invariance across demographics
• Longitudinal studies to establish predictive validity`,
    notes: 'Conclude with comprehensive implications and future directions',
  },
];
