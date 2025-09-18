import { type UniversityGuide } from "./types";

export const pnuGuide: UniversityGuide = {
  school: "Philippine Normal University (PNU)",
  slug: "philippine-normal-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (Thesis/Dissertation)",
        content: {
          type: 'list',
          items: [
            "Preliminaries: Title Page, Approval Sheet, Abstract, Acknowledgement, Dedication, Table of Contents, List of Tables, List of Figures.",
            "Chapter 1: The Problem and Its Background",
            "Chapter 2: Review of Related Literature",
            "Chapter 3: Research Methodology",
            "Chapter 4: Presentation, Analysis, and Interpretation of Data",
            "Chapter 5: Summary, Conclusions, and Recommendations",
            "Reference Materials: References, Appendices, and Curriculum Vitae.",
          ],
        },
      },
      {
        title: "Alternative Structure (IMRaD for Journal Articles)",
        content: {
          type: 'list',
          items: [
            "Introduction: Contains the research problem, literature review, and framework.",
            "Method: Details the research design, participants, instruments, and data analysis.",
            "Results: Presents the key findings, often using tables and figures.",
            "Discussion: Interprets the results, discusses implications, and provides a conclusion.",
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
        title: "Language and Tone (Impersonal)",
        content: {
          type: 'before-after',
          before: "I think my results show a clear trend.",
          after: "The results indicate a clear trend."
        }
      },
      {
        title: "In-text Citations (APA 7th Edition)",
        content: {
          type: 'paragraph-example',
          text: "Recent studies in education have emphasized the importance of learner-centered approaches (dela Cruz, 2020). This pedagogical shift has been shown to improve student engagement (Reyes & Santos, 2021). However, a comprehensive review suggests that successful implementation depends on adequate teacher training and resources (Bautista et al., 2019)."
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
            "Confirm if the student is using the 5-chapter or IMRaD format, as appropriate for their output (thesis vs. journal article).",
            "Verify the completeness and correct order of all preliminary pages as per the PNU Style Manual.",
            "Ensure the 'References' section strictly adheres to APA 7th Edition formatting.",
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
            "Use the Milestone Tracker to set deadlines for each major section (e.g., Introduction, Method, Results).",
            "Provide specific feedback on the 'Theoretical/Conceptual Framework' within the Introduction or RRL, as this is a key component of PNU research.",
          ],
        },
      },
    ],
  },
};