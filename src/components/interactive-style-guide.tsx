"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { createSanitizedHtml } from "@/lib/html-sanitizer";
import { toast } from "sonner";

const citationStyles = {
  "APA 7th Edition": {
    book: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Santos, J. A." },
        { name: "year", label: "Year", placeholder: "e.g., 2023" },
        { name: "title", label: "Title of Work", placeholder: "e.g., The history of the Philippines" },
        { name: "publisher", label: "Publisher", placeholder: "e.g., University Press" },
      ],
      template: (data: any) => `${data.author || "Author, A. A."} (${data.year || "Year"}). <i>${data.title || "Title of work"}</i>. ${data.publisher || "Publisher"}.`,
    },
    journal: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Reyes, M. B." },
        { name: "year", label: "Year", placeholder: "e.g., 2022" },
        { name: "title", label: "Title of Article", placeholder: "e.g., The impact of technology on education" },
        { name: "journal", label: "Journal Name", placeholder: "e.g., Philippine Journal of Education" },
        { name: "volume", label: "Volume", placeholder: "e.g., 45" },
        { name: "issue", label: "Issue", placeholder: "e.g., 2" },
        { name: "pages", label: "Pages", placeholder: "e.g., 112-125" },
      ],
      template: (data: any) => `${data.author || "Author, A. A."} (${data.year || "Year"}). ${data.title || "Title of article"}. <i>${data.journal || "Journal Name"}</i>, <i>${data.volume || "Volume"}</i>(${data.issue || "Issue"}), ${data.pages || "Pages"}.`,
    },
    website: {
      fields: [
        { name: "author", label: "Author or Organization", placeholder: "e.g., Department of Health" },
        { name: "date", label: "Full Date", placeholder: "e.g., 2023, May 15" },
        { name: "title", label: "Title of Page", placeholder: "e.g., National Health Advisory" },
        { name: "site", label: "Site Name", placeholder: "e.g., Official Gazette" },
        { name: "url", label: "URL", placeholder: "https://..." },
      ],
      template: (data: any) => `${data.author || "Author or Organization"}. (${data.date || "Year, Month Day"}). <i>${data.title || "Title of page"}</i>. ${data.site || "Site Name"}. ${data.url || "URL"}`,
    },
  },
  "MLA 9th Edition": {
    book: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Santos, Jose A." },
        { name: "title", label: "Title of Work", placeholder: "e.g., The History of the Philippines" },
        { name: "publisher", label: "Publisher", placeholder: "e.g., University Press" },
        { name: "year", label: "Year", placeholder: "e.g., 2023" },
      ],
      template: (data: any) => `${data.author || "Author, First"}. <i>${data.title || "Title of Work"}</i>. ${data.publisher || "Publisher"}, ${data.year || "Year"}.`,
    },
  },
  "Chicago 17th Edition": {
    book: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Santos, Jose A." },
        { name: "title", label: "Title of Work", placeholder: "e.g., The History of the Philippines" },
        { name: "place", label: "Place of Publication", placeholder: "e.g., Quezon City" },
        { name: "publisher", label: "Publisher", placeholder: "e.g., University Press" },
        { name: "year", label: "Year", placeholder: "e.g., 2023" },
      ],
      template: (data: any) => `${data.author || "Last, First"}. <i>${data.title || "Title of Work"}</i>. ${data.place || "Place of Publication"}: ${data.publisher || "Publisher"}, ${data.year || "Year"}.`,
    },
    journal: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Reyes, Maria B." },
        { name: "title", label: "Title of Article", placeholder: "e.g., The Impact of Technology on Education" },
        { name: "journal", label: "Journal Name", placeholder: "e.g., Philippine Journal of Education" },
        { name: "volume", label: "Volume", placeholder: "e.g., 45" },
        { name: "issue", label: "Issue No.", placeholder: "e.g., 2" },
        { name: "year", label: "Year", placeholder: "e.g., 2022" },
        { name: "pages", label: "Pages", placeholder: "e.g., 112-25" },
      ],
      template: (data: any) => `${data.author || "Last, First"}. "${data.title || "Title of Article"}." <i>${data.journal || "Journal Name"}</i> ${data.volume || "Volume"}, no. ${data.issue || "Issue"} (${data.year || "Year"}): ${data.pages || "Pages"}.`,
    },
    website: {
      fields: [
        { name: "author", label: "Author(s)", placeholder: "e.g., Dela Cruz, Juan" },
        { name: "title", label: "Title of Page", placeholder: "e.g., National Health Advisory" },
        { name: "site", label: "Name of Website", placeholder: "e.g., Department of Health" },
        { name: "date", label: "Publication Date", placeholder: "e.g., May 15, 2023" },
        { name: "url", label: "URL", placeholder: "https://..." },
      ],
      template: (data: any) => `${data.author || "Last, First"}. "${data.title || "Title of Page"}." ${data.site || "Name of Website"}. ${data.date || "Month Day, Year"}. ${data.url || "URL"}.`,
    },
  },
};

type CitationField = {
  name: string;
  label: string;
  placeholder: string;
};

export function InteractiveStyleGuide() {
  const [style, setStyle] = useState("APA 7th Edition");
  const [sourceType, setSourceType] = useState("book");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const currentGuide = useMemo(() => {
    // @ts-ignore
    return citationStyles[style]?.[sourceType];
  }, [style, sourceType]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatedCitation = useMemo(() => {
    if (!currentGuide) return "";
    return currentGuide.template(formData);
  }, [currentGuide, formData]);

  const handleCopy = () => {
    const plainText = generatedCitation.replace(/<i>/g, "").replace(/<\/i>/g, "");
    navigator.clipboard.writeText(plainText);
    toast.success("Citation copied to clipboard!");
  };

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    // @ts-ignore
    const firstSourceType = Object.keys(citationStyles[newStyle])[0];
    setSourceType(firstSourceType);
    setFormData({});
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Select value={style} onValueChange={handleStyleChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(citationStyles).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceType} onValueChange={setSourceType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {/* @ts-ignore */}
            {Object.keys(citationStyles[style]).map(st => <SelectItem key={st} value={st} className="capitalize">{st}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      {currentGuide && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {currentGuide.fields.map((field: CitationField) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input id={field.name} placeholder={field.placeholder} value={formData[field.name] || ""} onChange={e => handleInputChange(field.name, e.target.value)} />
              </div>
            ))}
          </div>
          <Card className="bg-tertiary">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="font-mono text-sm" dangerouslySetInnerHTML={createSanitizedHtml(generatedCitation)} />
                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}