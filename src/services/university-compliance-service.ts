// Service for university format compliance checking

import { 
  EnhancedOutline, 
  UniversityComplianceReport, 
  FormatViolation 
} from "../components/enhanced-outline-generator";

// University format requirements
interface UniversityFormat {
  name: string;
  slug: string;
  preliminaries: string[];
  chapterStructure: ChapterRequirement[];
  formatting: FormattingRequirements;
  endMatter: string[];
}

interface ChapterRequirement {
  chapter: number;
  title: string;
  requiredSections: string[];
  optionalSections: string[];
}

interface FormattingRequirements {
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
}

interface PaginationRequirements {
  preliminaries: "center-bottom" | "top-right" | "top-left";
  mainText: "center-bottom" | "top-right" | "top-left";
  romanNumerals: boolean;
  arabicNumerals: boolean;
}

// University format database
const UNIVERSITY_FORMATS: Record<string, UniversityFormat> = {
  "pup": {
    name: "Polytechnic University of the Philippines",
    slug: "pup",
    preliminaries: [
      "Title Page",
      "Approval Sheet",
      "Abstract",
      "Acknowledgement",
      "Dedication",
      "Table of Contents",
      "List of Tables",
      "List of Figures"
    ],
    chapterStructure: [
      {
        chapter: 1,
        title: "THE PROBLEM AND ITS BACKGROUND",
        requiredSections: [
          "Introduction",
          "Background of the Study",
          "Theoretical/Conceptual Framework",
          "Statement of the Problem",
          "Hypothesis",
          "Scope and Delimitation",
          "Significance of the Study",
          "Definition of Terms"
        ],
        optionalSections: []
      },
      {
        chapter: 2,
        title: "REVIEW OF RELATED LITERATURE",
        requiredSections: [
          "Foreign Literature",
          "Local Literature",
          "Foreign Studies",
          "Local Studies",
          "Synthesis"
        ],
        optionalSections: []
      },
      {
        chapter: 3,
        title: "RESEARCH METHODOLOGY",
        requiredSections: [
          "Research Design",
          "Population and Sample",
          "Research Instrument",
          "Data Gathering Procedure",
          "Statistical Treatment of Data"
        ],
        optionalSections: []
      },
      {
        chapter: 4,
        title: "PRESENTATION, ANALYSIS AND INTERPRETATION OF DATA",
        requiredSections: [
          "Presentation of Data",
          "Analysis of Data",
          "Interpretation of Data"
        ],
        optionalSections: []
      },
      {
        chapter: 5,
        title: "SUMMARY, CONCLUSIONS AND RECOMMENDATIONS",
        requiredSections: [
          "Summary",
          "Conclusions",
          "Recommendations"
        ],
        optionalSections: [
          "Implications",
          "Limitations of the Study",
          "Suggestions for Further Research"
        ]
      }
    ],
    formatting: {
      font: "Times New Roman",
      fontSize: 12,
      spacing: "double",
      margins: {
        left: 1.5,
        right: 1,
        top: 1,
        bottom: 1
      },
      pagination: {
        preliminaries: "center-bottom",
        mainText: "top-right",
        romanNumerals: true,
        arabicNumerals: true
      }
    },
    endMatter: [
      "References",
      "Appendices",
      "Curriculum Vitae"
    ]
  },
  "vsu": {
    name: "Visayas State University",
    slug: "vsu",
    preliminaries: [
      "Title Page",
      "Approval Sheet",
      "Biographical Sketch",
      "Acknowledgement",
      "Table of Contents",
      "Lists of Tables/Figures/Appendices",
      "Abstract"
    ],
    chapterStructure: [
      {
        chapter: 1,
        title: "INTRODUCTION",
        requiredSections: [
          "Introduction",
          "Background of the Study",
          "Theoretical/Conceptual Framework",
          "Statement of the Problem",
          "Hypothesis",
          "Scope and Delimitation",
          "Significance of the Study",
          "Definition of Terms"
        ],
        optionalSections: []
      },
      {
        chapter: 2,
        title: "REVIEW OF RELATED LITERATURE AND STUDIES",
        requiredSections: [
          "Foreign Literature",
          "Local Literature",
          "Foreign Studies",
          "Local Studies",
          "Synthesis"
        ],
        optionalSections: []
      },
      {
        chapter: 3,
        title: "METHODOLOGY",
        requiredSections: [
          "Research Design",
          "Population and Sample",
          "Research Instrument",
          "Data Gathering Procedure",
          "Statistical Treatment of Data"
        ],
        optionalSections: []
      },
      {
        chapter: 4,
        title: "RESULTS AND DISCUSSION",
        requiredSections: [
          "Presentation of Findings",
          "Analysis of Data",
          "Discussion of Results"
        ],
        optionalSections: []
      },
      {
        chapter: 5,
        title: "SUMMARY, CONCLUSIONS AND RECOMMENDATIONS",
        requiredSections: [
          "Summary",
          "Conclusions",
          "Recommendations"
        ],
        optionalSections: [
          "Implications",
          "Limitations of the Study",
          "Suggestions for Further Research"
        ]
      }
    ],
    formatting: {
      font: "Times New Roman",
      fontSize: 12,
      spacing: "double",
      margins: {
        left: 1.5,
        right: 1,
        top: 1.5,
        bottom: 1
      },
      pagination: {
        preliminaries: "center-bottom",
        mainText: "top-right",
        romanNumerals: true,
        arabicNumerals: true
      }
    },
    endMatter: [
      "Literature Cited",
      "Appendices"
    ]
  },
  "cmu": {
    name: "Central Mindanao University",
    slug: "cmu",
    preliminaries: [
      "Title Page",
      "Approval Sheet",
      "Acknowledgement",
      "Dedication",
      "Table of Contents",
      "Lists of Tables/Figures/Appendices",
      "Abstract"
    ],
    chapterStructure: [
      {
        chapter: 1,
        title: "THE PROBLEM AND ITS BACKGROUND",
        requiredSections: [
          "Introduction",
          "Background of the Study",
          "Theoretical/Conceptual Framework",
          "Statement of the Problem",
          "Hypothesis",
          "Scope and Delimitation",
          "Significance of the Study",
          "Definition of Terms"
        ],
        optionalSections: []
      },
      {
        chapter: 2,
        title: "REVIEW OF RELATED LITERATURE",
        requiredSections: [
          "Foreign Literature",
          "Local Literature",
          "Foreign Studies",
          "Local Studies",
          "Synthesis"
        ],
        optionalSections: []
      },
      {
        chapter: 3,
        title: "THEORETICAL AND CONCEPTUAL FRAMEWORK",
        requiredSections: [
          "Theoretical Framework",
          "Conceptual Framework",
          "Paradigm/Framework Diagram"
        ],
        optionalSections: []
      },
      {
        chapter: 4,
        title: "METHODOLOGY",
        requiredSections: [
          "Research Design",
          "Population and Sample",
          "Research Instrument",
          "Data Gathering Procedure",
          "Statistical Treatment of Data"
        ],
        optionalSections: []
      },
      {
        chapter: 5,
        title: "RESULTS AND DISCUSSION",
        requiredSections: [
          "Presentation of Findings",
          "Analysis of Data",
          "Discussion of Results"
        ],
        optionalSections: []
      },
      {
        chapter: 6,
        title: "SUMMARY, CONCLUSIONS AND RECOMMENDATIONS",
        requiredSections: [
          "Summary",
          "Conclusions",
          "Recommendations"
        ],
        optionalSections: [
          "Implications",
          "Limitations of the Study",
          "Suggestions for Further Research"
        ]
      }
    ],
    formatting: {
      font: "Times New Roman",
      fontSize: 12,
      spacing: "double",
      margins: {
        left: 1.5,
        right: 1,
        top: 1,
        bottom: 1
      },
      pagination: {
        preliminaries: "center-bottom",
        mainText: "top-right",
        romanNumerals: true,
        arabicNumerals: true
      }
    },
    endMatter: [
      "References",
      "Appendices",
      "Curriculum Vitae"
    ]
  }
};

