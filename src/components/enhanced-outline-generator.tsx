"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FieldOfStudySelector } from "./field-of-study-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  BookOpen,
  Wand2,
  FlaskConical,
  Users,
  BarChart3,
  Lightbulb,
  ScrollText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  History,
  Download,
  RefreshCw,
  Quote,
  FilePlus2,
  Save,
  Library,
  Globe,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
  Loader2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { UpgradePrompt } from "./upgrade-prompt";
import { cn } from "../lib/utils";
import { EnhancedDynamicStructureAdapterService } from "../services/enhanced-dynamic-structure-adapter-service";

// Define types for our enhanced outline generator
type ResearchMethodology = {
  type: "quantitative" | "qualitative" | "mixed" | "experimental" | "survey" | "case-study" | "ethnographic" | "action-research";
  description: string;
  suitableFor: string[];
  dataCollection: string[];
  analysisApproach: string;
  chapterStructure: ChapterTemplate[];
  requiredSections: string[];
  optionalSections: string[];
  researchQuestionTemplates: string[];
  dataCollectionGuidance: string;
  analysisGuidance: string;
  commonChallenges: Challenge[];
  // New fields for enhanced structure adaptation
  methodologySpecificSections: MethodologySection[];
  universityCompliance: UniversityComplianceReport;
};

type ChapterTemplate = {
  chapter: number;
  title: string;
  requiredSections: string[];
  optionalSections: string[];
  methodologyEmphasis: string;
};

type Challenge = {
  challenge: string;
  mitigation: string;
};

type EnhancedOutline = {
  content: string;
  methodologyAlignment: string;
  researchQuestions: string[];
  dataSources: string[];
  timelineEstimate: string;
  potentialChallenges: string[];
  // New fields for enhanced structure adaptation
  methodologySpecificSections: MethodologySection[];
  universityCompliance: UniversityComplianceReport;
};

type MethodologySection = {
  title: string;
  content: string;
  purpose: string;
};

type UniversityComplianceReport = {
  compliant: boolean;
  violations: FormatViolation[];
  suggestions: string[];
};

type FormatViolation = {
  section: string;
  guideline: string;
  violation: string;
  suggestion: string;
};

type UniversityFormat = {
  name: string;
  slug: string;
  preliminaries: string[];
  chapterStructure: ChapterRequirement[];
  formatting: FormattingRequirements;
  endMatter: string[];
};

type ChapterRequirement = {
  chapter: number;
  title: string;
  requiredSections: string[];
  optionalSections: string[];
};

type FormattingRequirements = {
  font: string;
  fontSize: number;
  spacing: "single" | "one-and-half" | "double";
  margins: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  pagination: PaginationRequirements;
};

type PaginationRequirements = {
  preliminaries: "center-bottom" | "top-right" | "top-left";
  mainText: "center-bottom" | "top-right" | "top-left";
  romanNumerals: boolean;
  arabicNumerals: boolean;
};

