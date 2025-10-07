import { Construction } from "lucide-react";

export default function ExplorePage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <Construction className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Coming Soon
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            The Explore page is currently under construction. Soon, you&apos;ll be able to discover and read work shared by the ThesisAI community right here.
          </p>
        </div>
      </div>
    </section>
  );
}