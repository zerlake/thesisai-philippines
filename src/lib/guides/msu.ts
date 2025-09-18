import { type UniversityGuide } from "./types";

export const msuGuide: UniversityGuide = {
  school: "Mindanao State University (MSU) System",
  slug: "mindanao-state-university-system",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (The Three Parts)",
        content: {
          type: 'list',
          items: [
            "Part I (Preliminaries): Title Page, Approval Sheet, Biographical Sketch, Acknowledgement, Dedication, Table of Contents, Lists of Tables/Figures, Abstract.",
            "Part II (The Text): Chapters 1-5 (Introduction, Review of Related Literature, Methodology, Results and Discussion, Summary/Conclusion/Recommendations).",
            "Part III (Reference Materials): Literature Cited, Appendices, Curriculum Vitae.",
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
            "Pagination: Lowercase Roman numerals (bottom center) for preliminaries. Arabic numerals (upper right) for the main text.",
          ],
        },
      },
      {
        title: "Formatting Visual Sample",
        content: {
          type: 'visual-sample',
          text: `The study was conducted to determine the effects of climate change on rice production in Lanao del Sur. The researchers gathered data from various municipalities over a period of five years (dela Cruz, 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos, 2021). This research builds upon the findings of earlier works (Bautista et al., 2019) by incorporating new climate models.`
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
        title: "In-text Citations (APA 7th)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies on peace education have emphasized its importance in conflict-affected areas (dela Cruz, 2020). Community-based programs have been shown to be particularly effective (Reyes & Santos, 2021). However, a comprehensive review suggests that long-term impact assessment is still needed (Bautista et al., 2019)."
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
            "Guide students through the standard three-part, five-chapter manuscript structure.",
            "Verify all required preliminary pages, including the Biographical Sketch, are present and correctly ordered.",
            "Ensure the final document includes all necessary reference materials before final submission.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Confirm the correct two-part pagination style: bottom-center Roman for preliminaries and upper-right Arabic for the main text.",
            "Verify the 1.5-inch left margin and 1-inch margins on all other sides.",
            "Ensure consistent use of Times New Roman 12 pt font and double-spacing throughout the manuscript.",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines for key stages like the proposal colloquium and final oral examination.",
            "Provide feedback on the substance of each chapter, ensuring a logical flow from introduction to recommendations.",
          ],
        },
      },
    ],
  },
};