import { ResearchQuestionIntegration } from "@/components/research-question-integration";

export default function ResearchPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Research Tools</h1>
        <p className="text-xl text-muted-foreground">
          Advanced AI-powered tools to assist with your research process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ResearchQuestionIntegration />
      </div>
    </div>
  );
}