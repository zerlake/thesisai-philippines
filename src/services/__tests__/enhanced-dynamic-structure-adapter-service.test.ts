// Test suite for EnhancedDynamicStructureAdapterService

import { EnhancedDynamicStructureAdapterService } from "../enhanced-dynamic-structure-adapter-service";
import { 
  ResearchMethodology, 
  EnhancedOutline, 
  MethodologySection,
  UniversityComplianceReport
} from "../../components/enhanced-outline-generator";

describe("EnhancedDynamicStructureAdapterService", () => {
  // Sample methodology for testing
  const sampleMethodology: ResearchMethodology = {
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
      }
    ],
    requiredSections: ["Hypothesis Testing", "Variable Identification", "Statistical Tools"],
    optionalSections: ["Reliability Testing", "Validity Assessment"],
    researchQuestionTemplates: [
      "What is the relationship between [variable A] and [variable B]?"
    ],
    dataCollectionGuidance: "Ensure large enough sample size for statistical significance.",
    analysisGuidance: "Apply appropriate parametric or non-parametric tests based on data distribution.",
    commonChallenges: [
      {
        challenge: "Insufficient sample size for desired statistical power",
        mitigation: "Conduct a power analysis before data collection to determine minimum sample size."
      }
    ],
    methodologySpecificSections: [],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  };

  const sampleOutline: EnhancedOutline = {
    content: "Chapter 1: Introduction\nBackground of the Study\nStatement of the Problem\nChapter 2: Review of Related Literature",
    methodologyAlignment: "",
    researchQuestions: [],
    dataSources: [],
    timelineEstimate: "",
    potentialChallenges: [],
    methodologySpecificSections: [],
    universityCompliance: {
      compliant: true,
      violations: [],
      suggestions: []
    }
  };

  describe("generateMethodologySections", () => {
    it("should generate methodology-specific sections", () => {
      const sections = EnhancedDynamicStructureAdapterService.generateMethodologySections(sampleMethodology);
      
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
      
      // Check for expected section titles
      const sectionTitles = sections.map(s => s.title);
      expect(sectionTitles).toContain("Data Collection Guidance");
      expect(sectionTitles).toContain("Analysis Guidance");
      expect(sectionTitles).toContain("Research Question Templates");
      expect(sectionTitles).toContain("Required Sections for This Methodology");
      expect(sectionTitles).toContain("Optional Sections for This Methodology");
    });
  });

  describe("generateMethodologyChallenges", () => {
    it("should generate methodology-specific challenges", () => {
      const challenges = EnhancedDynamicStructureAdapterService.generateMethodologyChallenges(sampleMethodology);
      
      expect(challenges).toBeDefined();
      expect(Array.isArray(challenges)).toBe(true);
      expect(challenges.length).toBeGreaterThan(0);
      expect(challenges[0]).toContain("Insufficient sample size for desired statistical power");
    });
  });

  describe("adaptOutlineForMethodology", () => {
    it("should adapt outline with methodology-specific content", () => {
      const adaptedOutline = EnhancedDynamicStructureAdapterService.adaptOutlineForMethodology(
        sampleOutline,
        sampleMethodology
      );
      
      expect(adaptedOutline).toBeDefined();
      expect(adaptedOutline.methodologySpecificSections).toBeDefined();
      expect(adaptedOutline.potentialChallenges).toBeDefined();
      expect(adaptedOutline.methodologyAlignment).toBeDefined();
      expect(adaptedOutline.methodologyAlignment).toContain("quantitative");
    });
  });

  describe("checkUniversityCompliance", () => {
    it("should check compliance for PUP format", () => {
      const complianceReport = EnhancedDynamicStructureAdapterService.checkUniversityCompliance(
        sampleOutline,
        "pup"
      );
      
      expect(complianceReport).toBeDefined();
      expect(typeof complianceReport.compliant).toBe("boolean");
      expect(Array.isArray(complianceReport.violations)).toBe(true);
      expect(Array.isArray(complianceReport.suggestions)).toBe(true);
    });

    it("should check compliance for VSU format", () => {
      const complianceReport = EnhancedDynamicStructureAdapterService.checkUniversityCompliance(
        sampleOutline,
        "vsu"
      );
      
      expect(complianceReport).toBeDefined();
      expect(typeof complianceReport.compliant).toBe("boolean");
      expect(Array.isArray(complianceReport.violations)).toBe(true);
      expect(Array.isArray(complianceReport.suggestions)).toBe(true);
    });
  });

  describe("generateEnhancedOutline", () => {
    it("should generate a fully enhanced outline", () => {
      const enhancedOutline = EnhancedDynamicStructureAdapterService.generateEnhancedOutline(
        sampleOutline,
        sampleMethodology,
        "pup"
      );
      
      expect(enhancedOutline).toBeDefined();
      expect(enhancedOutline.methodologySpecificSections).toBeDefined();
      expect(enhancedOutline.potentialChallenges).toBeDefined();
      expect(enhancedOutline.methodologyAlignment).toBeDefined();
      expect(enhancedOutline.universityCompliance).toBeDefined();
      expect(enhancedOutline.universityCompliance.compliant).toBeDefined();
    });
  });

  describe("generateMethodologySpecificContent", () => {
    it("should generate methodology-specific content sections", () => {
      const sections = EnhancedDynamicStructureAdapterService.generateMethodologySpecificContent(
        sampleMethodology
      );
      
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
      
      // Check for specific section types
      const sectionTitles = sections.map(s => s.title);
      expect(sectionTitles).toContain("Data Collection Guidance");
      expect(sectionTitles).toContain("Analysis Guidance");
      expect(sectionTitles).toContain("Common Challenges and Mitigation Strategies");
    });
  });

  describe("checkMethodologyUniversityCompliance", () => {
    it("should check compliance with methodology-specific requirements", () => {
      const complianceReport = EnhancedDynamicStructureAdapterService.checkMethodologyUniversityCompliance(
        sampleOutline,
        "pup",
        sampleMethodology
      );
      
      expect(complianceReport).toBeDefined();
      expect(typeof complianceReport.compliant).toBe("boolean");
      expect(Array.isArray(complianceReport.violations)).toBe(true);
      expect(Array.isArray(complianceReport.suggestions)).toBe(true);
    });
  });

  describe("generateDynamicStructureAdaptation", () => {
    it("should generate dynamic structure adaptation", () => {
      const adaptedOutline = EnhancedDynamicStructureAdapterService.generateDynamicStructureAdaptation(
        sampleOutline,
        sampleMethodology,
        "pup"
      );
      
      expect(adaptedOutline).toBeDefined();
      expect(adaptedOutline.methodologySpecificSections).toBeDefined();
      expect(adaptedOutline.universityCompliance).toBeDefined();
      expect(adaptedOutline.methodologyAlignment).toBeDefined();
    });
  });

  describe("adaptOutlineForSelectedMethodology", () => {
    it("should adapt outline for selected methodology", () => {
      const adaptedOutline = EnhancedDynamicStructureAdapterService.adaptOutlineForSelectedMethodology(
        sampleOutline,
        "quantitative",
        [sampleMethodology]
      );
      
      expect(adaptedOutline).toBeDefined();
      expect(adaptedOutline.methodologySpecificSections).toBeDefined();
      expect(adaptedOutline.potentialChallenges).toBeDefined();
      expect(adaptedOutline.methodologyAlignment).toContain("quantitative");
    });
  });
});