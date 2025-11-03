import { quickAccessItems } from "./quick-access-items";
import { type LucideIcon } from "lucide-react"; // Assuming LucideIcon is needed for quickAccessItems

type Document = {
  id: string;
  title: string | null;
  updated_at: string;
};

type Action = {
  type: "feedback" | "milestone" | "task";
  title: string;
  detail: string;
  urgency: "critical" | "high" | "normal";
  href: string;
  icon: LucideIcon;
};

export function getProactiveSuggestion(
  nextAction: Action | null,
  latestDocument: Document | null,
) {
  if (nextAction?.type === "feedback") {
    return {
      title: "Address Advisor Feedback",
      description: `Your advisor has provided feedback on "${
        nextAction.title || "your document"
      }". Consider using the "Document Analyzer" to review specific sections.`,
      toolSuggestion: quickAccessItems.find(
        (item) => item.title === "PDF & Document Analysis",
      ),
    };
  }

  if (nextAction?.type === "milestone") {
    if (nextAction.title.includes("Proposal")) {
      return {
        title: "Work on your Proposal",
        description: `Your next milestone is related to your proposal. The "Outline Generator" and "Topic Idea Generator" can help.`,
        toolSuggestion: quickAccessItems.find(
          (item) => item.title === "Outline Generator",
        ),
      };
    }
    if (nextAction.title.includes("Chapter I")) {
      return {
        title: "Start Chapter I",
        description: `Focus on your first chapter. The "Outline Generator" and "Research Helper" can be useful.`,
        toolSuggestion: quickAccessItems.find(
          (item) => item.title === "Research Helper",
        ),
      };
    }
    // Add more milestone-based suggestions
  }

  if (latestDocument?.title) {
    if (latestDocument.title.toLowerCase().includes("introduction")) {
      return {
        title: "Refine your Introduction",
        description: `You're working on your introduction. The "Outline Generator" can help structure your arguments.`,
        toolSuggestion: quickAccessItems.find(
          (item) => item.title === "Outline Generator",
        ),
      };
    }
    if (latestDocument.title.toLowerCase().includes("research")) {
      return {
        title: "Deepen your Research",
        description: `Your latest document is research-focused. The "Research Helper" can assist in finding more papers.`,
        toolSuggestion: quickAccessItems.find(
          (item) => item.title === "Research Helper",
        ),
      };
    }
    // Add more document title-based suggestions
  }

  // Default suggestion if no specific context matches
  return {
    title: "Explore Your Tools",
    description:
      "No specific suggestions right now. Explore the Quick Access Tools to find what you need!",
    toolSuggestion: null,
  };
}