/**
 * Service for checking university format compliance
 */
export class UniversityComplianceService {
  /**
   * Check compliance of an outline with a specific university's format requirements
   * @param outline The generated outline to check
   * @param university The university to check against
   * @returns Compliance report with violations and suggestions
   */
  static checkCompliance(
    outline: EnhancedOutline, 
    university: string
  ): UniversityComplianceReport {
    // Normalize university name
    const normalizedUniversity = university.toLowerCase().replace(/\s+/g, '-');
    
    // Get university format requirements
    const format = UNIVERSITY_FORMATS[normalizedUniversity] || UNIVERSITY_FORMATS['pup'];
    
    // Check compliance
    const violations: FormatViolation[] = [];
    
    // Check preliminaries
    violations.push(...this.checkPreliminaries(outline, format));
    
    // Check chapter structure
    violations.push(...this.checkChapterStructure(outline, format));
    
    // Check end matter
    violations.push(...this.checkEndMatter(outline, format));
    
    // Check formatting (this would require more detailed analysis in a full implementation)
    violations.push(...this.checkFormatting(outline, format));
    
    // Generate suggestions
    const suggestions = violations.map(violation => 
      `Address the ${violation.guideline} requirement in the ${violation.section} section.`
    );
    
    return {
      compliant: violations.length === 0,
      violations,
      suggestions
    };
  }

