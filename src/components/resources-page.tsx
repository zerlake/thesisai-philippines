"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BookOpen, ExternalLink, Heart, University, Wand2, UserCheck, BookUser, ArrowRight, FlaskConical } from "lucide-react";
import { InteractiveStyleGuide } from "./interactive-style-guide";
import { useAuth } from "./auth-provider";
import Link from "next/link";
import { Button } from "./ui/button";

// --- Student Resources ---
const studentWritingGuides = [
  {
    title: "Structuring a Strong Paragraph (The MEAL Plan)",
    content: "A good academic paragraph has a Main idea, Evidence, Analysis, and a Link to the main thesis. This structure ensures your points are clear, supported, and relevant.",
  },
  {
    title: "Maintaining an Academic Tone",
    content: "Use formal language, avoid slang or contractions (e.g., use 'do not' instead of 'don't'), be objective, and support all claims with evidence rather than personal opinion.",
  },
  {
    title: "Writing a Clear Thesis Statement",
    content: "Your thesis statement should be a single, debatable sentence that presents your main argument. It typically appears at the end of your introduction and guides the entire paper.",
  },
];

const universityStyleGuides = [
  {
    name: "University of the Philippines Diliman Library — Citation Maker & Guides",
    link: "https://mainlib.upd.edu.ph/citation-maker-free-online/",
  },
  {
    name: "Ateneo de Davao University — APA Citation Guide",
    link: "https://adzu.edu.ph/apa-citation-guide/",
  },
  {
    name: "University of the Philippines Manila — Research Tools & Citation",
    link: "https://library.upm.edu.ph/node/67",
  },
  {
    name: "Arellano University — Citation Guides & Tools",
    link: "https://sites.google.com/arellano.edu.ph/aupclibrary/programs-services/research-guides-tools/citation-guides-tools",
  },
  {
    name: "Central Philippine University Library — APA Guide",
    link: "https://cpu.libguides.com/apaguide",
  },
  {
    name: "Philippine Law Schools — Philippine Legal Citations Guide (UP Law, Ateneo Law)",
    link: "https://www.nyulawglobal.org/globalex/philippines1_part2.html",
  },
  {
    name: "Philippine Christian University — Citation Guide & Research Instructions",
    link: "https://pcu.edu.ph/library/citationguide/",
  },
  {
    name: "Adamson University Library — Citation Styles & Examples",
    link: "https://adamson.edu.ph/library/citing-sources/",
  },
  {
    name: "De La Salle University — Research Guidance and Citation Tools",
    link: "https://www.dlsu.edu.ph/library/resources/research-guides/",
  },
  {
    name: "University of Santo Tomas — Library Instruction on Citation Styles",
    link: "https://library.ust.edu.ph/research-guides",
  },
  {
    name: "University of San Carlos — Citation Manual for Students",
    link: "https://usc.edu.ph/library/research-services/citation-guide",
  },
  {
    name: "Polytechnic University of the Philippines — Thesis and Citation Resources",
    link: "https://www.pup.edu.ph/library/thesis_guidelines",
  },
  {
    name: "Far Eastern University — Library Research Tools & Citation Manual",
    link: "https://feu.edu.ph/library/research_resources",
  },
  {
    name: "University of Mindanao — Research Methods & Citation",
    link: "https://umindanao.edu.ph/library/research-support/",
  },
  {
    name: "Lyceum of the Philippines University — Citation Guide and Referencing Tools",
    link: "https://lyceum.edu.ph/library/citation-guide",
  },
  {
    name: "Mapúa University — Thesis and Citation Guidelines",
    link: "https://www.mapua.edu.ph/research/guidelines/",
  },
  {
    name: "San Beda University — Research Paper and Citation Instructions",
    link: "https://sanbeda.edu.ph/library/guidelines",
  },
  {
    name: "University of the East — Citation Manual and Writing Resources",
    link: "https://ue.edu.ph/library/research-resources/",
  },
  {
    name: "University of the Philippines Los Baños — Citation Guide",
    link: "https://uplb.edu.ph/library/citation",
  },
  {
    name: "Ateneo de Manila University — Writing and Citation Resources",
    link: "https://www.ateneo.edu/library/research-guides/citation",
  },
];

