import { type UniversityGuide } from "./types";

export const vsuGuide: UniversityGuide = {
  school: "Visayas State University (VSU)",
  slug: "visayas-state-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure",
        content: {
          type: 'list',
          items: [
            "Preliminaries: Title Page, Approval Sheet, Biographical Sketch, Acknowledgement, Table of Contents, Lists of Tables/Figures/Appendices, Abstract.",
            "Main Body: Chapters 1-5 (Introduction, Review of Literature, Methodology, Results and Discussion, Summary/Conclusion/Implications & Recommendations).",
            "End Matter: Literature Cited, Appendices.",
          ],
        },
      },
      {
        title: "Formatting and Style (Key Differences)",
        content: {
          type: 'list',
          items: [
            "Paper: A4 size (8.27\" x 11.69\").",
            "Margins: 1.5 inches on the left and top; 1.0 inch on the right and bottom.",
            "Font: Times New Roman, 12 pt.",
            "Spacing: Double-spaced throughout.",
            "Pagination: Lowercase Roman numerals (bottom center) for preliminaries; Arabic numerals (upper right) for the main body.",
          ],
        },
      },
      {
        title: "Formatting Visual Sample",
        content: {
          type: 'visual-sample',
          text: `The study was conducted to determine the effects of climate change on rice production in Leyte. The researchers gathered data from various municipalities over a period of five years (de la Cruz 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos 2021). This research builds upon the findings of earlier works (Bautista et al. 2019) by incorporating new climate models.`
        }
      },
      {
        title: "Language and Tone (Impersonal)",
        content: {
          type: 'before-after',
          before: "I think that my results show a clear trend. We can see that the treatment was effective.",
          after: "The results indicate a clear trend, suggesting the treatment was effective."
        }
      },
      {
        title: "In-text Citations (ATR Style)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies on agricultural technology have shown significant advancements (de la Cruz 2020). The collaboration between two leading universities resulted in a new hybrid crop (Reyes & Santos 2021). However, a comprehensive review involving multiple research teams suggested that more long-term data is needed to confirm these findings (Bautista et al. 2019)."
        }
      },
      {
        title: "Publication Requirement",
        content: {
          type: 'list',
          items: [
            "A key graduation requirement is to have at least one manuscript from your research published or accepted for publication in a refereed journal (e.g., Scopus, Web of Science, or CHED-recognized).",
            "Plan your research and writing with a publishable article in mind from the start.",
          ],
        },
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
            "Guide students in preparing a manuscript suitable for journal submission alongside their thesis.",
            "Ensure the 'Literature Cited' section strictly follows the Annals of Tropical Research (ATR) format.",
            "Verify all required preliminary pages, including the Biographical Sketch, are present.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Confirm the use of A4 paper size and the unique 1.5-inch top and left margins.",
            "Check for correct pagination and consistent double-spacing.",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines for both thesis chapters and the separate journal article manuscript.",
            "Provide feedback that helps students meet the rigorous standards of peer-reviewed journals.",
          ],
        },
      },
    ],
  },
};