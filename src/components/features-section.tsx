import {
  LayoutDashboard,
  FilePenLine,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

const features = [
  {
    icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
    title: "Critic Dashboard & Workflow",
    description:
      "A central task queue with filters, status badges, and bulk actions to manage all your manuscripts efficiently.",
  },
  {
    icon: <FilePenLine className="h-10 w-10 text-primary" />,
    title: "In-App Review & Annotation",
    description:
      "Use a high-fidelity document viewer with inline commenting, highlighting, and version comparison tools.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "Automated Quality Assurance",
    description:
      "Leverage AI for a 'first pass' on grammar and style, plus integrated plagiarism and format validation checks.",
  },
  {
    icon: <BadgeCheck className="h-10 w-10 text-primary" />,
    title: "Structured Feedback & Certification",
    description:
      "Use customizable rubrics, a reusable comment library, and one-click certificate generation with digital signatures.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything You Need for Academic Excellence
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              ThesisAI provides a comprehensive suite of tools designed to
              streamline the manuscript review process from submission to
              certification.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
          {features.map((feature) => (
            <div key={feature.title} className="grid gap-2 text-center p-4 rounded-lg">
              <div className="flex justify-center items-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}