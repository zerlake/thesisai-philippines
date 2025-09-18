import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-slate-900 text-white">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, All-Inclusive Pricing
          </h2>
          <p className="mt-4 text-slate-300">
            One plan. All features. No hidden fees.
          </p>
        </div>
        <div className="mx-auto max-w-md p-8 border border-slate-700 rounded-lg shadow-lg bg-slate-800/50">
            <h3 className="text-2xl font-bold">Pro Plan</h3>
            <p className="mt-2 text-slate-400">Everything you need to succeed.</p>
            <p className="mt-6 text-4xl font-extrabold">
                ₱499 <span className="text-xl font-medium text-slate-400">/ month</span>
            </p>
            <Button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all" size="lg" asChild>
                <Link href="/register">Get Started</Link>
            </Button>
            <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>AI-Powered Drafting</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Methodology Suite</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Citation & Bibliography Tools</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Originality Checker</span>
                </li>
                 <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Advisor Collaboration</span>
                </li>
            </ul>
        </div>
      </div>
    </section>
  );
}