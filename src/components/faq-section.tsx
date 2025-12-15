"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpenCheck, ShieldCheck, Users, Coins, GraduationCap, BrainCircuit, Settings2, MessageSquareMore, BarChart3, Search, HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";

const faqCategories = [
  {
    icon: GraduationCap,
    title: "Academic Integrity & Research Ethics",
    items: [
      {
        question: "Is using AI tools like ThesisAI considered academic dishonesty?",
        answer: "No. Our platform is designed to assist in the research process, not replace it. We provide tools for brainstorming, outlining, and improving your writing—similar to how a writing tutor would help. The final work, ideas, and arguments must always be your own. We encourage you to follow your university's academic integrity guidelines."
      },
      {
        question: "Can I use the generated text directly in my thesis?",
        answer: "You can use the generated text as a starting point or inspiration, but we strongly recommend rewriting it in your own words. The AI-generated content is meant to help overcome writer's block and provide structure, not to be copied verbatim. Always ensure your final work reflects your original thinking and voice."
      },
      {
        question: "What about plagiarism?",
        answer: "ThesisAI serves as a research writing assistant, but should not substitute your own research efforts. We strongly advise against submitting AI-generated content directly as your own work without significant revision, expansion, and proper citation of sources. Remember that AI tools like ThesisAI are intended to assist in your writing journey, but you remain accountable for using the generated content ethically and responsibly. These AI tools give educators a chance to emphasize to students the importance of submitting only their own original work. Our goal is to inspire students to cultivate their own thoughts and use AI tools to complement their research rather than substitute the research process. Ultimately, we're dedicated to encouraging ethical writing practices and ensuring our platform supports genuine academic research. We urge users to employ ThesisAI responsibly and always provide appropriate attribution."
      },
      {
        question: "How does the Originality Checker work?",
        answer: "Our checker uses advanced algorithms to compare your text against billions of web pages. It highlights potential matches and suggests citation formats. For maximum accuracy, we recommend running checks before submission and addressing any flagged content by proper paraphrasing and citation."
      },
      {
        question: "How do collaborative literature reviews work?",
        answer: "Our Collaborative Literature Review tool enables research teams to work together on literature analysis. Team members can annotate papers, tag themes, create shared coding schemes, and develop themes collectively. The tool includes features such as shared annotation boards, collaborative tagging, consensus tracking, and conflict resolution mechanisms. This is ideal for thesis groups, research teams, and collaborative projects where multiple people need to contribute to the literature review process."
      }
    ]
  },
  {
    icon: BrainCircuit,
    title: "AI Features & Functionality",
    items: [
      {
        question: "What AI model powers ThesisAI Philippines?",
        answer: "We use Puter AI for our AI features. This ensures high-quality, contextually relevant assistance while maintaining fast response times. All AI interactions are processed securely through our Supabase Edge Functions with direct Puter AI integration."
      },
      {
        question: "Are my documents stored in the AI system?",
        answer: "No. Your documents remain securely stored in your personal database. When using AI features, only the selected text is temporarily sent to generate suggestions. We do not retain your document content in the AI system after processing."
      },
      {
        question: "How accurate are the statistical test interpretations?",
        answer: "The AI provides general guidance based on standard statistical practices. However, it's essential to verify the interpretation with your advisor or statistics professor. The tool is designed to help you understand basic concepts, not replace expert statistical consultation."
      },
      {
        question: "How does the Research Problem Identifier work?",
        answer: "Our Research Problem Identifier uses AI to analyze your research topic, surfaces Philippine-specific issues using official datasets (PSA, DepEd, DOH, NEDA, etc.), identifies literature gaps, and generates well-structured research problem statements with context, gap, and significance sections."
      },
      {
        question: "Can I analyze PDFs directly in the browser?",
        answer: "Yes! Our PDF & Document Analysis tool processes files entirely in your browser using client-side processing. Your documents never leave your device, ensuring maximum privacy and security. The tool extracts text, summaries, and keywords directly in your browser."
      }
    ]
  },
  {
    icon: BarChart3,
    title: "Statistical Analysis & Data Tools",
    items: [
      {
        question: "What statistical tests are available?",
        answer: "Our platform currently supports Independent Samples T-test, Pearson Correlation, and Chi-Square Test. We plan to add more tests in the future to cover a wider range of research designs."
      },
      {
        question: "How do I upload my data for analysis?",
        answer: "You can upload your data in CSV or XLSX format directly on the 'Statistical Analysis' page under the 'Data Management' tab. Once uploaded, you can select your independent and dependent variables and choose a test to run."
      },
      {
        question: "How accurate are the statistical results generated by the platform?",
        answer: "The statistical calculations are performed using industry-standard libraries (jStat) on our secure backend. While the calculations are accurate, always ensure your data meets the assumptions of the chosen test and consult with your advisor for interpretation and reporting."
      },
      {
        question: "Can I generate charts and reports from my analysis?",
        answer: "Yes! After running an analysis, you can use the 'Visualization' tab to generate simple bar charts from your data. The 'Reporting Generator' can also help you draft a formatted report of your analysis results in styles like APA 7th Edition."
      }
    ]
  },
  {
    icon: ShieldCheck,
    title: "Security & Privacy",
    items: [
      {
        question: "Is my research data secure?",
        answer: "Yes. All documents are encrypted at rest and in transit. We use industry-standard security practices with Supabase. Your research belongs to you—we will never share it with third parties without your explicit consent."
      },
      {
        question: "Do you sell user data?",
        answer: "Absolutely not. We have a strict no-data-selling policy. The only data shared is what you explicitly choose to make public (like sharing a document link). Your private documents and personal information are never sold or shared."
      },
      {
        question: "How are passwords protected?",
        answer: "We use Supabase Auth which implements modern password hashing with bcrypt. Your password is never stored in plain text. We also support secure authentication via Google OAuth to reduce password-related risks."
      }
    ]
  },
  {
    icon: Users,
    title: "Advisor & Critic Collaboration",
    items: [
      {
        question: "How do I connect with my thesis advisor?",
        answer: "You can invite your advisor through the 'Manage Advisor' section in settings. If they're registered on ThesisAI, they'll receive a notification. Otherwise, you can designate them by name and export documents for offline review. The Pro + Advisor plan enables full online collaboration."
      },
      {
        question: "What happens when I submit a document for review?",
        answer: "When you click 'Submit for Review', your document status changes to 'submitted'. Your advisor receives a notification and can access the document through their dashboard. They can then approve it, request revisions, or mark it as approved after feedback."
      },
      {
        question: "Can multiple advisors review my work?",
        answer: "Currently, you can connect with one primary advisor. For additional feedback, we recommend exporting your document and sharing it directly. Advisors can view your work if they have your public share link, but only your designated advisor can provide official feedback through the platform."
      }
    ]
  },
  {
    icon: Coins,
    title: "Pricing & Subscriptions",
    items: [
      {
        question: "What's included in the free plan?",
        answer: "The free plan includes up to 3 documents, basic AI assistance, and 10 originality checks per month. You can explore all core features and upgrade anytime to unlock unlimited documents and advanced functionality."
      },
      {
        question: "How do referral credits work?",
        answer: "Earn ₱50 when someone signs up with your code, ₱75 when they upgrade to Pro, and additional earnings when they refer others. Credits can be used to offset subscription costs or transferred to peers. Minimum balance of ₱200.00 must be maintained."
      },
      {
        question: "Can I get a refund?",
        answer: "Due to the digital nature of our service, we don't offer refunds. However, you can cancel your subscription at any time. Remaining days in your current billing cycle won't be charged again. Contact us for exceptional circumstances."
      }
    ]
  },
  {
    icon: Settings2,
    title: "Technical Support",
    items: [
      {
        question: "Why am I experiencing slow loading?",
        answer: "Slow loading may occur due to internet connectivity issues. Try refreshing the page. If problems persist, check your network connection. The platform works best with stable internet access. Offline mode allows saving drafts locally and syncing when back online."
      },
      {
        question: "How do I report a bug?",
        answer: "Use the 'Provide Feedback' link in the footer of any page. Include details about the issue, steps to reproduce, and screenshots if possible. Our team monitors these reports daily and prioritizes critical issues."
      },
      {
        question: "Does ThesisAI work on mobile devices?",
        answer: "Yes! Our responsive design works on tablets and smartphones. While the full editing experience is optimized for larger screens, you can access documents, reviews, and most features on mobile. Use landscape mode for better editing experience."
      }
    ]
  },
  {
    icon: BookOpenCheck,
    title: "University-Specific Guidance",
    items: [
      {
        question: "How do I format my paper for [University Name]?",
        answer: "Visit the University Guides section to find specific formatting requirements for major Philippine universities. Each guide includes margin specifications, font requirements, citation styles, and sample layouts. You can also use our interactive style guide to generate properly formatted citations."
      },
      {
        question: "What if my university isn't listed?",
        answer: "If your institution isn't in our database, use the 'Request to Add' feature in the University Guides section. Our team reviews submissions weekly. In the meantime, consult your university's official style manual or thesis handbook for accurate formatting."
      },
      {
        question: "How do I cite sources in APA 7th edition?",
        answer: "Use our Citation Manager to generate and save properly formatted citations. The tool follows APA 7th edition guidelines for author names, publication dates, titles, and source information. Always double-check against the official APA manual for complex cases."
      },
      {
        question: "What is the University Format Checker?",
        answer: "Our University Format Checker allows you to select your specific university and run an automated format compliance check against their specific requirements. The tool provides detailed feedback on formatting issues and suggestions for corrections, helping ensure your thesis meets your institution's standards."
      }
    ]
  },
  {
    icon: MessageSquareMore,
    title: "General Questions",
    items: [
      {
        question: "Can I collaborate with classmates?",
        answer: "Yes! We offer several collaboration tools that maintain academic integrity. Use our Collaborative Literature Review tool to work together on literature analysis, annotation, and theme development. You can also use our shared annotation features, collaborative coding tools, and group analysis tools that allow multiple researchers to contribute meaningfully to shared research projects while maintaining individual accountability."
      },
      {
        question: "How often should I save my work?",
        answer: "Your work is automatically saved every few seconds. However, we recommend manually saving important milestones. The autosave feature ensures minimal data loss, but regular manual saves provide peace of mind during extensive writing sessions."
      },
      {
        question: "Is there a mobile app?",
        answer: "Currently, ThesisAI is web-based and accessible through any browser. A dedicated mobile app is planned for future development. The responsive web interface works well on mobile devices, though we recommend using desktop for intensive writing tasks."
      },
      {
        question: "What tools are available for research conceptualization?",
        answer: "We offer several tools for the conceptualization phase including a Variable Mapping Tool to define and visualize research variables, a Research Problem Identifier that surfaces Philippine-specific issues using official datasets, and structured proposal templates aligned with Philippine university standards."
      },
      {
        question: "What is the Research Article Analyzer?",
        answer: "The Research Article Analyzer is a specialized tool for deep analysis of academic research articles. It provides structured extraction of title, authors, methodology, findings, and conclusions. The tool includes annotation features, literature review matrices, collaboration tools for group work, and export options for use in your thesis writing process."
      },
      {
        question: "How does the Collaborative Literature Review feature work?",
        answer: "The Collaborative Literature Review feature allows multiple researchers to work together on analyzing literature. Team members can annotate papers, tag them with themes, create shared coding schemes, and build literature synthesis matrices together. The feature includes real-time collaboration, conflict resolution tools, consensus tracking, and export options for use in your thesis. Perfect for thesis groups, research teams, or any collaborative research project."
      },
      {
        question: "What tools are available for group research projects?",
        answer: "We offer several collaboration tools for group research: 1) Collaborative Literature Review for joint analysis of research papers; 2) Shared Annotation Tools for team-based paper review; 3) Collaborative Coding for qualitative research; 4) Group Analysis Tools for collective data interpretation; 5) Team Workspace for shared project management. These tools are designed to enhance teamwork while maintaining individual accountability in research."
      }
    ]
  }
];

