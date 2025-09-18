import { type UniversityGuide } from "./types";

export const bsuGuide: UniversityGuide = {
  school: "Benguet State University (BSU)",
  slug: "benguet-state-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (The Three Parts)",
        content: {
          type: 'list',
          items: [
            "Part I (Preliminaries): Includes Title Page, Approval Sheet, Abstract, Acknowledgement, Table of Contents, Lists of Tables/Figures.",
            "Part II (The Text): Consists of Chapters 1-5 (Introduction, RRL, Methodology, Results & Discussion, Summary/Conclusion/Recommendations).",
            "Part III (Reference Materials): Contains the Bibliography, Appendices, and Curriculum Vitae.",
          ],
        },
      },
      {
        title: "Formatting and Style",
        content: {
          type: 'list',
          items: [
            "Paper: Letter size (8.5\" x 11\").",
            "Margins: 1.5 inches on the left, 1 inch on all other sides.",
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
          text: `The study was conducted to determine the effects of climate change on rice production in Benguet. The researchers gathered data from various municipalities over a period of five years (dela Cruz, 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos, 2021). This research builds upon the findings of earlier works (Bautista et al., 2019) by incorporating new climate models.`
        }
      },
      {
        title: "Language and Tone (Impersonal)",
        content: {
          type: 'before-after',
          before: "I believe that the results clearly show that the intervention was successful.",
          after: "The results indicate that the intervention was successful."
        }
      },
      {
        title: "In-text Citations (APA 7th)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies on agricultural technology have shown significant advancements (dela Cruz, 2020). The collaboration between two leading universities resulted in a new hybrid crop (Reyes & Santos, 2021). Furthermore, a comprehensive review suggested that more long-term data is needed to confirm these findings (Bautista et al., 2019)."
        }
      },
      {
        title: "Submission Workflow",
        content: {
          type: 'list',
          items: [
            "Step 1: Proposal defense and approval by the Guidance and Advisory Committee (GAC).",
            "Step 2: Conduct research and write the manuscript.",
            "Step 3: Final defense and incorporation of revisions.",
            "Step 4: Submission of final copies to the Graduate School/Open University.",
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
            "Guide students through the three-part manuscript structure.",
            "Utilize the platform to review drafts and provide feedback before the proposal and final defenses.",
            "Ensure all GAC members have reviewed and approved the manuscript before final submission.",
          ],
        },
      },
      {
        title: "Format and Compliance Audit",
        content: {
          type: 'list',
          items: [
            "Verify that student submissions adhere to BSU's specific margin, font, and pagination requirements (upper right for main text).",
            "Check for completeness of all preliminary and reference material sections.",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines aligned with BSU's academic calendar.",
            "Provide clear, actionable feedback on each chapter, ensuring the student addresses all panelist recommendations after defense.",
          ],
        },
      },
    ],
  },
};