import { type UniversityGuide } from "./types";

export const nemsuGuide: UniversityGuide = {
  school: "North Eastern Mindanao State University (NEMSU)",
  slug: "north-eastern-mindanao-state-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (The Three Parts)",
        content: {
          type: 'list',
          items: [
            "Part I (Preliminaries): Title Page, Approval Sheet, Abstract, Acknowledgement, Dedication, Table of Contents, List of Tables, List of Figures.",
            "Part II (The Text): Chapters 1-5 (The Problem and Its Setting, RRL, Research Methodology, Presentation/Analysis/Interpretation, Summary/Conclusions/Recommendations).",
            "Part III (Reference Materials): Literature Cited, Appendices, and Curriculum Vitae.",
          ],
        },
      },
      {
        title: "Formatting and Style",
        content: {
          type: 'list',
          items: [
            "Paper: Letter size (8.5\" x 11\").",
            "Margins: 1.5 inches on the left; 1 inch on top, right, and bottom.",
            "Font: Times New Roman, 12 pt.",
            "Spacing: Double-spaced throughout the manuscript.",
            "Pagination: Lowercase Roman numerals (i, ii, iii) at the bottom center for preliminaries. Arabic numerals (1, 2, 3) at the upper right corner for the main text.",
          ],
        },
      },
      {
        title: "Formatting Visual Sample",
        content: {
          type: 'visual-sample',
          text: `The study was conducted to determine the effects of climate change on rice production in Surigao del Sur. The researchers gathered data from various municipalities over a period of five years (dela Cruz, 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos, 2021). This research builds upon the findings of earlier works (Bautista et al., 2019) by incorporating new climate models.`
        }
      },
      {
        title: "Language and Tone (Impersonal)",
        content: {
          type: 'before-after',
          before: "I think my results show a clear trend.",
          after: "The results indicate a clear trend."
        }
      },
      {
        title: "In-text Citations (APA Style)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies on local governance have emphasized community participation (dela Cruz, 2020). This approach has been shown to improve project outcomes and sustainability (Reyes & Santos, 2021). However, a comprehensive review suggests that effective implementation requires strong institutional support (Bautista et al., 2019)."
        }
      },
    ],
  },
  advisorDashboard: {
    icon: "UserCheck",
    title: "For Advisors",
    items: [
      {
        title: "Review and Approval Workflow",
        content: {
          type: 'list',
          items: [
            "Ensure students follow the specific chapter structures, including all required sub-sections for Chapter 1 (The Problem and Its Setting).",
            "Verify the completeness of all preliminary pages as per the NEMSU Graduate School format.",
            "Confirm that the 'Literature Cited', Appendices, and CV are correctly placed and formatted.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Check for correct pagination: bottom-center Roman for preliminaries and upper-right Arabic for the main text.",
            "Verify the 1.5-inch left margin and 1-inch margins on all other sides.",
            "Ensure consistent use of Times New Roman 12 pt font and double-spacing.",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines for each chapter, aligning with the NEMSU format.",
            "Provide feedback on the clarity of the Statement of the Problem and the appropriateness of the Statistical Tools in the Methodology chapter.",
          ],
        },
      },
    ],
  },
};