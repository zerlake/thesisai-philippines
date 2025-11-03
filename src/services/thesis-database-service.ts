// This file handles integration with thesis databases for plagiarism detection and historical topic analysis
// It simulates integration with databases like ProQuest Dissertations & Theses Global

import { getShingles, jaccardSimilarity } from "../lib/plagiarism-utils";

// Mock thesis database - in a real implementation, this would connect to ProQuest or similar databases
const MOCK_THESIS_DATABASE = [
  {
    id: "dt_001",
    title: "The Impact of Artificial Intelligence on Student Learning Outcomes in Higher Education",
    author: "Smith, Jennifer A.",
    institution: "University of California",
    year: 2022,
    abstract: "This study examines the effects of artificial intelligence technologies on student learning outcomes in higher education settings. Through a mixed-methods approach, the research investigates both quantitative improvements in test scores and qualitative feedback from students and faculty regarding AI-assisted learning tools.",
    fullText: "This research was conducted to determine the impact of artificial intelligence on student learning outcomes in higher education. The study gathered data from various universities over a period of three years, examining both quantitative metrics and qualitative feedback. Previous studies have shown promising results in AI-assisted learning environments (Johnson et al., 2021). This research builds upon those findings by incorporating new AI technologies and measuring long-term retention rates.",
    keywords: ["artificial intelligence", "learning outcomes", "higher education", "student performance"],
    field: "Education"
  },
  {
    id: "dt_002",
    title: "Machine Learning Approaches to Predicting Climate Change Effects on Agricultural Yield",
    author: "Rodriguez, Carlos M.",
    institution: "Stanford University",
    year: 2021,
    abstract: "This dissertation presents novel machine learning techniques for predicting agricultural yield under various climate change scenarios. Using satellite imagery, weather data, and historical crop production records, the model accurately forecasts yield variations with 87% precision across multiple growing regions.",
    fullText: "The study was conducted to determine the effects of climate change on agricultural yield using machine learning approaches. The researchers gathered data from various regions over a period of five years. Previous studies have shown a significant correlation between rising temperatures and decreased yield (Williams & Brown, 2020). This research builds upon the findings of earlier works by incorporating new predictive models.",
    keywords: ["machine learning", "climate change", "agricultural yield", "predictive modeling"],
    field: "Agricultural Science"
  },
  {
    id: "dt_003",
    title: "Blockchain-Based Secure Voting Systems: A Framework for Democratic Processes",
    author: "Chen, Li Wei",
    institution: "MIT",
    year: 2023,
    abstract: "This research proposes a secure voting framework based on blockchain technology that ensures transparency, immutability, and voter privacy. The system addresses key challenges in electronic voting including double-voting prevention, ballot secrecy, and auditability.",
    fullText: "This study explores blockchain-based secure voting systems to enhance democratic processes. The research focuses on ensuring transparency, immutability, and voter privacy in electoral systems. Previous research has identified vulnerabilities in traditional electronic voting systems (Anderson et al., 2022). This work builds upon those findings by implementing cryptographic techniques to protect voter identity while maintaining verifiability.",
    keywords: ["blockchain", "voting systems", "democratic processes", "cybersecurity"],
    field: "Computer Science"
  },
  {
    id: "dt_004",
    title: "The Role of Social Media in Mental Health Among Adolescents",
    author: "Johnson, Sarah K.",
    institution: "Harvard University",
    year: 2020,
    abstract: "Through a comprehensive longitudinal study, this dissertation investigates the relationship between social media usage patterns and mental health outcomes among adolescents aged 13-18. Findings reveal significant correlations between specific social media behaviors and anxiety levels.",
    fullText: "This research was conducted to investigate the role of social media in mental health among adolescents. The study collected data over a three-year period, examining social media usage patterns and mental health outcomes. Previous studies have indicated a complex relationship between social media engagement and psychological well-being (Davis et al., 2019). This research expands on those findings by categorizing different types of social media interactions and their corresponding mental health impacts.",
    keywords: ["social media", "mental health", "adolescents", "psychological well-being"],
    field: "Psychology"
  },
  {
    id: "dt_005",
    title: "Sustainable Urban Planning Through Green Infrastructure Implementation",
    author: "Okafor, Emmanuel",
    institution: "University of Toronto",
    year: 2022,
    abstract: "This dissertation presents a framework for sustainable urban planning through the strategic implementation of green infrastructure. Case studies from five major cities demonstrate measurable improvements in air quality, stormwater management, and community well-being.",
    fullText: "The study was conducted to determine the effectiveness of green infrastructure in sustainable urban planning. Data was collected from multiple cities over a four-year period, evaluating environmental and social impacts. Earlier research highlighted the benefits of incorporating natural elements in urban design (Thompson & Lee, 2021). This study advances those findings by developing a comprehensive implementation framework.",
    keywords: ["urban planning", "green infrastructure", "sustainability", "environmental design"],
    field: "Urban Planning"
  }
];

// Type definitions
export type ThesisRecord = {
  id: string;
  title: string;
  author: string;
  institution: string;
  year: number;
  abstract: string;
  fullText: string;
  keywords: string[];
  field: string;
};

export type ThesisSimilarityResult = {
  thesis: ThesisRecord;
  similarity: number;
  matchingSections: { source: string; match: string }[];
};

