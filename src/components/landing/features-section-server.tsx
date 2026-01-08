import Link from "next/link";
import { 
  Target,
  Lightbulb,
  BookOpen,
  Network,
  FileText,
  FlaskConical,
  Bot,
  BookCopy,
  FileCheck,
  Share2,
  Users,
  Presentation,
  University,
  ArrowRight,
  BadgeCheck,
  Star,
  Zap,
  Award,
  Shield,
  Heart,
} from "lucide-react";

// Server component for features section with critical content rendered server-side
export function FeaturesSectionServer() {
  // Static features data that will be rendered server-side
  const featuresData = {
    title: "Enterprise-Grade Academic Tools",
    description: "Comprehensive AI-powered tools for every stage of your academic journey.",
    phases: [
      {
        id: "conceptualize",
        label: "01. Conceptualize",
        color: "from-blue-500 to-blue-600",
        features: [
          {
            id: "conceptualize-1",
            icon: "Target",
            title: "Research Conceptualization Tools",
            description: "Variable Mapping Tool and Research Problem Identifier with Philippine-specific data",
            badge: "Pro",
            link: "/documentation/research-conceptualization",
          },
          {
            id: "conceptualize-2",
            icon: "Lightbulb",
            title: "AI Idea Generation",
            description: "Generate research questions, topic ideas, and chapter outlines tailored to your field",
            badge: "AI",
            link: "/documentation/ai-idea-generation",
          },
          {
            id: "conceptualize-3",
            icon: "Lightbulb",
            title: "Research Workflow Management",
            description: "Track tasks, deadlines, and progress with comprehensive workflow tools",
            badge: "Pro",
            link: "/documentation/workflow-management",
          },
        ],
      },
      {
        id: "research",
        label: "02. Research",
        color: "from-purple-500 to-purple-600",
        features: [
          {
            id: "research-1",
            icon: "BookOpen",
            title: "Research Article Analyzer",
            description: "Extract methodology, findings, conclusions with annotation tools and literature matrices",
            badge: "Professional",
            link: "/documentation/article-analyzer",
          },
          {
            id: "research-2",
            icon: "Network",
            title: "Collaborative Literature Review",
            description: "Annotate, tag, and analyze literature together with real-time collaboration",
            badge: "Team",
            link: "/documentation/collaborative-literature-review",
          },
          {
            id: "research-3",
            icon: "FileText",
            title: "Privacy-Preserving PDF Analysis",
            description: "Analyze PDFs directly in your browser—no server uploads, complete privacy",
            badge: "Secure",
            link: "/documentation/pdf-analysis",
          },
          {
            id: "research-4",
            icon: "FlaskConical",
            title: "Methodology & Data Tools",
            description: "Design studies with interactive advisors, run statistical tests, generate charts",
            badge: "Professional",
            link: "/documentation/methodology-tools",
          },
        ],
      },
      {
        id: "write",
        label: "03. Write & Refine",
        color: "from-emerald-500 to-emerald-600",
        features: [
          {
            id: "write-1",
            icon: "Bot",
            title: "AI Writing & Research Suite",
            description: "From topic ideas to conclusions, leverage AI at every step of your research process",
            badge: "AI",
            link: "/documentation/ai-writing-suite",
          },
          {
            id: "write-2",
            icon: "BookCopy",
            title: "Citation & Originality Hub",
            description: "Generate citations, manage bibliography, and ensure academic integrity",
            badge: "Essential",
            link: "/documentation/citation-hub",
          },
          {
            id: "write-3",
            icon: "FileText",
            title: "Intelligent Synthesis & Paraphrasing",
            description: "Synthesize sources, rewrite for clarity, and maintain academic tone",
            badge: "AI",
            link: "/documentation/synthesis-paraphrasing",
          },
        ],
      },
      {
        id: "submit",
        label: "04. Submit & Present",
        color: "from-orange-500 to-orange-600",
        features: [
          {
            id: "submit-1",
            icon: "University",
            title: "University-Specific Formatting",
            description: "Access formatting guides for major Philippine universities",
            badge: "Essential",
            link: "/documentation/university-formatting",
          },
          {
            id: "submit-2",
            icon: "FileCheck",
            title: "Format Compliance Checker",
            description: "Automated checks against your university's specific requirements",
            badge: "Pro",
            link: "/documentation/format-checker",
          },
          {
            id: "submit-3",
            icon: "Share2",
            title: "Advisor & Critic Collaboration",
            description: "Submit drafts for advisor feedback and manuscript critic certification",
            badge: "Team",
            link: "/documentation/advisor-collaboration",
          },
          {
            id: "submit-4",
            icon: "Users",
            title: "Research Team Collaboration",
            description: "Shared workspaces, task assignments, progress tracking for group projects",
            badge: "Team",
            link: "/documentation/team-collaboration",
          },
          {
            id: "submit-5",
            icon: "Presentation",
            title: "Defense Preparation Suite",
            description: "Generate slides, practice with AI Q&A simulator, study with flashcards",
            badge: "Professional",
            link: "/documentation/defense-preparation",
          },
          {
            id: "submit-6",
            icon: "FileText",
            title: "Thesis Finalizer Pro",
            description: "Multi-agent AI system to polish and integrate all chapters into a cohesive final draft",
            badge: "Pro+Advisor+",
            link: "/thesis-phases/finalizer",
          },
        ],
      },
    ],
    stats: [
      { label: "15+", desc: "Enterprise Tools" },
      { label: "100%", desc: "Privacy Protected" },
      { label: "99.9%", desc: "Platform Uptime" },
    ]
  };

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Target': return <Target className="h-8 w-8" />;
      case 'Lightbulb': return <Lightbulb className="h-8 w-8" />;
      case 'BookOpen': return <BookOpen className="h-8 w-8" />;
      case 'Network': return <Network className="h-8 w-8" />;
      case 'FileText': return <FileText className="h-8 w-8" />;
      case 'FlaskConical': return <FlaskConical className="h-8 w-8" />;
      case 'Bot': return <Bot className="h-8 w-8" />;
      case 'BookCopy': return <BookCopy className="h-8 w-8" />;
      case 'FileCheck': return <FileCheck className="h-8 w-8" />;
      case 'Share2': return <Share2 className="h-8 w-8" />;
      case 'Users': return <Users className="h-8 w-8" />;
      case 'Presentation': return <Presentation className="h-8 w-8" />;
      case 'University': return <University className="h-8 w-8" />;
      default: return <BadgeCheck className="h-8 w-8" />;
    }
  };

  // Helper function to get badge color classes
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "AI":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "Pro":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "Professional":
        return "bg-pink-500/20 text-pink-300 border border-pink-500/30";
      case "Team":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "Secure":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "Essential":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "Pro+Advisor+":
        return "bg-purple-600/20 text-purple-300 border border-purple-600/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  return (
    <section 
      id="features" 
      className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 md:py-24"
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <meta itemProp="name" content="ThesisAI Academic Tools" />
      <meta itemProp="description" content="Comprehensive AI-powered tools for every stage of your academic journey" />
      
      <div className="container">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 
            className="text-3xl md:text-5xl font-bold tracking-tight text-white"
            itemProp="name"
          >
            {featuresData.title}
          </h2>
          <p 
            className="mt-6 text-lg text-slate-300"
            itemProp="description"
          >
            {featuresData.description}
          </p>
        </div>

        {/* Render all phases and features server-side for SEO */}
        <div className="space-y-16">
          {featuresData.phases.map((currentPhase) => (
            <div key={currentPhase.id} className="space-y-8" itemProp="hasPart" itemScope itemType="https://schema.org/ItemList">
              {/* Phase Header */}
              <div className="text-center">
                <h3 
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                  itemProp="name"
                >
                  {currentPhase.label}
                </h3>
                <div className={`h-1 w-16 mx-auto rounded-full bg-gradient-to-r ${currentPhase.color}`} />
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPhase.features.map((currentFeature) => (
                  <Link 
                    key={currentFeature.id} 
                    href={currentFeature.link} 
                    className="group relative h-full p-6 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer overflow-hidden"
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/CreativeWork"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getBadgeColor(currentFeature.badge)}`}>
                        {currentFeature.badge === "AI" && <Zap className="w-3 h-3" />}
                        {currentFeature.badge === "Pro" && <Star className="w-3 h-3" />}
                        {currentFeature.badge === "Professional" && <Award className="w-3 h-3" />}
                        {currentFeature.badge === "Team" && <Users className="w-3 h-3" />}
                        {currentFeature.badge === "Secure" && <Shield className="w-3 h-3" />}
                        {currentFeature.badge === "Essential" && <Heart className="w-3 h-3" />}
                        <span itemProp="name">{currentFeature.badge}</span>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Icon Background */}
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${currentPhase.color} bg-opacity-20 group-hover:bg-opacity-40 transition-colors`}>
                        <div className="text-white" itemProp="image">
                          {getIconComponent(currentFeature.icon)}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 
                        className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all mb-2"
                        itemProp="name"
                      >
                        {currentFeature.title}
                      </h4>

                      {/* Description */}
                      <p 
                        className="text-sm text-slate-400 leading-relaxed"
                        itemProp="description"
                      >
                        {currentFeature.description}
                      </p>

                      {/* Arrow on hover */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-sm text-slate-300 group-hover:text-blue-300 transition-colors">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Stats Section */}
          <div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-sm">
            <p className="text-center text-base text-slate-300 mb-8 font-medium">
              Trusted by researchers and institutions
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {featuresData.stats.map((item, idx) => (
                <div key={idx} className="text-center group cursor-default" itemProp="hasPart" itemScope itemType="https://schema.org/PropertyValue">
                  <p 
                    className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 group-hover:from-blue-300 group-hover:to-cyan-400 transition-all"
                    itemProp="value"
                  >
                    {item.label}
                  </p>
                  <p 
                    className="text-base text-slate-300 mt-3 group-hover:text-slate-200 transition-colors"
                    itemProp="description"
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}