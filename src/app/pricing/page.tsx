import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "₱0",
    description: "Perfect for getting started and exploring core features.",
    features: [
      "3 Documents",
      "Basic AI Assistance",
      "10 Originality Checks per month",
      "Standard Support",
    ],
    buttonText: "Get Started",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₱499",
    description: "Unlock the full power of ThesisAI for serious researchers.",
    features: [
      "Unlimited Documents",
      "Advanced AI Assistance",
      "Unlimited Originality Checks",
      "Priority Support",
    ],
    buttonText: "Go Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Pro + Advisor",
    price: "₱799",
    description: "All Pro features, plus seamless advisor collaboration.",
    features: [
      "All features from Pro",
      "Connect with one online advisor",
      "Share documents for feedback",
      "Track milestones with your advisor",
    ],
    buttonText: "Upgrade Now",
    href: "/register",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-12 md:py-16 bg-slate-900 text-white">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-slate-300">
            Choose the plan that's right for your academic journey.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 items-start max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "p-8 border rounded-lg shadow-lg bg-slate-800/50 flex flex-col h-full transition-transform duration-300",
                plan.highlight ? "border-purple-500 scale-105" : "border-slate-700"
              )}
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-slate-400 min-h-[4rem]">{plan.description}</p>
              <p className="mt-6 text-4xl font-extrabold">
                {plan.price}
                <span className="text-xl font-medium text-slate-400">/month</span>
              </p>
              <ul className="mt-8 space-y-4 text-sm text-slate-300 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "mt-8 w-full transition-all",
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    : "bg-slate-700 hover:bg-slate-600"
                )}
                size="lg"
                asChild
              >
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}