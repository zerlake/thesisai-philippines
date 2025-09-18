import { type UniversityGuide } from "./types";

export const cmuGuide: UniversityGuide = {
  school: "Central Mindanao University (CMU)",
  slug: "central-mindanao-university",
  studentDashboard: {
    icon: "BookCopy",
    title: "For Students",
    items: [
      {
        title: "Manuscript Structure (6-Chapter Format)",
        content: {
          type: 'list',
          items: [
            "Preliminaries: Title Page, Approval Sheet, Acknowledgement, Dedication, Table of Contents, Lists of Tables/Figures/Appendices, Abstract.",
            "Chapter 1: The Problem",
            "Chapter 2: Review of Related Literature",
            "Chapter 3: Theoretical and Conceptual Framework",
            "Chapter 4: Research Methodology",
            "Chapter 5: Presentation, Analysis, and Interpretation of Data",
            "Chapter 6: Summary, Conclusion, and Recommendations",
            "Reference Materials: Bibliography/Literature Cited, Appendices, Curriculum Vitae.",
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
        title: "Proposal Submission Workflow (via Research Office)",
        content: {
          type: 'list',
          items: [
            "Submit the complete, signed proposal approval form with a copy of your proposal.",
            "The Research Office will issue and stamp your official Research Number.",
            "Fill out the thesis/dissertation monitoring logbook.",
            "The Research Director will sign the proposal.",
            "The Research Office will duplicate the signed approval form for their file.",
            "Fill out the proposal logout logbook upon retrieval.",
            "Present the distribution form (if required) to receive your signed proposal.",
          ],
        },
      },
      {
        title: "Final Manuscript Submission Workflow",
        content: {
          type: 'list',
          items: [
            "Submit the complete, signed manuscript approval form with a copy of your manuscript.",
            "Ensure the correct Research Number is on the approval form.",
            "Submit required documents: Electronic copy (CD/DVD) and a photocopy of the approval sheet and abstract.",
            "The Research Director will sign the final hardbound manuscript.",
            "Fill out the manuscript logout logbook.",
            "Present the distribution form to receive your signed hardbound manuscript.",
          ],
        },
      },
      {
        title: "Electronic Copy (CD/DVD) Specifications",
        content: {
          type: 'list',
          items: [
            "The manuscript must be in PDF format.",
            "The CD/DVD label must contain: Title, Research Number, Your Name & Degree, and Month & Year of Graduation.",
            "The filename must be: LASTNAME,FI_MI.pdf (e.g., TUMAMPOS,JAB.pdf).",
            "Submit the CD/DVD in a transparent case with the abstract and signed approval sheet.",
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
            "Ensure students follow the specific 6-chapter format, paying close attention to the separation of the Theoretical/Conceptual Framework into its own chapter (Chapter 3).",
            "Verify all required preliminary pages are present and correctly ordered.",
            "Confirm that the Bibliography, Appendices, and CV are properly formatted and included.",
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
            "Ensure consistent use of Times New Roman 12 pt font and double-spacing.",
          ],
        },
      },
      {
        title: "Submission and Compliance",
        content: {
          type: 'list',
          items: [
            "Guide students through the official proposal and manuscript submission process via the University Research Office.",
            "Verify that the student's electronic copy (CD/DVD) meets all specifications, including PDF format, correct labeling, and proper filename.",
            "Ensure all required documents (approval sheets, abstract) are submitted alongside the manuscript.",
          ],
        },
      },
    ],
  },
};