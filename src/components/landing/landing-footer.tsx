import { Mail, Github, Linkedin, Twitter, Shield, Lock, Zap, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const footerSections = [
  {
    title: "Enterprise",
    links: [
      { name: "Features", href: "/features" },
      { name: "For Universities", href: "/for-advisors" },
      { name: "For Researchers", href: "/for-critics" },
      { name: "Academic Partnership", href: "/contact" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Research Hub", href: "/explore" },
      { name: "University Guides", href: "/university-guides" },
      { name: "Academic Blog", href: "/blog" },
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
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/faq" },
      { name: "User Guide", href: "/user-guide" },
      { name: "24/7 Support", href: "/contact" },
      { name: "Community", href: "/contact" },
    ]
  }
];

const socialLinks = [
  { icon: Mail, href: "mailto:support@thesisai.ph", label: "Email" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

const trustBadges = [
  { icon: Shield, label: "Enterprise Security" },
  { icon: Lock, label: "Data Protection" },
  { icon: Award, label: "Academic Excellence" },
  { icon: Zap, label: "99.9% Uptime" }
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/THESIS-AI-LOGO2.png" alt="ThesisAI Logo" width={40} height={40} />
              <span className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">ThesisAI</span>
                <span className="text-white"> Philippines</span>
              </span>
            </div>
            <p className="text-text-secondary mb-6 max-w-md">
              The enterprise-grade platform empowering Filipino researchers with AI-powered academic tools.
            </p>
            <p className="text-sm text-text-tertiary mb-6">
              Trusted by 50+ universities across the Philippines for academic excellence.
            </p>

            <div className="flex gap-4 mb-8">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-text-secondary hover:text-white transition-colors p-3 rounded-xl bg-slate-800/30 hover:bg-gradient-to-r from-accent-electric-purple/20 to-accent-cyan/20 border border-brand-dark-bg/30 hover:border-accent-electric-purple/50"
                  aria-label={social.label}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: (index * 4 + linkIndex) * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-white hover:text-accent-cyan transition-colors block py-1"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Trust badges section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Trust & Security
            </h4>
            <div className="space-y-4">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-text-tertiary p-2 rounded-lg bg-slate-800/30 border border-slate-700/30"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="p-1 rounded-md bg-gradient-to-br from-accent-electric-purple/20 to-accent-cyan/20">
                    <badge.icon className="h-4 w-4 text-accent-cyan" />
                  </div>
                  <span>{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 pt-8">
          {/* Copyright and legal */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
            <p>&copy; 2025 ThesisAI Philippines. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Enterprise-grade platform</span>
              <span>Trusted by 50+ universities</span>
            </div>
          </div>

          {/* Additional legal and compliance */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-text-tertiary text-center">
              Built with academic integrity and compliance in mind for Philippine universities.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}