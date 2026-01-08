
export type Plan = "free" | "pro" | "pro_advisor" | "pro_complete";

export interface Capabilities {
  chapterAgents: boolean;
  basicRevision: boolean;
  advisorCommentTracking: boolean;
  advisorAlignedRevision: boolean;
  thesisFinalizerPro: boolean;
  advancedConsistencyChecks: boolean;
}

export function capabilitiesFor(plan: Plan | string): Capabilities {
  // Normalize plan string to Plan type, defaulting to 'free' if unrecognized
  const normalizedPlan = (
    ["free", "pro", "pro_advisor", "pro_complete"].includes(plan)
      ? plan
      : "free"
  ) as Plan;

  switch (normalizedPlan) {
    case "free":
      return {
        chapterAgents: false,
        basicRevision: true,
        advisorCommentTracking: false,
        advisorAlignedRevision: false,
        thesisFinalizerPro: false,
        advancedConsistencyChecks: false
      };
    case "pro":
      return {
        chapterAgents: true,          // full chapter agents & tools
        basicRevision: true,
        advisorCommentTracking: false,
        advisorAlignedRevision: false,
        thesisFinalizerPro: false,
        advancedConsistencyChecks: false
      };
    case "pro_advisor":
      return {
        chapterAgents: true,
        basicRevision: true,
        advisorCommentTracking: true,
        advisorAlignedRevision: true,
        thesisFinalizerPro: true,
        advancedConsistencyChecks: false
      };
    case "pro_complete":
      return {
        chapterAgents: true,
        basicRevision: true,
        advisorCommentTracking: true,
        advisorAlignedRevision: true,
        thesisFinalizerPro: true,
        advancedConsistencyChecks: true
      };
    default:
      // Fallback to free capabilities for unknown plans
      return {
        chapterAgents: false,
        basicRevision: true,
        advisorCommentTracking: false,
        advisorAlignedRevision: false,
        thesisFinalizerPro: false,
        advancedConsistencyChecks: false
      };
  }
}
