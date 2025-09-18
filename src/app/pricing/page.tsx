import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose the plan that's right for you.
          </p>
        </div>
        <div className="mx-auto max-w-md p-8 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold">Pro Plan</h3>
            <p className="mt-2 text-muted-foreground">All features included.</p>
            <p className="mt-6 text-4xl font-extrabold">
                ₱499 <span className="text-xl font-medium text-muted-foreground">/ month</span>
            </p>
            <Button className="mt-6 w-full" asChild>
                <Link href="/register">Get Started</Link>
            </Button>
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>AI-Powered Drafting</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Methodology Suite</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Citation & Bibliography Tools</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Originality Checker</span>
                </li>
            </ul>
        </div>
      </div>
    </section>
  );
}