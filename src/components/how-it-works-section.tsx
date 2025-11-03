import { FilePlus2, PencilRuler, Send, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <FilePlus2 className="h-10 w-10" />,
    title: "1. Provide Your Topic",
    description: "Start by entering your thesis topic or research question to generate ideas and a structured outline.",
  },
  {
    icon: <Sparkles className="h-10 w-10" />,
    title: "2. Draft with AI",
    description: "Use our AI assistant to generate first drafts, find sources, and refine your arguments chapter by chapter.",
  },
  {
    icon: <PencilRuler className="h-10 w-10" />,
    title: "3. Cite & Check",
    description: "Manage your citations effortlessly and run originality checks to ensure academic integrity.",
  },
  {
    icon: <Send className="h-10 w-10" />,
    title: "4. Export & Submit",
    description: "Download your completed work in DOCX or PDF, ready for submission to your adviser.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Get Started in Minutes</h2>
          <p className="mt-4 text-muted-foreground">
            Follow our simple, guided process to streamline your writing journey.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-card text-blue-400">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}