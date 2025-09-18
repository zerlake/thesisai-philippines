import { type UniversityGuide } from "./types";

export const buksuGuide: UniversityGuide = {
  school: "Bukidnon State University (BUKSU)",
  slug: "bukidnon-state-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (The Three Parts)",
        content: {
          type: 'list',
          items: [
            "Part I (Preliminaries): Title Page, Approval Sheet, Acknowledgment, Dedication, Table of Contents, List of Tables, List of Figures, Abstract.",
            "Part II (The Text): Chapters 1-5 (The Problem and Its Scope, RRL, Research Methodology, Presentation/Analysis/Interpretation of Data, Summary/Conclusions/Recommendations).",
            "Part III (Reference Materials): Bibliography/Literature Cited, Appendices, and Curriculum Vitae.",
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
            "Spacing: Double-spaced throughout.",
            "Pagination: Lowercase Roman numerals (i, ii, iii) at the bottom center for preliminaries. Arabic numerals (1, 2, 3) at the upper right corner for the main text.",
          ],
        },
      },
      {
        title: "Formatting Visual Sample",
        content: {
          type: 'visual-sample',
          text: `The study was conducted to determine the effects of climate change on rice production in Bukidnon. The researchers gathered data from various municipalities over a period of five years (dela Cruz, 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos, 2021). This research builds upon the findings of earlier works (Bautista et al., 2019) by incorporating new climate models.`
        }
      },
      {
        title: "Language and Tone (Impersonal)",
        content: {
          type: 'before-after',
          before: "I think the data I gathered shows that the program is effective.",
          after: "The data indicates that the program is effective."
        }
      },
      {
        title: "In-text Citations (APA 7th)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies on public administration have highlighted the need for community-based approaches (dela Cruz, 2020). The collaboration between local government units and non-governmental organizations has been shown to be effective (Reyes & Santos, 2021). Furthermore, a comprehensive review suggested that policy implementation requires continuous monitoring (Bautista et al., 2019)."
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
            "Ensure students follow the specific chapter structures, including all required sub-sections for Chapter 1 and Chapter 3.",
            "Verify the completeness of all preliminary pages, from the Title Page to the Abstract.",
            "Confirm that the Bibliography, Appendices, and CV are correctly placed and formatted.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Check for correct pagination: bottom-center Roman numerals for preliminaries and upper-right Arabic numerals for the main text.",
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
            "Use the Milestone Tracker to set deadlines for each chapter, aligning with the BUKSU format.",
            "Provide feedback on the clarity and completeness of the Theoretical/Conceptual Framework and the Statistical Treatment sections.",
          ],
        },
      },
    ],
  },
};