const studentWellbeingTips = [
    {
        title: "The Pomodoro Technique",
        content: "Work in focused 25-minute intervals, followed by a 5-minute break. After four sessions, take a longer 15-30 minute break. This helps maintain focus and prevent burnout."
    },
    {
        title: "Set Realistic Daily Goals",
        content: "Instead of 'write Chapter 3,' aim for a smaller, achievable goal like 'write 300 words' or 'find 5 new sources.' This builds momentum and reduces overwhelm."
    },
    {
        title: "Schedule 'No-Thesis' Time",
        content: "Actively schedule time where you are not allowed to think about your thesis. Engage in hobbies, exercise, or spend time with friends and family to recharge your mind."
    }
];

// --- Advisor Resources ---
const advisorMentorshipGuides = [
  {
    title: "Providing Holistic and Compassionate Feedback",
    content: "Provide constructive criticism respectfully. Instead of direct commands, try suggestive phrasing like, 'You might consider exploring...' or 'This section could be strengthened by...' Balance critique with encouragement to build confidence.",
  },
  {
    title: "Navigating the Local Academic Environment",
    content: "Be mindful of institutional requirements from bodies like CHED. Guide students through common protocols for proposals and defenses. Acknowledge diverse student contexts (e.g., connectivity issues, family obligations) and be flexible with communication and deadlines when possible.",
  },
  {
    title: "Managing Milestones and Deadlines",
    content: "Use the Milestone Tracker on the student's detail page to set clear, realistic deadlines. Breaking the project into smaller steps (e.g., 'Chapter 1 Draft') makes the process less daunting for the student and easier for you to track, preventing last-minute cramming.",
  },
  {
    title: "Identifying Common Writing Challenges",
    content: "Look for common issues like code-switching ('Taglish') in formal writing, difficulties in synthesizing sources, and structuring arguments. Guide them to use the platform's AI tools for paraphrasing and improving academic tone while ensuring they maintain their own voice.",
  },
];

