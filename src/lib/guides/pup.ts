import { type UniversityGuide } from "./types";

export const pupGuide: UniversityGuide = {
  school: "Polytechnic University of the Philippines (PUP)",
  slug: "polytechnic-university-of-the-philippines",
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
            "Part II (The Text): Chapters 1-5.",
            "Part III (Reference Materials): References, Appendices, and Curriculum Vitae.",
          ],
        },
      },
      {
        title: "Chapter Breakdown",
        content: {
            type: 'list',
            items: [
                "Chapter 1 - The Problem and Its Background: Introduction, Background of the Study, Theoretical/Conceptual Framework, Statement of the Problem, Hypothesis, Scope and Delimitation, Significance of the Study, Definition of Terms.",
                "Chapter 2 - Review of Related Literature and Studies: Foreign Literature, Local Literature, Foreign Studies, Local Studies, Synthesis.",
                "Chapter 3 - Research Methodology: Method of Research, Population and Sample, Research Instrument, Data Gathering Procedure, Statistical Treatment of Data.",
                "Chapter 4 - Presentation, Analysis and Interpretation of Data: Presentation of findings, usually organized by research question.",
                "Chapter 5 - Summary of Findings, Conclusions and Recommendations: Summary of Findings, Conclusions, Recommendations.",
            ]
        }
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
            "Pagination: Lowercase Roman numerals (i, ii, iii) at the bottom center for preliminaries. Arabic numerals (1, 2, 3) at the upper right corner for the main text, starting from the first page of Chapter 1.",
            "Chapter Titles: Centered, all caps, and bold (e.g., **CHAPTER 1**). The title of the chapter follows two spaces below (e.g., The Problem and Its Background).",
          ],
        },
      },
      {
        title: "Chapter-Specific Guidelines",
        content: {
            type: 'list',
            items: [
                "Theoretical/Conceptual Framework (Chapter 1): This section is crucial. It must clearly present the theories or concepts that underpin your study, often accompanied by a diagram (paradigm).",
                "Synthesis (Chapter 2): This is not just a summary. You must critically synthesize the literature, identifying themes, gaps, and how your study fits into the existing body of knowledge.",
                "Statistical Treatment of Data (Chapter 3): You must explicitly state and justify the statistical tools (e.g., t-test, ANOVA, Pearson r) you will use to answer each of your research questions.",
            ]
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
            "Ensure students follow the specific sub-sections for each of the five chapters as outlined in the PUP manual.",
            "Verify the completeness and correct order of all preliminary pages, from the Title Page to the List of Figures.",
            "Confirm that the References, Appendices, and CV are correctly placed and formatted at the end of the manuscript.",
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
            "Ensure chapter titles and main headings are formatted correctly (centered, all caps).",
          ],
        },
      },
      {
        title: "Monitoring and Feedback",
        content: {
          type: 'list',
          items: [
            "Use the Milestone Tracker to set deadlines for each chapter, aligning with the PUP format.",
            "Pay special attention to the Theoretical/Conceptual Framework in Chapter 1 and the Statistical Treatment section in Chapter 3, as these are common areas where students need guidance.",
          ],
        },
      },
    ],
  },
};