"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, ChevronRight, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Inline Wiki - Hardcoded wiki data (no API, no file system)
 * This is a fallback that should always work
 */

interface WikiPage {
  slug: string;
  title: string;
  description: string;
  content: string;
}

// Hardcoded wiki pages - loaded directly
const WIKI_PAGES: WikiPage[] = [
  {
    slug: "Home",
    title: "Home",
    description: "Central knowledge base for ThesisAI",
    content: `# ThesisAI Code Wiki

Central knowledge base for the ThesisAI project - Architecture, implementation details, patterns, and decision logs.

## Quick Navigation

- **Getting Started** - Setup, development, first time contributor guide
- **Architecture Overview** - System design, data flow, components
- **Technology Stack** - Libraries, frameworks, and tools
- **Code Standards** - Conventions, patterns, best practices

## Key Features

- Searchable documentation
- Complete architecture details
- Code examples and patterns
- Integration guides`,
  },
  {
    slug: "Getting-Started",
    title: "Getting Started",
    description: "Setup, development environment, first run",
    content: `# Getting Started

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm dev
\`\`\`

## Build

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## Testing

\`\`\`bash
pnpm test
\`\`\``,
  },
  {
    slug: "Architecture-Overview",
    title: "Architecture Overview",
    description: "System design, data flow, components",
    content: `# Architecture Overview

## System Design

The application is built with:

- **Frontend**: Next.js 16 with React 19
- **Backend**: Supabase with PostgreSQL
- **Database**: PostgreSQL with migrations
- **Authentication**: Supabase Auth
- **AI**: Puter SDK and Model Context Protocol

## Data Flow

Users → Next.js App → Supabase API → PostgreSQL

## Components

- React components in \`src/components/\`
- Pages in \`src/app/\`
- API routes in \`src/app/api/\``,
  },
  {
    slug: "Code-Standards",
    title: "Code Standards",
    description: "Coding conventions, patterns, best practices",
    content: `# Code Standards

## TypeScript

- Use strict mode
- Avoid \`any\` types
- Define explicit return types
- No implicit \`any\`

## Naming

- PascalCase for components
- camelCase for functions
- UPPER_SNAKE_CASE for constants
- useXxx for custom hooks

## Imports

- React imports first
- External libraries (alphabetical)
- Internal imports (alphabetical)
- Relative imports last

## Components

\`\`\`typescript
interface Props {
  title: string;
  onClose?: () => void;
}

export function MyComponent({ title, onClose }: Props) {
  return <div>{title}</div>;
}
\`\`\``,
  },
  {
    slug: "Technology-Stack",
    title: "Technology Stack",
    description: "Libraries, frameworks, and tools",
    content: `# Technology Stack

## Core

- **React**: 19.x - UI library
- **Next.js**: 16.x - React framework
- **TypeScript**: Latest - Type safety

## UI

- **Radix UI**: Component primitives
- **Tailwind CSS**: Utility CSS
- **Lucide React**: Icons

## Database

- **Supabase**: Backend as a Service
- **PostgreSQL**: Database

## Testing

- **Vitest**: Unit testing
- **@testing-library/react**: Component testing

## Other

- **Puter SDK**: AI integration
- **React Markdown**: Markdown rendering
- **Sonner**: Toast notifications`,
  },
];

export function WikiInline() {
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = WIKI_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Wiki
          </CardTitle>
          <CardDescription>Inline Knowledge Base</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wiki..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-lg p-2">
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <Button
                  key={page.slug}
                  variant={selectedPage?.slug === page.slug ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedPage(page)}
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium">{page.title}</div>
                  </div>
                  {selectedPage?.slug === page.slug && (
                    <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="lg:col-span-3">
        <CardHeader>
          {selectedPage ? (
            <>
              <CardTitle className="text-2xl">{selectedPage.title}</CardTitle>
              <CardDescription>{selectedPage.description}</CardDescription>
            </>
          ) : (
            <>
              <CardTitle>Select a Wiki Page</CardTitle>
              <CardDescription>Choose from the sidebar</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!selectedPage ? (
            <div className="py-12 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <p className="font-medium">No Page Selected</p>
                <p className="text-sm text-muted-foreground">
                  Select a wiki page from the sidebar to read documentation
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold mt-0 mb-4 text-foreground" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-bold mt-6 mb-3 border-b pb-2 text-foreground" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props} />
                    ),
                    p: ({ node, ...props }) => <p className="mb-3 leading-7 text-foreground" {...props} />,
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1 text-foreground" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="ml-2 text-foreground" {...props} />,
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block bg-muted p-3 rounded-lg overflow-x-auto text-sm font-mono mb-3 text-foreground border border-muted-foreground/20"
                          {...props}
                        />
                      ),
                    pre: ({ node, ...props }) => <pre className="mb-3" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-muted pl-4 italic text-muted-foreground mb-3"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto mb-3">
                        <table
                          className="w-full border-collapse border border-muted text-sm text-foreground"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-muted bg-muted p-2 text-left font-semibold text-foreground" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-muted p-2 text-foreground" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-foreground" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-foreground" {...props} />
                    ),
                  }}
                >
                  {selectedPage.content}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
