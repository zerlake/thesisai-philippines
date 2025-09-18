import { type UniversityGuide } from "./types";

export const dlsuGuide: UniversityGuide = {
  school: "De La Salle University (DLSU)",
  slug: "de-la-salle-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure",
        content: {
          type: 'list',
          items: [
            "Preliminaries: Title Page, Approval Sheet, Abstract, Acknowledgement, Table of Contents, Lists of Tables/Figures/Appendices/Notations.",
            "Main Body: Chapters 1-5 (Introduction, Review of Related Literature, Methodology, Results and Discussion, Summary/Conclusion/Recommendations).",
            "End Matter: References, Appendices, Curriculum Vitae.",
          ],
        },
      },
      {
        title: "Formatting and Style",
        content: {
          type: 'list',
          items: [
            "Paper: Letter size (8.5\" x 11\").",
            "Margins: 1.5 inches on the left; 1.0 inch on top, right, and bottom.",
            "Font: Times New Roman 12 pt for text; Arial for tables and figures.",
            "Spacing: Double-spaced for text. Single-spaced for captions, long quotes, and reference entries (with double space between entries).",
            "Pagination: Lowercase Roman numerals (bottom center) for preliminaries; Arabic numerals (upper right) for the main body.",
          ],
        },
      },
      {
        title: "Formatting Visual Sample",
        content: {
          type: 'visual-sample',
          text: `The study was conducted to determine the effects of climate change on rice production in Laguna. The researchers gathered data from various municipalities over a period of five years (dela Cruz, 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos, 2021). This research builds upon the findings of earlier works (Bautista et al., 2019) by incorporating new climate models.`
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
          text: "Recent studies in engineering education have emphasized project-based learning (dela Cruz, 2020). This approach has been shown to increase student engagement and practical skills (Reyes & Santos, 2021). However, a meta-analysis suggests that its effectiveness is dependent on proper scaffolding and resources (Bautista et al., 2019)."
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
            "Ensure students adhere to the specific chapter structures for the Gokongwei College of Engineering.",
            "Verify all required preliminary pages are present and correctly ordered.",
            "Confirm that the References, Appendices, and CV are properly formatted and included.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Check for correct pagination: bottom-center Roman for preliminaries, upper-right Arabic for the main body.",
            "Verify the 1.5-inch left margin and 1.0-inch margins on other sides.",
            "Ensure correct font usage: Times New Roman for text and Arial for tables/figures.",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines for each chapter submission.",
            "Provide feedback on the technical accuracy of the Methodology and the clarity of the Results and Discussion sections.",
          ],
        },
      },
    ],
  },
};