// Define methodology options with enhanced structure adaptation
const METHODOLOGY_OPTIONS: ResearchMethodology[] = [
  {
    type: "quantitative",
    description: "Uses numerical data and statistical analysis to test hypotheses",
    suitableFor: ["Surveys", "Experiments", "Correlational studies"],
    dataCollection: ["Questionnaires", "Experiments", "Secondary data analysis"],
    analysisApproach: "Statistical analysis (SPSS, R, Python)",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Hypothesis", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework"],
        methodologyEmphasis: "Clearly state testable hypotheses and identify variables"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Foreign Literature", "Local Literature", "Foreign Studies", "Local Studies", "Synthesis"],
        optionalSections: ["Theoretical Foundations", "Conceptual Literature"],
        methodologyEmphasis: "Focus on empirical studies with measurable variables"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Research Design", "Population and Sample", "Research Instrument", "Data Gathering Procedure", "Statistical Treatment of Data"],
        optionalSections: ["Validity and Reliability of Instrument", "Ethical Considerations"],
        methodologyEmphasis: "Detail statistical tools and justify variable selection"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Presentation of Data", "Analysis of Data", "Interpretation of Data"],
        optionalSections: ["Statistical Tables", "Graphical Representations"],
        methodologyEmphasis: "Present numerical results with appropriate statistical tests"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Base conclusions on statistical findings and relate to hypotheses"
      }
    ],
    requiredSections: ["Hypothesis Testing", "Variable Identification", "Statistical Tools"],
    optionalSections: ["Reliability Testing", "Validity Assessment"],
    researchQuestionTemplates: [
      "What is the relationship between [variable A] and [variable B]?",
      "Is there a significant difference in [dependent variable] between [group 1] and [group 2]?",
      "To what extent does [independent variable] predict [dependent variable]?"
    ],
    dataCollectionGuidance: "Ensure large enough sample size for statistical significance. Use validated instruments with established reliability coefficients. Implement random sampling when possible.",
    analysisGuidance: "Apply appropriate parametric or non-parametric tests based on data distribution. Report effect sizes along with p-values. Use multiple regression for complex relationships.",
    commonChallenges: [
      {
        challenge: "Insufficient sample size for desired statistical power",
        mitigation: "Conduct a power analysis before data collection to determine minimum sample size. If increasing sample size is not feasible, consider non-parametric alternatives."
      },
      {
        challenge: "Violations of statistical assumptions (normality, homoscedasticity)",
        mitigation: "Test assumptions before analysis. Use transformations or non-parametric tests when assumptions are violated. Report which tests were used and why."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Statistical Power Analysis",
        content: "Conduct a power analysis before data collection to determine the minimum sample size required for detecting meaningful effects. Use software like G*Power to calculate sample size based on expected effect size, alpha level, and desired power.",
        purpose: "Ensures adequate sample size for statistical significance"
      },
      {
        title: "Variable Selection Justification",
        content: "Justify the selection of independent and dependent variables based on theoretical frameworks and previous literature. Clearly define operational definitions for all variables.",
        purpose: "Provides rationale for variable inclusion"
      },
      {
        title: "Statistical Tool Selection",
        content: "Select appropriate statistical tools based on data type, distribution, and research questions. Justify parametric vs. non-parametric choices with preliminary data analysis.",
        purpose: "Guides selection of analysis methods"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  },
  {
    type: "qualitative",
    description: "Explores phenomena through words, images, and observations",
    suitableFor: ["Interviews", "Focus groups", "Ethnographies", "Case studies"],
    dataCollection: ["Interviews", "Focus groups", "Observations", "Document analysis"],
    analysisApproach: "Thematic analysis, grounded theory, narrative analysis",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework", "Research Questions"],
        methodologyEmphasis: "Focus on exploratory research questions rather than testable hypotheses"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Conceptual Literature", "Theoretical Foundations", "Synthesis"],
        optionalSections: ["Paradigm Context", "Cultural Perspectives"],
        methodologyEmphasis: "Emphasize conceptual and theoretical foundations over empirical studies"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Research Design", "Participants/Subjects", "Data Collection Procedure", "Data Analysis Procedure"],
        optionalSections: ["Trustworthiness Measures", "Ethical Considerations", "Positionality Statement"],
        methodologyEmphasis: "Detail participant selection criteria and data collection methods"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Participant Profiles", "Thematic Analysis", "Interpretation of Themes"],
        optionalSections: ["Narrative Excerpts", "Visual Data Analysis"],
        methodologyEmphasis: "Present rich, detailed quotes and narratives with thematic organization"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Base conclusions on identified themes and their interpretations"
      }
    ],
    requiredSections: ["Research Questions", "Data Collection Methods", "Analysis Procedures"],
    optionalSections: ["Reflexivity Statement", "Member Checking"],
    researchQuestionTemplates: [
      "How do [participants] experience [phenomenon]?",
      "What are the underlying meanings of [experience] for [participants]?",
      "How is [process] understood and enacted within [context]?"
    ],
    dataCollectionGuidance: "Develop rapport with participants to encourage honest responses. Use multiple data sources (triangulation) when possible. Maintain detailed field notes and recording logs.",
    analysisGuidance: "Engage in iterative coding cycles. Move between data collection and analysis. Maintain an audit trail of analytical decisions. Ensure themes are supported by sufficient data excerpts.",
    commonChallenges: [
      {
        challenge: "Researcher bias influencing data interpretation",
        mitigation: "Maintain reflexivity throughout the research process. Keep detailed analytical memos. Seek peer debriefing or member checking when possible."
      },
      {
        challenge: "Difficulty in achieving data saturation",
        mitigation: "Continue data collection until no new themes emerge. Use purposive sampling to maximize variation. Document the sampling process and rationale for stopping."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Reflexivity Statement",
        content: "Maintain a detailed reflexive journal documenting personal reactions and biases. Seek peer debriefing and external auditing. Use member checking to validate interpretations. Acknowledge limitations in cultural representation.",
        purpose: "Addresses researcher positionality and bias"
      },
      {
        chapter: 3,
        title: "Ethical Considerations",
        requiredSections: ["Informed Consent", "Confidentiality", "Anonymity"],
        optionalSections: ["IRB Approval", "Cultural Sensitivity"],
        methodologyEmphasis: "Detail ethical procedures for participant protection"
      },
      {
        title: "Coding Scheme Development",
        content: "Develop a systematic coding scheme through iterative cycles. Move between data collection and analysis. Maintain an audit trail of analytical decisions. Ensure themes are supported by sufficient data excerpts.",
        purpose: "Guides qualitative data analysis"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  },
  {
    type: "mixed",
    description: "Combines quantitative and qualitative approaches",
    suitableFor: ["Complex research questions", "Triangulation studies", "Program evaluations"],
    dataCollection: ["Surveys and interviews", "Experimental and observational data"],
    analysisApproach: "Sequential or concurrent analysis of both data types",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Research Questions/Hypotheses", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework"],
        methodologyEmphasis: "Clearly articulate both quantitative and qualitative components and their integration"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Quantitative Literature", "Qualitative Literature", "Integration of Perspectives", "Synthesis"],
        optionalSections: ["Methodological Foundations", "Paradigm Integration"],
        methodologyEmphasis: "Show how quantitative and qualitative literatures inform each other"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Research Design", "Quantitative Component", "Qualitative Component", "Integration Strategy", "Data Analysis Procedures"],
        optionalSections: ["Validity Measures", "Ethical Considerations"],
        methodologyEmphasis: "Detail both quantitative and qualitative methods with integration approach"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Quantitative Results", "Qualitative Results", "Integrated Findings"],
        optionalSections: ["Comparative Analysis", "Contradictory Findings"],
        methodologyEmphasis: "Present both data types and show their relationship or complementarity"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Integrate conclusions from both quantitative and qualitative findings"
      }
    ],
    requiredSections: ["Integration Strategy", "Data Collection Sequence", "Analysis Integration"],
    optionalSections: ["Paradigm Integration", "Mixed Methods Design Type"],
    researchQuestionTemplates: [
      "To what extent do quantitative findings align with qualitative insights regarding [phenomenon]?",
      "How do [quantitative measures] relate to [qualitative experiences] of [participants]?",
      "What does the integration of numerical data and participant narratives reveal about [research problem]?"
    ],
    dataCollectionGuidance: "Ensure both quantitative and qualitative components are given adequate attention. Consider sequential or concurrent data collection based on research design. Maintain consistency in sampling criteria across both methods.",
    analysisGuidance: "Choose appropriate integration approach (merging, connecting, embedding, transforming). Justify the chosen approach based on research questions. Clearly distinguish between quantitative and qualitative findings in presentation.",
    commonChallenges: [
      {
        challenge: "Inadequate integration of quantitative and qualitative findings",
        mitigation: "Select an integration approach that aligns with research questions. Clearly articulate how findings from both methods inform each other. Use visual models to show integration strategy."
      },
      {
        challenge: "Unequal emphasis on quantitative and qualitative components",
        mitigation: "Devote equal analytical rigor to both components. Allocate sufficient time and resources for both data collection and analysis phases. Justify the weighting of each component based on research priorities."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Integration Strategy",
        content: "Choose an appropriate integration approach (merging, connecting, embedding, transforming). Justify the chosen approach based on research questions. Clearly articulate how findings from both methods inform each other.",
        purpose: "Defines how different data types will be combined"
      },
      {
        chapter: 3,
        title: "Validity Measures",
        requiredSections: ["Quantitative Validity", "Qualitative Trustworthiness", "Integration Validity"],
        optionalSections: ["Reliability Testing", "Ethical Considerations"],
        methodologyEmphasis: "Detail validity measures for both quantitative and qualitative components"
      },
      {
        title: "Paradigm Integration",
        content: "Address philosophical tensions between quantitative and qualitative paradigms. Explain how both approaches inform your research questions. Justify the weighting of each component based on research priorities.",
        purpose: "Resolves methodological conflicts"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  },
  {
    type: "experimental",
    description: "Manipulates variables to establish cause-and-effect relationships",
    suitableFor: ["Laboratory studies", "Field experiments", "Quasi-experiments"],
    dataCollection: ["Controlled conditions", "Random assignment", "Pre/post measurements"],
    analysisApproach: "ANOVA, t-tests, regression analysis",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Hypothesis", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework"],
        methodologyEmphasis: "Clearly define independent and dependent variables with operational definitions"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Independent Variable Literature", "Dependent Variable Literature", "Experimental Designs", "Synthesis"],
        optionalSections: ["Control Variables", "Experimental Conditions"],
        methodologyEmphasis: "Focus on previous experimental studies and theoretical foundations"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Experimental Design", "Participants", "Materials/Apparatus", "Procedure", "Statistical Treatment of Data"],
        optionalSections: ["Control Conditions", "Randomization Procedure", "Ethical Considerations"],
        methodologyEmphasis: "Detail experimental manipulation and control procedures"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Experimental Conditions Results", "Statistical Analysis", "Post-hoc Tests"],
        optionalSections: ["Effect Sizes", "Confidence Intervals"],
        methodologyEmphasis: "Present results by experimental condition with appropriate statistical tests"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Relate findings to experimental hypotheses and causal relationships"
      }
    ],
    requiredSections: ["Experimental Design", "Control Conditions", "Randomization", "Statistical Tests"],
    optionalSections: ["Effect Sizes", "Power Analysis"],
    researchQuestionTemplates: [
      "Does manipulating [independent variable] cause a significant change in [dependent variable]?",
      "What is the effect of [treatment] compared to [control] on [outcome measure]?",
      "How does [factor A] interact with [factor B] to influence [dependent variable]?"
    ],
    dataCollectionGuidance: "Ensure proper randomization and blinding procedures. Maintain strict control over extraneous variables. Collect pre-test and post-test measures when appropriate. Document any deviations from planned procedures.",
    analysisGuidance: "Select appropriate statistical tests based on experimental design. Report effect sizes in addition to significance tests. Conduct post-hoc tests when appropriate. Address multiple comparison issues if applicable.",
    commonChallenges: [
      {
        challenge: "Failure to adequately control extraneous variables",
        mitigation: "Identify potential confounding variables during planning phase. Implement appropriate control procedures (randomization, matching, statistical control). Document all control measures taken."
      },
      {
        challenge: "Insufficient statistical power to detect meaningful effects",
        mitigation: "Conduct power analysis during planning to determine appropriate sample size. If increasing sample size is not feasible, consider alternative designs or analytical approaches. Report achieved power in results."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Randomization Procedure",
        content: "Detail the randomization procedure used to assign participants to experimental conditions. Explain how randomization minimizes confounding variables and ensures internal validity.",
        purpose: "Ensures experimental rigor"
      },
      {
        chapter: 3,
        title: "Control Conditions",
        requiredSections: ["Control Group Design", "Manipulation Checks", "Blinding Protocol"],
        optionalSections: ["Placebo Controls", "Ethical Considerations"],
        methodologyEmphasis: "Specify control group procedures and manipulation checks"
      },
      {
        title: "Effect Sizes",
        content: "Report effect sizes (Cohen's d, eta squared) alongside significance tests. Interpret practical significance of your findings in addition to statistical significance.",
        purpose: "Measures practical significance"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  },
  {
    type: "survey",
    description: "Collects data from large samples using standardized instruments",
    suitableFor: ["Attitude studies", "Behavioral research", "Market research"],
    dataCollection: ["Online surveys", "Phone interviews", "Mail questionnaires"],
    analysisApproach: "Descriptive statistics, cross-tabulations, factor analysis",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Research Questions", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework"],
        methodologyEmphasis: "Clearly define survey objectives and target population"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Survey Topic Literature", "Instrument Development", "Population Characteristics", "Synthesis"],
        optionalSections: ["Survey Methodology", "Response Rate Factors"],
        methodologyEmphasis: "Focus on previous survey studies and instrument validation"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Survey Design", "Population and Sample", "Instrument", "Data Gathering Procedure", "Statistical Treatment of Data"],
        optionalSections: ["Pilot Testing", "Non-response Handling", "Ethical Considerations"],
        methodologyEmphasis: "Detail sampling procedure and instrument development/validation"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Response Rate and Sample Characteristics", "Survey Results", "Cross-tabulations", "Statistical Analysis"],
        optionalSections: ["Non-response Analysis", "Weighting Adjustments"],
        methodologyEmphasis: "Present results by demographic segments and key variables"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Base conclusions on survey findings and their implications"
      }
    ],
    requiredSections: ["Sampling Procedure", "Instrument Description", "Response Rate", "Data Analysis Plan"],
    optionalSections: ["Pilot Testing Results", "Non-response Bias Analysis"],
    researchQuestionTemplates: [
      "What are the attitudes and behaviors of [population] regarding [topic]?",
      "How prevalent is [behavior/attitude] among [target group]?",
      "What factors predict [outcome variable] among [population group]?"
    ],
    dataCollectionGuidance: "Ensure questionnaire items are clear and unbiased. Pilot test instruments with subset of target population. Implement strategies to maximize response rates. Protect respondent confidentiality and anonymity.",
    analysisGuidance: "Account for survey weights when appropriate. Handle missing data appropriately. Use cross-tabulations to examine subgroup differences. Report margins of error and confidence intervals.",
    commonChallenges: [
      {
        challenge: "Low response rates affecting representativeness",
        mitigation: "Implement multiple contact attempts. Offer incentives when appropriate. Ensure survey length is reasonable. Send reminders to non-respondents. Consider non-response bias analysis."
      },
      {
        challenge: "Measurement error due to poorly worded items",
        mitigation: "Follow established questionnaire design principles. Pretest instruments with representative sample. Use validated scales when available. Ensure items are unambiguous and culturally appropriate."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Instrument Validation",
        content: "Conduct instrument validation through pilot testing with a representative sample. Calculate reliability coefficients (Cronbach's alpha) and assess content validity through expert review.",
        purpose: "Ensures survey quality and validity"
      },
      {
        chapter: 3,
        title: "Sampling Procedure",
        requiredSections: ["Population Definition", "Sampling Frame", "Sampling Technique", "Sample Size Justification"],
        optionalSections: ["Stratification", "Ethical Considerations"],
        methodologyEmphasis: "Detail sampling strategy and justify sample size"
      },
      {
        title: "Response Rate Optimization",
        content: "Implement strategies to maximize response rates including multiple contact attempts, incentives, reasonable survey length, and timely reminders. Analyze non-response bias if applicable.",
        purpose: "Improves survey representativeness"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  },
  {
    type: "case-study",
    description: "Provides in-depth analysis of a specific situation or entity",
    suitableFor: ["Organizational studies", "Policy analysis", "Program evaluation"],
    dataCollection: ["Document review", "Interviews", "Observations", "Archival data"],
    analysisApproach: "Pattern matching, explanation building, cross-case analysis",
    chapterStructure: [
      {
        chapter: 1,
        title: "Introduction",
        requiredSections: ["Background of the Study", "Statement of the Problem", "Research Questions", "Scope and Delimitation", "Significance of the Study", "Definition of Terms"],
        optionalSections: ["Theoretical Framework", "Conceptual Framework", "Case Selection Rationale"],
        methodologyEmphasis: "Justify case selection and define case boundaries"
      },
      {
        chapter: 2,
        title: "Review of Related Literature",
        requiredSections: ["Case Context Literature", "Theoretical Foundations", "Methodological Literature", "Synthesis"],
        optionalSections: ["Comparative Case Studies", "Case Study Typologies"],
        methodologyEmphasis: "Focus on both substantive area and case study methodology literature"
      },
      {
        chapter: 3,
        title: "Research Methodology",
        requiredSections: ["Case Selection", "Data Sources", "Data Collection Procedure", "Data Analysis Procedure"],
        optionalSections: ["Triangulation Strategy", "Ethical Considerations", "Positionality Statement"],
        methodologyEmphasis: "Detail within-case and cross-case analysis procedures"
      },
      {
        chapter: 4,
        title: "Presentation, Analysis and Interpretation of Data",
        requiredSections: ["Case Description", "Within-case Analysis", "Cross-case Analysis", "Patterns and Themes"],
        optionalSections: ["Chronological Analysis", "Comparative Analysis"],
        methodologyEmphasis: "Present rich case details with analytical interpretations"
      },
      {
        chapter: 5,
        title: "Summary, Conclusions and Recommendations",
        requiredSections: ["Summary", "Conclusions", "Recommendations"],
        optionalSections: ["Implications", "Limitations of the Study", "Suggestions for Further Research"],
        methodologyEmphasis: "Relate findings to broader theoretical and practical implications"
      }
    ],
    requiredSections: ["Case Selection Criteria", "Data Sources", "Analytical Framework", "Validity Measures"],
    optionalSections: ["Cross-case Comparison", "Theory Building"],
    researchQuestionTemplates: [
      "How does [case] illustrate [phenomenon] in [context]?",
      "What are the key factors that explain [outcome] in [specific case]?",
      "How does [theoretical framework] help understand [case phenomenon]?"
    ],
    dataCollectionGuidance: "Develop detailed case profiles. Collect multiple data sources for each case. Maintain chain of evidence from raw data to conclusions. Document analytic decisions and rationale.",
    analysisGuidance: "Begin with detailed case descriptions before moving to cross-case analysis. Look for patterns within and across cases. Use tables and matrices to organize findings. Maintain connection between evidence and conclusions.",
    commonChallenges: [
      {
        challenge: "Difficulty in establishing generalizability of findings",
        mitigation: "Clearly distinguish between analytical generalization (to theory) and naturalistic generalization (to similar cases). Use thick description to enable readers to judge applicability. Consider replication logic across cases."
      },
      {
        challenge: "Managing complexity of multiple data sources and cases",
        mitigation: "Develop systematic data management procedures. Create detailed data matrices and coding schemes. Maintain clear audit trails of analytical decisions. Use visualization tools to track relationships."
      }
    ],
    methodologySpecificSections: [
      {
        title: "Case Selection Justification",
        content: "Justify your case selection with clear criteria. Explain whether using intrinsic, instrumental, or collective case study approaches.",
        purpose: "Ensures appropriate case selection"
      },
      {
        chapter: 3,
        title: "Data Sources",
        requiredSections: ["Primary Sources", "Secondary Sources", "Triangulation Strategy"],
        optionalSections: ["Archival Data", "Ethical Considerations"],
        methodologyEmphasis: "Enumerate all data sources and detail triangulation procedures"
      },
      {
        title: "Theory Building",
        content: "If engaged in theory building, describe how your findings contribute to theoretical development in your field. Connect case-specific insights to broader theoretical frameworks.",
        purpose: "Facilitates theoretical contribution"
      }
    ],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  }
];

