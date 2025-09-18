"use client";

import { FolderIcon, FileTextIcon } from "lucide-react";

const structure = [
  { name: "CHAPTER I - THE PROBLEM AND ITS BACKGROUND", icon: FolderIcon, indent: false },
  { name: "Introduction.docx", icon: FileTextIcon, indent: true },
  { name: "Statement of the Problem.docx", icon: FileTextIcon, indent: true },
  { name: "Scope and Limitations.docx", icon: FileTextIcon, indent: true },
  { name: "CHAPTER II - REVIEW OF RELATED LITERATURE", icon: FolderIcon, indent: false },
  { name: "CHAPTER III - RESEARCH METHODOLOGY", icon: FolderIcon, indent: false },
  { name: "CHAPTER IV - PRESENTATION, ANALYSIS, AND INTERPRETATION", icon: FolderIcon, indent: false },
  { name: "CHAPTER V - SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS", icon: FolderIcon, indent: false },
  { name: "REFERENCES.docx", icon: FileTextIcon, indent: false },
  { name: "APPENDICES.docx", icon: FileTextIcon, indent: false },
];

export function ThesisStructureSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-slate-800">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            A Foundation for Success
          </h2>
          <p className="mt-4 text-slate-300">
            ThesisAI helps you build your paper on the standard 5-chapter model used by universities across the Philippines, ensuring you meet academic standards from the very first draft.
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-slate-900/50 rounded-lg border border-slate-700 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
          <div className="font-mono text-sm text-slate-300 space-y-2">
            {structure.map((item, index) => (
              <div key={index} className={`flex items-center gap-3 ${item.indent ? "pl-6" : ""}`}>
                <item.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}