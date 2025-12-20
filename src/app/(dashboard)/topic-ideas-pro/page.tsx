import { EnterpriseTopicGenerator } from "@/components/enterprise-topic-generator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise Topic Generator | ThesisAI",
  description:
    "Professional-grade research topic idea generator with feasibility analysis, innovation scoring, and comprehensive planning tools for advanced thesis development.",
};

export default function TopicIdeaProPage() {
  return (
    <div className="min-h-screen py-8">
      <EnterpriseTopicGenerator />
    </div>
  );
}
