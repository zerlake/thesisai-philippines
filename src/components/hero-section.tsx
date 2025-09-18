import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              The Definitive Platform for Academic Manuscript Review
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Empowering critics, advisors, and students with powerful,
              AI-enhanced tools for faster, higher-quality feedback.
            </p>
          </div>
          <div className="space-x-4 pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}