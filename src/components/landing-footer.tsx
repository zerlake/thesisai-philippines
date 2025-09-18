import { BotMessageSquare } from "lucide-react";
import Link from "next/link";

const footerNav = [
  { name: "Features", href: "/features" },
  { name: "For Advisors", href: "/for-advisors" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQ", href: "/faq" },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6" />
            <p className="font-semibold">ThesisAI</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            {footerNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ThesisAI. All rights reserved.</p>
          <p className="mt-1">Built to empower the next generation of Filipino researchers.</p>
        </div>
      </div>
    </footer>
  );
}