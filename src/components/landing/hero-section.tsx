import Link from "next/link";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section
      className="relative bg-slate-900 bg-cover bg-center py-24 md:py-32 lg:py-40"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1548213235-4c48c0862296?q=80&w=1887&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container flex max-w-5xl flex-col items-center text-center">
        <div className="flex flex-col items-center bg-black/50 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Your AI-Powered Academic Co-Pilot
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-neutral-200 sm:text-xl">
            From <span className="font-medium text-white">balangkas</span> to bibliography, conquer your thesis, dissertation, or capstone project with confidence. ThesisAI helps you outline, draft, cite, and refine your work, so you can focus on what truly matters: your research.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Start Writing Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}