export type HistoricalTopicAnalysis = {
  topicFrequency: { year: number; count: number }[];
  emergingTrends: { topic: string; firstAppearance: number; recentGrowth: number }[];
  saturatedFields: { field: string; recentDecline: number }[];
  gapOpportunities: { field: string; lowActivityPeriod: string }[];
};

/**
 * Search the thesis database for potential plagiarism matches
 * @param text The text to check for similarity
 * @param threshold Minimum similarity threshold (0-1)
 * @returns Array of potential matches sorted by similarity
 */
export async function checkThesisDatabaseForPlagiarism(
  text: string,
  threshold = 0.1
): Promise<ThesisSimilarityResult[]> {
  try {
    const textShingles = getShingles(text);
    const results: ThesisSimilarityResult[] = [];

    // Compare against each thesis in our mock database
    for (const thesis of MOCK_THESIS_DATABASE) {
      // Split thesis full text into sections for more granular comparison
      const sections = splitIntoSections(thesis.fullText);
      
      let maxSimilarity = 0;
      const matchingSections: { source: string; match: string }[] = [];
      
      // Compare each section
      for (const section of sections) {
        const sectionShingles = getShingles(section);
        const similarity = jaccardSimilarity(textShingles, sectionShingles);
        
        if (similarity > threshold) {
          maxSimilarity = Math.max(maxSimilarity, similarity);
          matchingSections.push({
            source: section,
            match: text // In a real implementation, we'd extract the matching portion
          });
        }
      }
      
      // If we found significant similarity, add to results
      if (maxSimilarity > threshold) {
        results.push({
          thesis,
          similarity: maxSimilarity,
          matchingSections
        });
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results;
  } catch (error) {
    console.error("Error checking thesis database for plagiarism:", error);
    throw new Error("Failed to check thesis database for plagiarism");
  }
}

/**
 * Analyze historical topic occurrence in the thesis database
 * @param field Research field to analyze
 * @param keywords Keywords to search for
 * @returns Historical topic analysis results
 */
export async function analyzeHistoricalTopicOccurrence(
  field: string,
  keywords: string[] = []
): Promise<HistoricalTopicAnalysis> {
  try {
    // Filter theses by field
    const fieldTheses = MOCK_THESIS_DATABASE.filter(
      thesis => thesis.field.toLowerCase().includes(field.toLowerCase()) ||
                keywords.some(kw => thesis.keywords.some(tk => tk.includes(kw)))
    );

    // Group by year for frequency analysis
    const yearCounts: Record<number, number> = {};
    fieldTheses.forEach(thesis => {
      yearCounts[thesis.year] = (yearCounts[thesis.year] || 0) + 1;
    });

    // Convert to array format
    const topicFrequency = Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    // Identify emerging trends (topics with increasing frequency in recent years)
    const recentYears = topicFrequency.slice(-3); // Last 3 years
    const earlyYears = topicFrequency.slice(0, -3); // All but last 3 years
    
    const recentTotal = recentYears.reduce((sum, entry) => sum + entry.count, 0);
    const earlyTotal = earlyYears.reduce((sum, entry) => sum + entry.count, 0);
    
    const emergingTrends = [{
      topic: field,
      firstAppearance: earlyYears.length > 0 ? earlyYears[0].year : new Date().getFullYear(),
      recentGrowth: earlyTotal > 0 ? ((recentTotal - earlyTotal) / earlyTotal) * 100 : 0
    }];

    // Identify saturated fields (topics with declining interest)
    const saturatedFields = recentTotal < earlyTotal ? [{ 
      field, 
      recentDecline: ((earlyTotal - recentTotal) / earlyTotal) * 100 
    }] : [];

    // Identify gap opportunities (periods with low activity)
    const gapOpportunities = yearCounts[2020] === 0 ? [{
      field,
      lowActivityPeriod: "2020"
    }] : [];

    return {
      topicFrequency,
      emergingTrends,
      saturatedFields,
      gapOpportunities
    };
  } catch (error) {
    console.error("Error analyzing historical topic occurrence:", error);
    throw new Error("Failed to analyze historical topic occurrence");
  }
}

/**
 * Split text into logical sections for comparison
 * @param text Full text to split
 * @returns Array of text sections
 */
function splitIntoSections(text: string): string[] {
  // Simple section splitting by paragraphs
  return text.split(/\n\s*\n/).filter(section => section.trim().length > 50);
}

/**
 * Get thesis records by year range
 * @param startYear Starting year
 * @param endYear Ending year
 * @returns Thesis records within the specified year range
 */
export async function getThesisByYearRange(startYear: number, endYear: number): Promise<ThesisRecord[]> {
  return MOCK_THESIS_DATABASE.filter(
    thesis => thesis.year >= startYear && thesis.year <= endYear
  );
}

/**
 * Get thesis records by keyword search
 * @param keywords Keywords to search for
 * @returns Thesis records matching the keywords
 */
export async function searchThesisByKeywords(keywords: string[]): Promise<ThesisRecord[]> {
  return MOCK_THESIS_DATABASE.filter(
    thesis => keywords.some(kw => 
      thesis.title.toLowerCase().includes(kw.toLowerCase()) ||
      thesis.abstract.toLowerCase().includes(kw.toLowerCase()) ||
      thesis.keywords.some(tk => tk.toLowerCase().includes(kw.toLowerCase()))
    )
  );
}