const StudentResources = () => {
  const scholarlyDatabases = [
    { name: "Philippine Journal of Criminology (CHED)", link: "https://www.pjci.ched.gov.ph/", description: "A CHED-accredited journal focusing on criminology and criminal justice in the Philippines." },
    { name: "e-Journals Philippines", link: "https://ejournals.ph/", description: "A comprehensive online collection of academic journals from various Philippine higher education institutions." },
    { name: "ASCI Database", link: "https://ascidatabase.com/home.php", description: "The Asian Science Citation Index provides a database of scientific journals from Asian countries." },
    { name: "BASE (Bielefeld Academic Search Engine)", link: "https://www.base-search.net/index.php?i=b&l=en", description: "One of the world's most voluminous search engines for academic web resources." },
    { name: "CABI Digital Library", link: "https://www.cabi.org/what-we-do/cabi-publications?section=1&order=date-desc", description: "A resource for applied life sciences, including agriculture, environmental sciences, and public health." },
    { name: "Directory of Open Access Journals (DOAJ)", link: "https://doaj.org/", description: "A community-curated directory that indexes high-quality, open access, peer-reviewed journals." },
    { name: "HOLLIS (Harvard Library)", link: "https://library.harvard.edu/services-tools/hollis", description: "The catalog for Harvard Library, providing access to a vast collection of scholarly materials." },
    { name: "OpenAlex", link: "https://openalex.org/", description: "A free and open index of hundreds of millions of scholarly works, authors, and institutions." },
    { name: "Index Copernicus", link: "https://journals.indexcopernicus.com/", description: "An international database of scientific journals, evaluating journals for quality and providing researcher profiles." },
    { name: "ResearchGate", link: "https://www.researchgate.net/", description: "A social networking site for scientists and researchers to share papers and find collaborators." },
    { name: "Scilit", link: "https://www.scilit.com/", description: "A comprehensive, free database for scientists that indexes recent publications." },
    { name: "Socioeconomic Research Portal (SERP-P)", link: "https://serp-p.pids.gov.ph/publication_type", description: "A portal by PIDS containing socioeconomic studies in the Philippines." },
    { name: "ASEAN Citation Index (ACI)", link: "https://asean-cites.org/", description: "A central regional database of scholarly journals from Southeast Asian countries." },
    { name: "The Philippine Journal of Fisheries", link: "https://www.nfrdi.da.gov.ph/tpjf/", description: "A peer-reviewed journal focusing on fisheries science and aquaculture in the Philippines." },
    { name: "Google Scholar", link: "https://scholar.google.com/", description: "A widely used search engine for scholarly literature across many disciplines." },
    { name: "Philippine Journal of Science (DOST)", link: "https://philjournalsci.dost.gov.ph/", description: "A peer-reviewed journal by the DOST, covering a wide range of scientific fields." },
    { name: "SLU Post-Graduate E-Journal", link: "https://pejard.slu.edu.ph/", description: "The official research journal of the School of Advanced Studies of Saint Louis University, Baguio City." },
  ];

  return (
    <>
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>VSU Style Guide</CardTitle>
          <CardDescription>
            A dedicated guide for the Annals of Tropical Research (ATR) citation style used by Visayas State University.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/atr-style-guide">
            <Button className="w-full">
              Open ATR Style Guide
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Interactive Citation Formatter</CardTitle>
          <CardDescription>Select a style and source type, then fill in the fields to generate a formatted citation.</CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveStyleGuide />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5" /> Scholarly Journal Indexes & Databases</CardTitle>
          <CardDescription>Links to external databases and journal platforms for your literature search.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {scholarlyDatabases.map((db) => (
                <a key={db.name} href={db.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-md border hover:bg-accent">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{db.name}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{db.description}</p>
                </a>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Writing Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {studentWritingGuides.map((guide, index) => (
              <AccordionItem value={`guide-${index}`} key={index}>
                <AccordionTrigger>{guide.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{guide.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><University className="w-5 h-5" /> College/University Style Guides</CardTitle>
          <CardDescription>Official citation and formatting guides from major Philippine universities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {universityStyleGuides.map((guide) => (
                <a key={guide.name} href={guide.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md border hover:bg-accent">
                    <span className="font-medium">{guide.name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Wellbeing & Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {studentWellbeingTips.map((tip, index) => (
              <AccordionItem value={`tip-${index}`} key={index}>
                <AccordionTrigger>{tip.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{tip.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};

const AdvisorResources = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5" /> Mentorship Guides</CardTitle>
        <CardDescription>Best practices for guiding your students to success.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {advisorMentorshipGuides.map((guide, index) => (
            <AccordionItem value={`guide-${index}`} key={index}>
              <AccordionTrigger>{guide.title}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{guide.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookUser className="w-5 h-5" /> Student's Perspective</CardTitle>
        <CardDescription>View the platform's features from a student's point of view to better understand their workflow and the tools available to them.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/user-guide">
          <Button variant="outline" className="w-full">Open Student User Guide</Button>
        </Link>
      </CardContent>
    </Card>
  </>
);

export function ResourcesPage() {
  const { profile } = useAuth();
  const isAdvisor = profile?.role === 'advisor';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isAdvisor ? "Advisor Resource Hub" : "Resource Hub"}</CardTitle>
          <CardDescription>
            {isAdvisor 
              ? "A collection of guides and best practices for effective student mentorship."
              : "A collection of guides, links, and tips to support your thesis writing journey."
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {isAdvisor ? <AdvisorResources /> : <StudentResources />}
    </div>
  );
}