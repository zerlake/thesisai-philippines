export interface ModuleContent {
  title: string;
  duration: string;
  overview: string;
  keyPoints: string[];
  practicalTips: string[];
  caseStudy: {
    title: string;
    scenario: string;
    challenge: string;
    solution: string;
  };
  resources: string[];
  quiz?: {
    question: string;
    options: string[];
    correct: number;
  }[];
  checklist?: string[];
  additionalContent?: {
    title: string;
    items: {
      subtitle: string;
      description: string;
      example?: string;
    }[];
  };
}

export interface CourseData {
  id: number;
  title: string;
  duration: string;
  progress: number;
  status: "completed" | "in-progress" | "not-started";
  description: string;
  modules: ModuleContent[];
  resources: string[];
}

export const trainingCourses: CourseData[] = [
  {
    id: 1,
    title: "Effective Thesis Advising",
    duration: "2 hours",
    progress: 100,
    status: "completed",
    description: "Master the fundamentals of successful thesis supervision and student mentorship",
    modules: [
      {
        title: "Understanding Your Role as an Advisor",
        duration: "30 mins",
        overview: "Learn the fundamental responsibilities and expectations of a thesis advisor, including ethical guidelines and professional standards.",
        keyPoints: [
          "Core responsibilities of thesis advisors",
          "Ethical guidelines and academic integrity",
          "Balancing support with independence",
          "Legal and institutional requirements",
          "Professional boundaries and relationships"
        ],
        practicalTips: [
          "Create a clear advisor-student agreement at the start of each advising relationship",
          "Document all major decisions and meetings in writing for accountability",
          "Set regular check-in schedules (weekly or bi-weekly) and stick to them",
          "Establish response time expectations for emails and draft reviews (e.g., 1 week for chapters)",
          "Know when to involve department chairs or ethics committees in complex situations"
        ],
        caseStudy: {
          title: "Navigating Dual Relationships",
          scenario: "Dr. Santos has been asked to advise a student who is also a family friend. The student's research aligns perfectly with Dr. Santos's expertise.",
          challenge: "How should Dr. Santos handle this situation to maintain professional boundaries while providing quality mentorship?",
          solution: "Dr. Santos should: 1) Disclose the relationship to the department chair immediately, 2) Establish clear professional boundaries in a written agreement, 3) Consider having a co-advisor to provide oversight and second opinions, 4) Document all interactions and decisions meticulously, 5) Avoid socializing with the student during the advisory period. This transparency protects both parties and maintains academic integrity."
        },
        resources: [
          "Advisor Code of Ethics (PDF)",
          "Sample Advisor-Student Agreement Template",
          "Institutional Guidelines Checklist",
          "Conflict of Interest Disclosure Form"
        ]
      },
      {
        title: "Setting Clear Expectations with Students",
        duration: "30 mins",
        overview: "Establish clear communication channels, timelines, and quality standards to prevent misunderstandings and ensure project success.",
        keyPoints: [
          "Creating comprehensive project timelines with realistic milestones",
          "Defining quality standards and deliverable formats",
          "Establishing communication protocols (email, meetings, emergency contact)",
          "Setting boundaries for availability (office hours, response times)",
          "Managing student expectations about workload and difficulty"
        ],
        practicalTips: [
          "Hold a comprehensive kick-off meeting in the first week to discuss goals and expectations",
          "Create a shared timeline with milestones, deadlines, and dependencies",
          "Provide examples of acceptable work quality from past successful theses",
          "Specify your preferred communication channels (email vs. messaging apps)",
          "Be explicit about turnaround times: 'I will review chapters within 7 business days of submission'"
        ],
        caseStudy: {
          title: "Unrealistic Timeline Expectations",
          scenario: "Maria, a working professional, expects to complete her thesis in 3 months while working full-time. Her advisor, Dr. Reyes, knows this is unrealistic given her complex methodology.",
          challenge: "How should Dr. Reyes address Maria's timeline without demotivating her?",
          solution: "Dr. Reyes should: 1) Present a realistic timeline based on similar past projects (e.g., 8-12 months), 2) Break down the work into phases with estimated durations, 3) Show data on how work hours affect completion time, 4) Help Maria understand the quality-time tradeoff, 5) Create a feasible plan that accounts for her work schedule (e.g., focused work on weekends, lighter weeks during busy work periods). Together, they agree on a 10-month timeline with built-in buffer time."
        },
        resources: [
          "Thesis Timeline Template (Excel)",
          "Expectations Document Template",
          "First Meeting Agenda Checklist",
          "Sample Project Roadmaps"
        ],
        checklist: [
          "Schedule initial meeting within first week of advising relationship",
          "Create shared document outlining expectations and responsibilities",
          "Agree on meeting frequency (weekly/biweekly) and format (in-person/virtual)",
          "Establish email response time expectations for both parties",
          "Set specific deadlines for each thesis chapter and revision cycle",
          "Define what constitutes 'complete' for each deliverable",
          "Discuss authorship and potential publication plans",
          "Clarify roles in data collection, analysis, and writing",
          "Document consequences for missed deadlines",
          "Schedule mid-point evaluation of progress"
        ]
      },
      {
        title: "Time Management for Advisors",
        duration: "30 mins",
        overview: "Develop strategies to balance multiple advisees, research, teaching, and administrative duties effectively while maintaining quality mentorship.",
        keyPoints: [
          "Batch processing techniques for efficient feedback delivery",
          "Setting dedicated office hours for student consultations",
          "Using templates and rubrics to reduce repetitive work",
          "Prioritizing advisor responsibilities effectively",
          "Preventing advisor burnout through boundary setting"
        ],
        practicalTips: [
          "Block dedicated 2-3 hour time slots for reading and commenting on thesis drafts",
          "Use feedback templates for common issues (literature review structure, methodology gaps)",
          "Set a maximum number of advisees per semester (recommended: 5-8 for quality mentorship)",
          "Group similar tasks together (e.g., review all methodology chapters on Tuesdays)",
          "Learn to say no to over-commitment: quality over quantity in advising"
        ],
        caseStudy: {
          title: "Managing 10 Advisees While Teaching",
          scenario: "Prof. Garcia advises 10 thesis students, teaches 2 courses (60 students total), serves on 3 committees, and conducts personal research. Students complain about receiving feedback 3-4 weeks after submission.",
          challenge: "How can Prof. Garcia manage time more effectively without sacrificing quality?",
          solution: "Prof. Garcia implements: 1) Staggered submission deadlines so not all students submit in the same week, 2) Dedicated thesis reading blocks on Tuesday/Thursday afternoons (3 hours each), 3) Template-based feedback for common issues with personalized additions, 4) Group feedback sessions for students at similar stages, 5) Hired a teaching assistant to help with course grading, 6) Committed to reducing advisee load to 8 next semester, 7) Set auto-reply email indicating expected response times. Result: Feedback time reduced to 7-10 days."
        },
        resources: [
          "Advisor Time Tracking Template",
          "Weekly Planning Worksheet for Advisors",
          "Comprehensive Feedback Template Library",
          "Student Scheduling Tool"
        ],
        additionalContent: {
          title: "Time Management Strategies",
          items: [
            {
              subtitle: "The Pomodoro Technique",
              description: "Review thesis drafts in 25-minute focused sessions with 5-minute breaks between sessions",
              example: "Use for intensive reading and commenting on student work. Set timer, focus solely on one draft, take break, repeat."
            },
            {
              subtitle: "Batch Processing",
              description: "Dedicate specific days for specific advisory tasks to minimize context switching",
              example: "Mondays: Email responses, Tuesdays: Literature review feedback, Wednesdays: Methodology reviews, Thursdays: Results/discussion feedback, Fridays: Student meetings"
            },
            {
              subtitle: "The 2-Minute Rule",
              description: "If a student email or task can be completed in 2 minutes or less, do it immediately to prevent backlog",
              example: "Quick questions, brief clarifications, meeting confirmations - handle on the spot rather than adding to to-do list"
            },
            {
              subtitle: "Time Blocking",
              description: "Reserve specific time blocks in your calendar exclusively for thesis advising work",
              example: "Block 9-11am Tuesday/Thursday as 'Thesis Review Time' - treat like any other unmovable commitment"
            }
          ]
        }
      },
      {
        title: "Building Productive Advisor-Student Relationships",
        duration: "30 mins",
        overview: "Foster supportive, professional relationships that motivate students while maintaining appropriate boundaries and promoting independent research.",
        keyPoints: [
          "Establishing trust and psychological safety in advisory relationships",
          "Active listening techniques and empathetic communication",
          "Recognizing and appropriately addressing student stress and mental health concerns",
          "Cultural sensitivity and inclusivity in diverse advisory contexts",
          "Handling difficult conversations with professionalism and compassion"
        ],
        practicalTips: [
          "Start each meeting by asking about student well-being: 'How are you doing with everything?'",
          "Celebrate small wins and progress milestones to maintain motivation",
          "Provide balanced feedback: identify both strengths and areas for improvement",
          "Be transparent about your own research challenges and learning process",
          "Recognize signs of burnout or mental health issues early and connect students to resources"
        ],
        caseStudy: {
          title: "Student Experiencing Burnout",
          scenario: "John, usually punctual and engaged, has missed two consecutive meetings without explanation and submitted rushed, low-quality work for the first time. When finally reached, he mentions feeling 'completely overwhelmed.'",
          challenge: "How should the advisor respond to support John while maintaining academic standards?",
          solution: "The advisor should: 1) Schedule a private, non-judgmental conversation in a comfortable setting, 2) Express genuine concern without adding to pressure, 3) Listen actively to understand root causes (personal issues, multiple deadlines, perfectionism), 4) Help John break down tasks into smaller, manageable pieces, 5) Consider reasonable timeline adjustments if justified, 6) Provide campus mental health and counseling resources, 7) Schedule more frequent, shorter check-ins (15-30 mins weekly) to monitor well-being, 8) Document the situation and support plan for departmental records, 9) Follow up consistently. This approach addresses the human element while maintaining progress toward degree completion."
        },
        resources: [
          "Mental Health Resources for Graduate Students",
          "Difficult Conversations Script Templates",
          "Cultural Competency Guide for Advisors",
          "Student Support Services Directory"
        ],
        additionalContent: {
          title: "Communication Techniques",
          items: [
            {
              subtitle: "Active Listening",
              description: "Fully concentrate on what the student is saying, show you're listening through body language and verbal cues, provide thoughtful feedback, defer judgment until full context is understood, and respond appropriately",
              example: "Instead of: 'You should try method X.' Try: 'I hear that method Y isn't working as expected. What alternatives have you considered? Let's think through this together.'"
            },
            {
              subtitle: "Growth Mindset Language",
              description: "Frame challenges as learning opportunities rather than failures or deficiencies",
              example: "Instead of: 'This analysis is wrong.' Try: 'This analysis shows good initial thinking. Let's explore how we can strengthen it by considering X and Y.'"
            },
            {
              subtitle: "The Sandwich Method",
              description: "Deliver critical feedback between positive observations to maintain student confidence",
              example: "Start with specific strength → Address improvement area with concrete suggestions → End with encouragement and faith in their ability to improve"
            },
            {
              subtitle: "Socratic Questioning",
              description: "Guide students to solutions through thoughtful questions rather than direct answers",
              example: "Instead of telling them what to do, ask: 'What might be causing this result? What have similar studies done in this situation? What would happen if you tried X?'"
            }
          ]
        },
        checklist: [
          "Create safe space for students to discuss challenges without fear of judgment",
          "Be aware of warning signs: missed meetings, delayed communication, quality drops",
          "Know campus resources: counseling center, writing center, graduate student services",
          "Maintain confidentiality while knowing when to escalate concerns",
          "Provide consistent encouragement balanced with constructive feedback",
          "Respect cultural differences in communication styles and academic expectations",
          "Set clear boundaries while remaining approachable and supportive",
          "Document support provided for accountability and continuity"
        ]
      }
    ],
    resources: ["PDF Guide", "Video Tutorial", "Case Studies", "Advisor Handbook"]
  },
  {
    id: 2,
    title: "Providing Constructive Feedback",
    duration: "1.5 hours",
    progress: 60,
    status: "in-progress",
    description: "Learn techniques for delivering feedback that motivates and improves student work",
    modules: [
      {
        title: "Principles of Effective Feedback",
        duration: "25 mins",
        overview: "Understand the fundamental principles that make feedback actionable, specific, and developmentally appropriate for thesis students.",
        keyPoints: [
          "Specific vs. vague feedback: the importance of concrete examples",
          "Timeliness: providing feedback while work is still fresh in student's mind",
          "Balanced feedback: addressing both strengths and weaknesses",
          "Actionable suggestions: what students can actually do to improve",
          "Forward-looking feedback: connecting current work to future chapters"
        ],
        practicalTips: [
          "Use the 'What, Why, How' framework: What needs improvement, Why it matters, How to fix it",
          "Provide feedback within 7-10 business days while student momentum is maintained",
          "Use track changes and comments in documents for inline, context-specific feedback",
          "Start with strengths: identify what the student did well before addressing weaknesses",
          "End with next steps: clear action items for the student to work on"
        ],
        caseStudy: {
          title: "Vague vs. Specific Feedback",
          scenario: "Student submits literature review chapter. Advisor writes: 'This needs more work. The structure is unclear and sources are insufficient.'",
          challenge: "Student is confused and doesn't know where to start. What went wrong?",
          solution: "The feedback is too vague. Better approach: 'Your literature review has good potential. Strengths: You identified key themes (A, B, C) and included recent studies. Areas to develop: 1) Add transition sentences between sections (see paragraph 3-4), 2) Include seminal works from before 2015 (I've listed 5 key papers in comments), 3) Reorganize section 2 chronologically rather than by author. See attached example from last year's successful thesis. Please revise and resubmit by [date]. Let's discuss section 2 structure in our next meeting.' This gives student clear direction."
        },
        resources: [
          "Feedback Quality Checklist",
          "Track Changes Best Practices Guide",
          "Sample Annotated Feedback Examples"
        ]
      },
      {
        title: "Balancing Criticism with Encouragement",
        duration: "20 mins",
        overview: "Master the art of delivering critical feedback while maintaining student motivation and confidence.",
        keyPoints: [
          "The psychological impact of feedback on student motivation",
          "Identifying and reinforcing student strengths",
          "Framing criticism as developmental opportunities",
          "Adjusting feedback style to individual student needs",
          "Recognizing when students need more support vs. more challenge"
        ],
        practicalTips: [
          "Use a 3:1 or 2:1 ratio of positive to constructive comments when possible",
          "Frame criticism in growth terms: 'This will be even stronger when you...'",
          "Acknowledge effort and improvement, not just outcomes",
          "Vary feedback intensity based on student confidence level and thesis stage",
          "Follow up harsh but necessary feedback with supportive check-in"
        ],
        caseStudy: {
          title: "Harsh Feedback Demotivates High-Achieving Student",
          scenario: "An advisor's direct criticism of a methodology chapter causes a typically confident student to doubt their entire research approach and consider dropping out.",
          challenge: "How can advisors deliver critical feedback without crushing student confidence?",
          solution: "The advisor should: 1) Acknowledge the impact of feedback and schedule immediate meeting, 2) Clarify that criticism was about specific methodology execution, not student's ability, 3) Highlight what's working well in the research, 4) Provide clear path forward with step-by-step guidance, 5) Share examples of how all researchers face similar challenges, 6) Offer increased support during methodology revision, 7) Adjust future feedback tone to be firm but encouraging. Result: Student regains confidence and improves methodology with support."
        },
        resources: [
          "Motivational Feedback Phrases Library",
          "Student Psychology in Graduate Education (Article)",
          "Growth Mindset in Academic Advising"
        ]
      },
      {
        title: "Using Rubrics and Templates",
        duration: "25 mins",
        overview: "Learn to create and utilize rubrics and templates to provide consistent, comprehensive feedback efficiently.",
        keyPoints: [
          "Benefits of rubrics: consistency, transparency, efficiency",
          "Creating chapter-specific rubrics (literature review, methodology, results, discussion)",
          "Using comment templates for common issues while personalizing feedback",
          "Adapting rubrics to different research methodologies and disciplines",
          "Communicating rubric criteria to students upfront"
        ],
        practicalTips: [
          "Develop rubrics collaboratively with other advisors for departmental consistency",
          "Share rubrics with students BEFORE they write to set clear expectations",
          "Use weighted rubrics: some criteria more important than others",
          "Create comment library for common issues but always add personalized context",
          "Update rubrics based on recurring student challenges"
        ],
        caseStudy: {
          title: "Streamlining Feedback for Multiple Advisees",
          scenario: "Advisor spends 4-5 hours reviewing each chapter from 8 students, leading to 32-40 hours per round of reviews and significant delays.",
          challenge: "How can the advisor maintain quality while reducing time spent?",
          solution: "Develop chapter-specific rubrics with weighted criteria (e.g., Literature Review: Comprehensiveness 30%, Critical Analysis 30%, Organization 20%, Writing Quality 20%). Create template comments for common issues like 'Need more recent sources - include studies from past 5 years' with placeholders for specific examples. Use rubric to systematically evaluate each chapter, adding personalized comments only where needed. Result: Review time reduced to 2-2.5 hours per chapter while maintaining or improving feedback quality. Students appreciate consistent criteria across all advisees."
        },
        resources: [
          "Thesis Chapter Rubric Templates (Lit Review, Methods, Results, Discussion)",
          "Comment Template Library (100+ common feedback items)",
          "Rubric Creation Guide",
          "Sample Weighted Rubrics from Top Universities"
        ],
        additionalContent: {
          title: "Sample Rubric Criteria",
          items: [
            {
              subtitle: "Literature Review",
              description: "Comprehensiveness (30%), Critical Analysis (30%), Synthesis (20%), Organization (10%), Writing Quality (10%)",
              example: "Excellent (90-100%): Comprehensive coverage of field, insightful critical analysis, clear synthesis of themes, logical organization, publication-ready writing"
            },
            {
              subtitle: "Methodology",
              description: "Appropriateness (30%), Rigor (25%), Clarity (20%), Reproducibility (15%), Ethical Considerations (10%)",
              example: "Good (80-89%): Method appropriate for research questions, mostly rigorous with minor gaps, clearly explained, largely reproducible, ethics addressed"
            },
            {
              subtitle: "Results",
              description: "Completeness (25%), Accuracy (25%), Presentation (20%), Tables/Figures (20%), Interpretation (10%)",
              example: "Satisfactory (70-79%): Most relevant results included, appears accurate, adequately presented, figures need improvement, basic interpretation provided"
            }
          ]
        }
      },
      {
        title: "Tracking Revision Cycles",
        duration: "20 mins",
        overview: "Implement systems to track feedback, revisions, and student progress through multiple draft iterations.",
        keyPoints: [
          "Documenting feedback across multiple revision rounds",
          "Using version control for thesis documents",
          "Tracking which feedback items have been addressed",
          "Knowing when to move forward vs. request another revision",
          "Maintaining revision history for final defense preparation"
        ],
        practicalTips: [
          "Use clear file naming convention: StudentName_Chapter3_Draft2_Date.docx",
          "Create feedback tracker spreadsheet: Issue | Draft | Status | Resolution",
          "Require students to submit revision summary: 'Here's what I changed and why'",
          "Set maximum number of revisions per chapter (usually 2-3) before moving forward",
          "Save all draft versions for reference during defense preparation"
        ],
        caseStudy: {
          title: "Student Stuck in Revision Loop",
          scenario: "Student has submitted 5 drafts of literature review over 4 months. Each revision addresses some feedback but introduces new issues. Both student and advisor are frustrated.",
          challenge: "How can they break the revision cycle and move forward?",
          solution: "Advisor schedules working session to review feedback history together. They identify pattern: student addresses surface-level comments but misses deeper structural issues. Solution: 1) Create priority list of 'must-fix' vs. 'nice-to-have' issues, 2) Focus next revision only on top 3 structural problems, 3) Set firm deadline and agree this will be final major revision, 4) Schedule follow-up meeting immediately after submission to address any minor remaining issues in person, 5) Document acceptance criteria: 'This chapter is complete enough to move forward when...' Result: Student submits focused revision, meets criteria, moves to methodology chapter."
        },
        resources: [
          "Revision Tracking Spreadsheet Template",
          "Version Control Guide for Academic Writing",
          "Student Revision Checklist Template",
          "When to Move Forward: Decision Framework"
        ],
        checklist: [
          "Establish clear version control system from day one",
          "Maintain feedback log for each chapter across all revisions",
          "Set expectations: maximum revision rounds per chapter",
          "Require revision summary from student with each resubmission",
          "Track major vs. minor issues to prioritize feedback",
          "Save all versions with dates for defense preparation reference",
          "Document when chapter is 'complete enough' to proceed",
          "Conduct periodic progress reviews to avoid getting stuck"
        ]
      }
    ],
    resources: ["Feedback Templates", "Example Reviews", "Quick Reference Guide", "Rubric Creator Tool"]
  },
  {
    id: 3,
    title: "Research Ethics and Integrity",
    duration: "1 hour",
    progress: 0,
    status: "not-started",
    description: "Ensure academic integrity and ethical research practices in student work",
    modules: [
      {
        title: "Plagiarism Detection and Prevention",
        duration: "15 mins",
        overview: "Learn to identify different forms of plagiarism, use detection tools effectively, and guide students on proper citation practices.",
        keyPoints: [
          "Types of plagiarism: direct copying, paraphrasing without citation, self-plagiarism",
          "Using plagiarism detection software (Turnitin, iThenticate)",
          "Interpreting similarity reports and false positives",
          "Preventive measures: teaching students about proper paraphrasing",
          "Handling plagiarism cases according to institutional policies"
        ],
        practicalTips: [
          "Run Turnitin checks on early chapter drafts to catch issues before final submission",
          "Review similarity reports critically - high scores aren't always plagiarism",
          "Teach students the 'read, digest, write' method: read source, close it, then write in own words",
          "Provide clear guidance on acceptable level of quotation vs. paraphrasing",
          "Document all plagiarism concerns and follow institutional reporting procedures"
        ],
        caseStudy: {
          title: "Unintentional Plagiarism in Literature Review",
          scenario: "Turnitin flags 40% similarity in student's literature review. Upon review, advisor finds multiple paragraphs that closely paraphrase sources with only minor word changes, though all sources are cited.",
          challenge: "Is this plagiarism? How should the advisor handle it?",
          solution: "This is improper paraphrasing, a form of unintentional plagiarism. Advisor should: 1) Meet with student to explain the issue without accusation, 2) Show specific examples of problematic paraphrasing, 3) Teach proper paraphrasing techniques with side-by-side comparisons, 4) Require complete revision of flagged sections, 5) Provide paraphrasing workshop resources, 6) Monitor subsequent submissions closely, 7) Document the educational intervention. Most universities treat unintentional first-time cases as teaching opportunities rather than academic misconduct."
        },
        resources: [
          "Plagiarism Detection Guide",
          "Proper Paraphrasing Tutorial (Video)",
          "Citation Style Guides (APA, MLA, Chicago)",
          "Institutional Plagiarism Policy"
        ]
      },
      {
        title: "Research Ethics Fundamentals",
        duration: "15 mins",
        overview: "Understand core ethical principles in research including informed consent, IRB processes, and responsible conduct.",
        keyPoints: [
          "Belmont Report principles: respect for persons, beneficence, justice",
          "IRB/Ethics committee approval process and requirements",
          "Informed consent procedures for human subjects research",
          "Ethical considerations in vulnerable populations",
          "Research misconduct: fabrication, falsification, plagiarism"
        ],
        practicalTips: [
          "Start IRB process early - can take 2-4 months for approval",
          "Review student's IRB application draft before official submission",
          "Ensure informed consent forms are in appropriate language for participants",
          "Keep approved IRB protocols and any amendments on file",
          "Report any protocol deviations or adverse events immediately"
        ],
        caseStudy: {
          title: "Unapproved Protocol Changes",
          scenario: "Student conducting interviews realizes initial questions don't capture needed data. Without consulting advisor or IRB, student adds new questions to interview protocol.",
          challenge: "What are the ethical and regulatory implications?",
          solution: "This is a protocol violation requiring immediate action. Advisor must: 1) Stop data collection immediately, 2) Assess if collected data can be used (may need to be discarded), 3) Submit protocol amendment to IRB before continuing, 4) Educate student on why advance approval is required, 5) Wait for IRB approval before resuming, 6) Document the violation and corrective action. Lesson: Any protocol changes, even seemingly minor ones, require IRB approval. This protects both researchers and participants."
        },
        resources: [
          "IRB Application Checklist",
          "Informed Consent Template",
          "Research Ethics Training Certificate Programs",
          "Belmont Report (Full Text)"
        ]
      },
      {
        title: "Data Handling and Privacy",
        duration: "15 mins",
        overview: "Learn best practices for collecting, storing, securing, and sharing research data while protecting participant privacy.",
        keyPoints: [
          "Data security requirements for different sensitivity levels",
          "De-identification and anonymization techniques",
          "GDPR and data protection regulations",
          "Data retention policies and timeline",
          "Secure data sharing and collaboration practices"
        ],
        practicalTips: [
          "Use encrypted storage for all research data (institutional Google Drive, encrypted external drives)",
          "Remove direct identifiers immediately after data collection if possible",
          "Use code numbers instead of names to link data to consent forms",
          "Store consent forms separately from research data",
          "Create data management plan specifying retention period (usually 5-7 years)"
        ],
        caseStudy: {
          title: "Data Breach: Laptop Theft",
          scenario: "Student's laptop containing unencrypted research data from 50 interview participants is stolen from their car. Data includes names, contact information, and sensitive interview transcripts.",
          challenge: "What should have been done differently? What actions are needed now?",
          solution: "Prevention: All research data should have been on encrypted drives, with backups on secure institutional servers. Local copies should be encrypted. Now required: 1) Immediately report to IRB, institutional data security office, and possibly data protection authority, 2) Attempt to contact all 50 participants to inform them of breach, 3) Document incident thoroughly, 4) Assess if participants face actual risk, 5) Offer support resources if needed, 6) Implement corrective measures for remaining data, 7) May need to halt research pending review. Major lesson in data security importance."
        },
        resources: [
          "Data Security Best Practices Guide",
          "Data Management Plan Template",
          "De-identification Guidelines",
          "GDPR Compliance Checklist for Researchers"
        ]
      },
      {
        title: "Citation and Attribution Standards",
        duration: "15 mins",
        overview: "Master different citation styles and ensure students give proper credit for all sources and ideas.",
        keyPoints: [
          "Major citation styles: APA, MLA, Chicago, IEEE and when to use each",
          "What requires citation: direct quotes, paraphrases, ideas, data, images",
          "Common citation mistakes students make",
          "Using reference management software (Zotero, Mendeley, EndNote)",
          "Self-citation guidelines and avoiding citation manipulation"
        ],
        practicalTips: [
          "Establish required citation style at project start (usually discipline-specific)",
          "Recommend reference management software early - saves time later",
          "Check that all in-text citations have corresponding reference list entries and vice versa",
          "Review citation formatting in detail for at least one early chapter",
          "Provide style guide quick reference sheet for common citation types"
        ],
        caseStudy: {
          title: "Reference List Errors in Near-Final Draft",
          scenario: "Student submits 'final' draft for defense preparation. Advisor spot-checks references and finds 15 errors: missing authors, incorrect years, journals not italicized, inconsistent formatting.",
          challenge: "How should this have been prevented? What to do now?",
          solution: "Prevention: Citation style should have been checked in early chapters and made a rubric criterion for all chapter reviews. Now required: 1) Student must verify and correct ALL 120 references before defense, 2) Use reference management software to auto-format (may need to rebuild library), 3) Advisor spot-checks 10% of references after correction, 4) Delay defense if necessary - incorrect citations affect credibility, 5) Create citation checklist for future students. This is tedious but essential - committee members will notice errors."
        },
        resources: [
          "APA 7th Edition Quick Guide",
          "Zotero Setup and Tutorial",
          "Common Citation Errors Checklist",
          "Reference Management Software Comparison"
        ]
      }
    ],
    resources: ["Ethics Checklist", "Policy Documents", "Case Examples", "IRB Guide"]
  }
];
