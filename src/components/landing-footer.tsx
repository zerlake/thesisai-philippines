import { BotMessageSquare, Mail, Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "For Advisors", href: "/for-advisors" },
      { name: "For Critics", href: "/for-critics" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Help & FAQ", href: "/faq" },
      { name: "University Guides", href: "/university-guides" },
      { name: "Blog", href: "/blog" },
      { name: "Documentation", href: "/documentation" },
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
    ]
  }
];

const socialLinks = [
  { icon: Mail, href: "mailto:support@thesisai.ph", label: "Email" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900">
      <div className="container py-12 md:py-16 lg:py-20">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                <BotMessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">ThesisAI</span>
            </Link>
            <p className="text-sm text-slate-300 mb-4">
              Empowering Filipino researchers with intelligent academic tools.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 pt-8">
          {/* Copyright and legal */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>&copy; 2025 ThesisAI Philippines. All rights reserved.</p>
            <p>Built to empower the next generation of Filipino researchers.</p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 text-center mb-3">
              Enterprise-grade security and privacy protection
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
              <span>🔐 SSL Encrypted</span>
              <span>✓ GDPR Compliant</span>
              <span>✓ Data Privacy</span>
              <span>✓ Academic Integrity</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}