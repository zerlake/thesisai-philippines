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
import { BookMarked, ExternalLink, FileText } from "lucide-react";
import { createSanitizedHtml } from "@/lib/html-sanitizer";

const atrCitationExamples = [
  {
    type: "Journal Article",
    rule: "Author(s) Year. Title of article. Journal Name volume(issue): pages.",
    example: "Zaragoza, E. P., & T. T. D. T. Truong. 2021. Effects of different drying methods on the quality of fermented cacao (Theobroma cacao L.) beans. <i>Annals of Tropical Research 43</i>(1): 127-143.",
  },
  {
    type: "Book",
    rule: "Author(s) Year. Title of Book. Edition. Publisher, Place of Publication.",
    example: "Steel, R. G. D., & J. H. Torrie. 1980. <i>Principles and Procedures of Statistics: A Biometrical Approach</i>. 2nd ed. McGraw-Hill Book Co., Inc., New York.",
  },
  {
    type: "Chapter in a Book",
    rule: "Author(s) of chapter. Year. Title of chapter. In: Editor(s), ed(s). Title of Book. Publisher, Place of Publication, pp. pages.",
    example: "Plucknett, D. L., & D. L. Winkelmann. 1995. Technology for sustainable agriculture. In: V. W. Ruttan, ed. <i>Agriculture, Environment and Health: Sustainable Development in the 21st Century</i>. University of Minnesota Press, Minneapolis, pp. 305-320.",
  },
  {
    type: "Thesis or Dissertation",
    rule: "Author. Year. Title of thesis/dissertation. [Unpublished MS Thesis/PhD Dissertation]. Name of University, Place.",
    example: "Pascual, C. B. 2019. Bio-ecology and management of the taro beetle, Papuana woodlarkiana Montrouzier (Coleoptera: Scarabaidae), in Eastern Samar, Philippines. [Unpublished PhD Dissertation]. Visayas State University, Baybay City, Leyte.",
  },
  {
    type: "Website or Online Source",
    rule: "Author(s) or Organization. Year. Title of page. Retrieved from [URL] on [Date Accessed].",
    example: "PhilRice. 2020. PalayCheck System. Retrieved from http://www.pinoyrice.com on June 15, 2020.",
  },
];

const generalFormatting = [
    {
        title: "Font, Spacing, and Margins",
        content: {
            type: 'visual-sample',
            text: `The study was conducted to determine the effects of climate change on rice production in Leyte. The researchers gathered data from various municipalities over a period of five years (de la Cruz 2020).\n\nPrevious studies have shown a significant correlation between rising temperatures and decreased yield (Reyes & Santos 2021). This research builds upon the findings of earlier works (Bautista et al. 2019) by incorporating new climate models.`
        }
    },
    {
        title: "Language and Tone (Impersonal)",
        content: {
            type: 'before-after',
            before: "I think that my results show a clear trend. We can see that the treatment was effective.",
            after: "The results indicate a clear trend, suggesting the treatment was effective."
        }
    },
    {
        title: "In-text Citations (Modified Harvard)",
        content: {
            type: 'paragraph-example',
            text: "Recent studies on agricultural technology have shown significant advancements (de la Cruz 2020). The collaboration between two leading universities resulted in a new hybrid crop (Reyes & Santos 2021). However, a comprehensive review involving multiple research teams suggested that more long-term data is needed to confirm these findings (Bautista et al. 2019)."
        }
    }
];

export function AtrStyleGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Annals of Tropical Research (ATR) Style Guide</CardTitle>
          <CardDescription>
            A detailed guide to the citation style used by Visayas State University, based on the Annals of Tropical Research Journal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="https://atr.vsu.edu.ph/instruction-to-authors" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary hover:underline">
            View Official ATR Instructions to Authors <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> General Manuscript Formatting</CardTitle>
          <CardDescription>Key formatting rules for your manuscript body with visual examples.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {generalFormatting.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-base font-semibold">{item.title}</AccordionTrigger>
                <AccordionContent>
                  {item.content.type === 'visual-sample' && (
                    <div className="p-4 bg-white border shadow-sm">
                      <div className="p-8 bg-white font-serif text-black text-sm leading-loose whitespace-pre-wrap">
                        {item.content.text}
                      </div>
                    </div>
                  )}
                  {item.content.type === 'before-after' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Before (Informal):</p>
                        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-800 rounded">
                          <p className="italic">&quot;{item.content.before}&quot;</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">After (Academic Tone):</p>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400 text-green-800 rounded">
                          <p>&quot;{item.content.after}&quot;</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {item.content.type === 'paragraph-example' && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Example Paragraph:</p>
                      <div className="p-3 bg-tertiary rounded">
                        <p className="text-muted-foreground">{item.content.text}</p>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookMarked className="w-5 h-5" /> Reference List Examples</CardTitle>
          <CardDescription>Click on each source type to see the formatting rule and an example.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {atrCitationExamples.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-base font-semibold">{item.type}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground"><strong>Rule:</strong> {item.rule}</p>
                    <div className="p-3 bg-tertiary rounded-md font-mono text-sm">
                      <p><strong>Example:</strong></p>
                      <p dangerouslySetInnerHTML={createSanitizedHtml(item.example)} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}