export function FaqSection() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter FAQ categories and items based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqCategories;
    }

    const lowerSearch = searchTerm.toLowerCase();

    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(lowerSearch) ||
            item.answer.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchTerm]);

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-accent-cyan" />
            <span className="text-sm font-semibold text-accent-cyan bg-accent-electric-purple/10 px-3 py-1 rounded-full">
              Professional Support
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about ThesisAI Philippines, from features and pricing to academic integrity and technical support.
          </p>
        </div>

        {/* Quick Search Input - Enhanced */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 flex items-center gap-3 transition-colors focus-within:border-blue-500/50">
              <Search className="w-5 h-5 text-accent-cyan ml-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm px-2 py-2"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-1 hover:bg-slate-700/50 rounded-md transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-3 text-sm text-slate-400 text-center">
              {totalResults > 0 ? (
                <span>
                  Found <span className="text-blue-300 font-semibold">{totalResults}</span> result
                  {totalResults !== 1 ? "s" : ""} in{" "}
                  <span className="text-blue-300 font-semibold">{filteredCategories.length}</span>{" "}
                  categor{filteredCategories.length !== 1 ? "ies" : "y"}
                </span>
              ) : (
                <span>
                  No results found for <span className="text-slate-300">"{searchTerm}"</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* FAQ Categories - Uses filtered results */}
        <div className="space-y-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
            <Card key={category.title} className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50 py-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                    <category.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{category.title}</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{category.items.length} questions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="divide-y divide-slate-700/50">
                  {category.items.map((faq, index) => (
                    <AccordionItem 
                      value={`item-${category.title}-${index}`} 
                      key={`${category.title}-${index}`}
                      className="border-0"
                    >
                      <AccordionTrigger className="text-left font-semibold text-white hover:text-accent-cyan hover:no-underline py-4 px-0 group">
                        <span className="text-base flex items-start gap-3">
                          <span className="text-accent-cyan/60 group-hover:text-accent-cyan transition-colors mt-1 text-xs font-bold px-2.5 py-1 rounded-full bg-accent-electric-purple/10">Q</span>
                          <span>{faq.question}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 text-base pb-4 pl-8 pr-0">
                        <div className="flex gap-3">
                          <span className="text-accent-orange/60 flex-shrink-0 mt-1 text-xs font-bold px-2.5 py-1 rounded-full bg-accent-cyan/10">A</span>
                          <div>{faq.answer}</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/30 mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No results found</h3>
              <p className="text-slate-400 mb-6">
                We couldn't find any FAQs matching <span className="text-slate-300">"{searchTerm}"</span>
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50">
              <a href="mailto:support@thesisai.ph">Contact Support</a>
            </Button>
            <Button variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800">
              <a href="/documentation">View Documentation</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}