  /**
   * Check preliminaries compliance
   * @param outline The generated outline
   * @param format University format requirements
   * @returns Array of format violations
   */
  private static checkPreliminaries(
    outline: EnhancedOutline, 
    format: UniversityFormat
  ): FormatViolation[] {
    const violations: FormatViolation[] = [];
    
    // Check for required preliminaries
    for (const preliminary of format.preliminaries) {
      // Skip checks for content that might not be in the outline
      if (preliminary === "Title Page" || preliminary === "Approval Sheet") {
        continue;
      }
      
      // Check if preliminary section exists in outline content
      if (outline.content && !outline.content.includes(preliminary)) {
        violations.push({
          section: "Preliminaries",
          guideline: preliminary,
          violation: `Missing required '${preliminary}' section`,
          suggestion: `Add a '${preliminary}' section in the preliminaries as required by ${format.name}`
        });
      }
    }
    
    return violations;
  }

  /**
   * Check chapter structure compliance
   * @param outline The generated outline
   * @param format University format requirements
   * @returns Array of format violations
   */
  private static checkChapterStructure(
    outline: EnhancedOutline, 
    format: UniversityFormat
  ): FormatViolation[] {
    const violations: FormatViolation[] = [];
    
    // Check for required chapters and their sections
    for (const chapterReq of format.chapterStructure) {
      const chapterTitle = `Chapter ${chapterReq.chapter}`;
      const fullChapterTitle = `${chapterTitle}: ${chapterReq.title}`;
      
      // Check if chapter exists
      if (outline.content && !outline.content.includes(chapterTitle)) {
        violations.push({
          section: `Chapter ${chapterReq.chapter}`,
          guideline: "Chapter Presence",
          violation: `Missing required '${fullChapterTitle}' chapter`,
          suggestion: `Add Chapter ${chapterReq.chapter} titled '${chapterReq.title}' as required by ${format.name}`
        });
        continue; // Skip section checks if chapter is missing
      }
      
      // Check for required sections within the chapter
      for (const section of chapterReq.requiredSections) {
        if (outline.content && !outline.content.includes(section)) {
          violations.push({
            section: `Chapter ${chapterReq.chapter}`,
            guideline: section,
            violation: `Missing required '${section}' section in Chapter ${chapterReq.chapter}`,
            suggestion: `Add a '${section}' section to Chapter ${chapterReq.chapter} as required by ${format.name}`
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * Check end matter compliance
   * @param outline The generated outline
   * @param format University format requirements
   * @returns Array of format violations
   */
  private static checkEndMatter(
    outline: EnhancedOutline, 
    format: UniversityFormat
  ): FormatViolation[] {
    const violations: FormatViolation[] = [];
    
    // Check for required end matter sections
    for (const endSection of format.endMatter) {
      // Special handling for References vs Literature Cited
      if (endSection === "Literature Cited" && outline.content && 
          outline.content.includes("References")) {
        violations.push({
          section: "End Matter",
          guideline: "Literature Cited",
          violation: `${format.name} requires 'Literature Cited' rather than 'References'`,
          suggestion: `Replace 'References' section with 'Literature Cited' as required by ${format.name}`
        });
        continue;
      }
      
      // Check if end matter section exists
      if (outline.content && !outline.content.includes(endSection)) {
        violations.push({
          section: "End Matter",
          guideline: endSection,
          violation: `Missing required '${endSection}' section`,
          suggestion: `Add a '${endSection}' section at the end of your thesis as required by ${format.name}`
        });
      }
    }
    
    return violations;
  }

  /**
   * Check formatting compliance (simplified for this implementation)
   * @param outline The generated outline
   * @param format University format requirements
   * @returns Array of format violations
   */
  private static checkFormatting(
    outline: EnhancedOutline, 
    format: UniversityFormat
  ): FormatViolation[] {
    const violations: FormatViolation[] = [];
    
    // In a full implementation, this would check actual document formatting
    // For now, we'll just add a placeholder violation to demonstrate the concept
    violations.push({
      section: "Formatting",
      guideline: "Document Formatting",
      violation: "Formatting compliance requires document-level analysis",
      suggestion: "Use the full ThesisAI document editor to ensure your final document meets all formatting requirements"
    });
    
    return violations;
  }

  /**
   * Get list of supported universities
   * @returns Array of supported university names
   */
  static getSupportedUniversities(): { name: string; slug: string }[] {
    return Object.values(UNIVERSITY_FORMATS).map(format => ({
      name: format.name,
      slug: format.slug
    }));
  }

  /**
   * Get format requirements for a specific university
   * @param university University name or slug
   * @returns Format requirements or null if not found
   */
  static getFormatRequirements(university: string): UniversityFormat | null {
    const normalizedUniversity = university.toLowerCase().replace(/\s+/g, '-');
    return UNIVERSITY_FORMATS[normalizedUniversity] || null;
  }
}