export function EnhancedOutlineGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [field, setField] = useState("");
  const [topic, setTopic] = useState("");
  const [methodology, setMethodology] = useState<ResearchMethodology | null>(null);
  const [outline, setOutline] = useState<EnhancedOutline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMethodologyType, setSelectedMethodologyType] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("pup");

  // Reset outline when topic or field changes
  useEffect(() => {
    setOutline(null);
  }, [topic, field]);

  const handleMethodologyChange = (value: string) => {
    setSelectedMethodologyType(value);
    const selectedMethod = METHODOLOGY_OPTIONS.find(m => m.type === value) || null;
    setMethodology(selectedMethod);
    
    // Automatically adjust outline based on methodology selection
    if (selectedMethod && outline) {
      const adjustedOutline = EnhancedDynamicStructureAdapterService.adaptOutlineForSelectedMethodology(
        outline,
        value,
        METHODOLOGY_OPTIONS
      );
      setOutline(adjustedOutline);
    }
  };

  const handleUniversityChange = (value: string) => {
    setSelectedUniversity(value);
    
    // Check university compliance when university changes
    if (outline && methodology) {
      // Use the service to check methodology-specific compliance
      const complianceReport = EnhancedDynamicStructureAdapterService.checkMethodologyUniversityCompliance(
        outline,
        value,
        methodology
      );
      setOutline({
        ...outline,
        universityCompliance: complianceReport
      });
    } else if (outline) {
      // Just check general compliance if no methodology is selected
      const complianceReport = EnhancedDynamicStructureAdapterService.checkUniversityCompliance(
        outline,
        value
      );
      setOutline({
        ...outline,
        universityCompliance: complianceReport
      });
    }
  };

  // Function to automatically adjust outline based on methodology selection
  const adaptOutlineForMethodology = (
    originalOutline: EnhancedOutline, 
    selectedMethodology: ResearchMethodology
  ): EnhancedOutline => {
    // Use the EnhancedDynamicStructureAdapterService for outline adaptation
    return EnhancedDynamicStructureAdapterService.adaptOutlineForMethodology(
      originalOutline,
      selectedMethodology
    );
  };

  // Function to generate methodology alignment message is now in the service
  // The alignment message is generated as part of the outline adaptation process

  // Function to check university format compliance
  const checkUniversityCompliance = (
    outline: EnhancedOutline, 
    university: string
  ): UniversityComplianceReport => {
    // Use the EnhancedDynamicStructureAdapterService for compliance checking
    return EnhancedDynamicStructureAdapterService.checkUniversityCompliance(outline, university);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !field) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setOutline(null);

    try {
      if (!session) {
        throw new Error(
          "Authentication session not found. Please log in again.",
        );
      }

      // Import OpenRouter API service
      const { OpenRouterAPI } = await import("../services/openrouter-api");
      const openRouterAPI = new OpenRouterAPI();
      
      const prompt = `Generate a detailed academic outline for a thesis on "${topic}" in the field of "${field}" using the ${selectedMethodologyType} methodology.
      
      Methodology Details:
      ${methodology ? `
      Description: ${methodology.description}
      Suitable For: ${methodology.suitableFor.join(", ")}
      Data Collection: ${methodology.dataCollection.join(", ")}
      Analysis Approach: ${methodology.analysisApproach}
      Required Sections: ${methodology.requiredSections.join(", ")}
      Optional Sections: ${methodology.optionalSections.join(", ")}
      Research Question Templates: ${methodology.researchQuestionTemplates.join(", ")}
      Data Collection Guidance: ${methodology.dataCollectionGuidance}
      Analysis Guidance: ${methodology.analysisGuidance}
      ` : ""}
      
      Please provide:
      1. A structured 5-chapter outline with detailed sections
      2. Methodology-specific guidance for each chapter
      3. Research questions appropriate to this methodology
      4. Timeline estimates for completion
      5. Potential challenges and mitigation strategies
      
      Format your response as a JSON object with the following structure:
      {
        "content": "Formatted outline content",
        "methodologyAlignment": "Methodology alignment message",
        "researchQuestions": ["Research question 1", "Research question 2"],
        "dataSources": ["Data source 1", "Data source 2"],
        "timelineEstimate": "Timeline estimate",
        "potentialChallenges": ["Challenge 1: Mitigation strategy", "Challenge 2: Mitigation strategy"],
        "methodologySpecificSections": [
          {
            "title": "Section Title",
            "content": "Section content",
            "purpose": "Section purpose"
          }
        ],
        "universityCompliance": {
          "compliant": true,
          "violations": [],
          "suggestions": []
        }
      }`;

      const response = await openRouterAPI.chatCompletion({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`,
        );
      }

      if (data.enhancedOutline) {
        // Use the EnhancedDynamicStructureAdapterService to generate a fully adapted outline
        if (methodology) {
          const enhancedOutline = EnhancedDynamicStructureAdapterService.generateEnhancedOutline(
            data.enhancedOutline,
            methodology,
            selectedUniversity
          );
          
          setOutline(enhancedOutline);
        } else {
          setOutline(data.enhancedOutline);
        }
      } else {
        throw new Error(
          "Failed to generate enhanced outline. The function did not return the expected data.",
        );
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          "An unexpected error occurred while generating the enhanced outline.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outline || !topic) return;
    setIsSaving(true);

    try {
      // Format the enhanced outline for saving
      let content = `<h1>Enhanced Outline for: ${topic}</h1>`;
      
      if (methodology) {
        content += `<h2>Selected Methodology: ${methodology.type.charAt(0).toUpperCase() + methodology.type.slice(1)}</h2>`;
        content += `<p><strong>Description:</strong> ${methodology.description}</p>`;
        content += `<p><strong>Analysis Approach:</strong> ${methodology.analysisApproach}</p>`;
      }
      
      if (selectedUniversity) {
        content += `<h2>Selected University: ${selectedUniversity.toUpperCase()}</h2>`;
      }
      
      content += `<hr>`;
      content += `<h2>Generated Outline</h2>`;
      content += `<div style="white-space: pre-wrap; font-family: monospace;">${outline.content}</div>`;
      
      if (outline.researchQuestions && outline.researchQuestions.length > 0) {
        content += `<hr><h2>Recommended Research Questions</h2><ul>`;
        outline.researchQuestions.forEach(q => {
          content += `<li>${q}</li>`;
        });
        content += `</ul>`;
      }
      
      if (outline.dataSources && outline.dataSources.length > 0) {
        content += `<hr><h2>Suggested Data Sources</h2><ul>`;
        outline.dataSources.forEach(source => {
          content += `<li>${source}</li>`;
        });
        content += `</ul>`;
      }
      
      if (outline.timelineEstimate) {
        content += `<hr><h2>Estimated Timeline</h2><p>${outline.timelineEstimate}</p>`;
      }
      
      if (outline.potentialChallenges && outline.potentialChallenges.length > 0) {
        content += `<hr><h2>Potential Challenges and Mitigation Strategies</h2><ul>`;
        outline.potentialChallenges.forEach(challenge => {
          content += `<li>${challenge}</li>`;
        });
        content += `</ul>`;
      }

      // Add methodology-specific sections if available
      if (outline.methodologySpecificSections && outline.methodologySpecificSections.length > 0) {
        content += `<hr><h2>Methodology-Specific Guidance</h2><ul>`;
        outline.methodologySpecificSections.forEach(section => {
          content += `<li><strong>${section.title}:</strong> ${section.content}</li>`;
        });
        content += `</ul>`;
      }

      // Add university compliance report if available
      if (outline.universityCompliance) {
        content += `<hr><h2>University Format Compliance Report</h2>`;
        content += `<p><strong>Compliant:</strong> ${outline.universityCompliance.compliant ? "Yes" : "No"}</p>`;
        
        if (outline.universityCompliance.violations && outline.universityCompliance.violations.length > 0) {
          content += `<h3>Format Violations:</h3><ul>`;
          outline.universityCompliance.violations.forEach(violation => {
            content += `<li><strong>${violation.section} - ${violation.guideline}:</strong> ${violation.violation}. Suggestion: ${violation.suggestion}</li>`;
          });
          content += `</ul>`;
        }
        
        if (outline.universityCompliance.suggestions && outline.universityCompliance.suggestions.length > 0) {
          content += `<h3>Suggestions:</h3><ul>`;
          outline.universityCompliance.suggestions.forEach(suggestion => {
            content += `<li>${suggestion}</li>`;
          });
          content += `</ul>`;
        }
      }

      const { data: newDoc, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `Enhanced Outline: ${topic}`,
          content: content,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error("Failed to save draft.");
      } else if (newDoc) {
        toast.success("Draft saved successfully!");
        router.push(`/drafts/${newDoc.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enhanced Project Outline Generator
          </CardTitle>
          <CardDescription>
            Enter your topic and select your research methodology to generate a structured outline 
            with methodology-specific guidance, research questions, and timeline estimates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Thesis Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The Impact of AI on Higher Education"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="methodology">Research Methodology</Label>
                <Select 
                  value={selectedMethodologyType} 
                  onValueChange={handleMethodologyChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your research methodology" />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODOLOGY_OPTIONS.map((method) => (
                      <SelectItem key={method.type} value={method.type}>
                        {method.type.charAt(0).toUpperCase() + method.type.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="university">University Format</Label>
                <Select 
                  value={selectedUniversity} 
                  onValueChange={handleUniversityChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pup">Polytechnic University of the Philippines</SelectItem>
                    <SelectItem value="vsu">Visayas State University</SelectItem>
                    <SelectItem value="cmu">Central Mindanao University</SelectItem>
                    <SelectItem value="dlsu">De La Salle University</SelectItem>
                    <SelectItem value="msu">Mindanao State University</SelectItem>
                    <SelectItem value="nemsu">North Eastern Mindanao State University</SelectItem>
                    <SelectItem value="bsu">Benguet State University</SelectItem>
                    <SelectItem value="buksu">Bukidnon State University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {methodology && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FlaskConical className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">
                        {methodology.type.charAt(0).toUpperCase() + methodology.type.slice(1).replace("-", " ")} Methodology
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {methodology.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          Suitable for: {methodology.suitableFor.join(", ")}
                        </Badge>
                        <Badge variant="outline">
                          Analysis: {methodology.analysisApproach}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !topic || !field || !session || !selectedMethodologyType}
              className="w-full md:w-auto"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Generating Enhanced Outline..." : "Generate Methodology-Aligned Outline"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Methodology Guide */}
      {selectedMethodologyType && !outline && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Methodology Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="data-collection">
                <AccordionTrigger>Data Collection Approaches</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {methodology?.dataCollection.map((approach, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span>{approach}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="suitable-topics">
                <AccordionTrigger>Suitable Research Topics</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {methodology?.suitableFor.map((topic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="analysis">
                <AccordionTrigger>Analysis Techniques</AccordionTrigger>
                <AccordionContent>
                  <p>{methodology?.analysisApproach}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This methodology is particularly effective for analyzing data patterns and drawing meaningful conclusions 
                    from your research findings.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Generated Outline */}
      {(isLoading || outline) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Generated Outline
              </CardTitle>
              {outline && !isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsDraft}
                  disabled={isSaving}
                >
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-6 w-1/3 mt-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : outline ? (
              <div className="space-y-6">
                <div className="p-4 border rounded-md bg-tertiary whitespace-pre-wrap font-mono text-sm">
                  {outline.content}
                </div>
                
                {/* Methodology Alignment */}
                {outline.methodologyAlignment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FlaskConical className="w-5 h-5" />
                        Methodology Alignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{outline.methodologyAlignment}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Research Questions */}
                {outline.researchQuestions && outline.researchQuestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5" />
                        Recommended Research Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {outline.researchQuestions.map((question, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Timeline Estimate */}
                {outline.timelineEstimate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5" />
                        Estimated Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{outline.timelineEstimate}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Potential Challenges */}
                {outline.potentialChallenges && outline.potentialChallenges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Potential Challenges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Challenge</TableHead>
                            <TableHead>Mitigation Strategy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {outline.potentialChallenges.map((challenge, index) => (
                            <TableRow key={index}>
                              <TableCell>{challenge}</TableCell>
                              <TableCell>
                                Consider consulting with your advisor and reviewing similar 
                                research methodologies to address this challenge.
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                
                {/* Methodology-Specific Sections */}
                {outline.methodologySpecificSections && outline.methodologySpecificSections.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FlaskConical className="w-5 h-5" />
                        Methodology-Specific Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {outline.methodologySpecificSections.map((section, index) => (
                          <AccordionItem value={`methodology-section-${index}`} key={index}>
                            <AccordionTrigger className="text-left hover:no-underline">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{section.purpose}</Badge>
                                <span className="font-semibold">{section.title}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-2">
                                <p className="whitespace-pre-wrap">{section.content}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* University Compliance Report */}
                {outline.universityCompliance && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ScrollText className="w-5 h-5" />
                        University Format Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-4 rounded-lg ${outline.universityCompliance.compliant 
                        ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700" 
                        : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {outline.universityCompliance.compliant ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                          )}
                          <span className="font-semibold">
                            {outline.universityCompliance.compliant 
                              ? "Compliant with University Format Requirements" 
                              : "Format Compliance Issues Detected"}
                          </span>
                        </div>
                        <p className="text-sm">
                          {outline.universityCompliance.compliant
                            ? "Your outline meets the required format standards."
                            : "Your outline has some format issues that should be addressed:"}
                        </p>
                      </div>
                      
                      {!outline.universityCompliance.compliant && outline.universityCompliance.violations.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-medium">Format Violations:</h4>
                          <ul className="space-y-2">
                            {outline.universityCompliance.violations.map((violation, index) => (
                              <li key={index} className="flex items-start gap-2 p-3 bg-muted/10 rounded">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{violation.violation}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    <span className="font-medium">Section:</span> {violation.section} | 
                                    <span className="font-medium"> Guideline:</span> {violation.guideline}
                                  </p>
                                  <p className="text-sm mt-1">
                                    <span className="font-medium">Suggestion:</span> {violation.suggestion}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* University Compliance Report */}
      {outline?.universityCompliance && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ScrollText className="w-5 h-5" />
                University Format Compliance
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg border-2 ${
              outline.universityCompliance.compliant 
                ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700" 
                : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {outline.universityCompliance.compliant ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                )}
                <span className="font-semibold">
                  {outline.universityCompliance.compliant 
                    ? "Compliant with University Format Requirements" 
                    : "Format Compliance Issues Detected"}
                </span>
              </div>
              <p className="text-sm">
                {outline.universityCompliance.compliant
                  ? "Your outline meets the required format standards."
                  : "Your outline has some format issues that should be addressed:"}
              </p>
            </div>
            
            {!outline.universityCompliance.compliant && outline.universityCompliance.violations.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium">Format Violations:</h4>
                <ul className="space-y-2">
                  {outline.universityCompliance.violations.map((violation, index) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-muted/10 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{violation.violation}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Section:</span> {violation.section} | 
                          <span className="font-medium"> Guideline:</span> {violation.guideline}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Suggestion:</span> {violation.suggestion}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}