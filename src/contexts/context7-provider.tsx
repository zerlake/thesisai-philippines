"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { generateSecureId } from "@/lib/crypto-utils";

// Type definitions for Context7 (Model Context Protocol) as a documentation/context server
export interface DocumentationEntry {
  id: string;
  title: string;
  content: string;
  url?: string;
  version?: string;
  timestamp: Date;
  type: 'documentation' | 'code-example' | 'api-reference' | 'tutorial';
}

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  port?: number;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastUpdated: Date;
}

interface Context7State {
  documentationCache: Record<string, DocumentationEntry[]>;
  mcpServers: MCPServerConfig[];
  isInitialized: boolean;
  config: {
    autoFetch: boolean;
    cacheExpiry: number; // in minutes
    supportedLibraries: string[];
  };
}

interface Context7Actions {
  // Documentation management
  getDocumentation: (query: string, library?: string) => Promise<DocumentationEntry[]>;
  cacheDocumentation: (query: string, entries: DocumentationEntry[]) => void;
  clearCache: () => void;
  
  // Configuration
  updateConfig: (config: Partial<Context7State['config']>) => void;
  
  // Context injection for AI
  injectContext: (query: string) => Promise<Record<string, any>>;
  
  // MCP Server management
  getMCPServers: () => MCPServerConfig[];
  connectToMCPServer: (serverName: string) => Promise<boolean>;
  disconnectFromMCPServer: (serverName: string) => Promise<boolean>;
  updateMCPServerStatus: (serverName: string, status: MCPServerConfig['status']) => void;
  
  // Get available sample queries
  getAvailableSamples: () => string[];
}

interface Context7ContextType extends Context7State, Context7Actions {}

// Create the context with default values
const Context7Context = createContext<Context7ContextType | undefined>(undefined);

// Main provider component
export function Context7Provider({ 
  children, 
  autoFetch = true,
  cacheExpiry = 30, // 30 minutes
  supportedLibraries = ['react', 'nextjs', 'typescript', 'tailwind', 'shadcn', 'supabase']
}: { 
  children: ReactNode;
  autoFetch?: boolean;
  cacheExpiry?: number;
  supportedLibraries?: string[];
}) {
  const [state, setState] = useState<Context7State>({
    documentationCache: {},
    mcpServers: [
      {
        name: 'composio',
        command: 'npx',
        args: ['-y', 'composio-playground'],
        env: {
          COMPOSIO_API_KEY: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY || 'missing',
          OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'missing'
        },
        status: 'disconnected',
        lastUpdated: new Date(),
      }
    ],
    isInitialized: false,
    config: {
      autoFetch,
      cacheExpiry,
      supportedLibraries,
    },
  });

  // Initialize Context7 on component mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isInitialized: true,
    }));
  }, []);

  const cacheDocumentation = (query: string, entries: DocumentationEntry[]) => {
    setState(prev => ({
      ...prev,
      documentationCache: {
        ...prev.documentationCache,
        [query]: entries.map(entry => ({...entry, timestamp: new Date()}))
      }
    }));
  };

  const clearCache = () => {
    setState(prev => ({
      ...prev,
      documentationCache: {}
    }));
  };

  const updateConfig = (config: Partial<Context7State['config']>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...config,
      },
    }));
  };

  // This would interface with the actual Context7/MCP server
  const getDocumentation = async (query: string, library?: string): Promise<DocumentationEntry[]> => {
    // Check cache first
    const cacheKey = library ? `${query}:${library}` : query;
    const cached = state.documentationCache[cacheKey];
    
    if (cached) {
      const cacheTime = cached[0]?.timestamp.getTime() || 0;
      const expiryTime = state.config.cacheExpiry * 60 * 1000; // Convert to ms
      
      if (Date.now() - cacheTime < expiryTime) {
        return cached;
      }
    }

    try {
      // In a real implementation, this would call the Context7 MCP server
      // For now, we'll simulate by returning relevant documentation based on the query
      const simulatedDocs = await simulateDocumentationFetch(query);
      
      if (simulatedDocs.length > 0) {
        cacheDocumentation(cacheKey, simulatedDocs);
      }
      
      return simulatedDocs;
    } catch (error) {
      console.error("Error fetching documentation from Context7:", error);
      return [];
    }
  };

  // Context injection for AI tools
  const injectContext = async (query: string): Promise<Record<string, any>> => {
    const docs = await getDocumentation(query);
    return {
      query,
      documentation: docs,
      timestamp: new Date().toISOString(),
      source: 'Context7-MCP'
    };
  };

  // Get available sample queries for demonstration
  const getAvailableSamples = (): string[] => {
    return [
      'thesis writing',
      'research methodology',
      'citation formats',
      'react hooks',
      'nextjs api routes',
      'typescript generics',
      'academic writing'
    ];
  };

  // MCP Server management
  const getMCPServers = (): MCPServerConfig[] => {
    return state.mcpServers;
  };

  const connectToMCPServer = async (serverName: string): Promise<boolean> => {
    try {
      // Check if running on the client before accessing browser APIs
      if (typeof window === 'undefined') {
        throw new Error('Cannot connect to MCP server on the server side');
      }

      // Get the auth token from the Supabase session
      const { supabase } = await import('../integrations/supabase/client');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('No valid session found. Please log in.');
      }

      const response = await fetch('/api/composio-mcp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'connect', server: serverName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to connect to ${serverName}: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          mcpServers: prev.mcpServers.map(server => 
            server.name === serverName 
              ? { ...server, status: 'connected', lastUpdated: new Date() } 
              : server
          )
        }));
        return true;
      } else {
        throw new Error(data.error || `Failed to connect to ${serverName}`);
      }
    } catch (error) {
      console.error(`Error connecting to MCP server ${serverName}:`, error);
      setState(prev => ({
        ...prev,
        mcpServers: prev.mcpServers.map(server => 
          server.name === serverName 
            ? { ...server, status: 'error', lastUpdated: new Date() } 
            : server
        )
      }));
      return false;
    }
  };

  const disconnectFromMCPServer = async (serverName: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      mcpServers: prev.mcpServers.map(server => 
        server.name === serverName 
          ? { ...server, status: 'disconnected', lastUpdated: new Date() } 
          : server
      )
    }));
    return true;
  };

  const updateMCPServerStatus = (serverName: string, status: MCPServerConfig['status']) => {
    setState(prev => ({
      ...prev,
      mcpServers: prev.mcpServers.map(server => 
        server.name === serverName 
          ? { ...server, status, lastUpdated: new Date() } 
          : server
      )
    }));
  };

  // Sample documentation data for demonstration
  const sampleDocumentation: Record<string, DocumentationEntry[]> = {
    'thesis writing': [{
      id: 'sample-thesis-1',
      title: "Thesis Writing Best Practices",
      content: `Best practices for academic thesis writing:
1. Start with a clear research question
2. Develop a comprehensive outline before writing
3. Use proper citation formats (APA, MLA, Chicago, etc.)
4. Maintain consistent academic tone throughout
5. Include sufficient literature review
6. Ensure methodology aligns with research objectives
7. Present results objectively and clearly
8. Draw conclusions based on evidence`,
      url: "https://thesisai-philippines.vercel.app/docs/thesis-writing",
      version: "1.0.0",
      timestamp: new Date(),
      type: 'documentation'
    }],
    'research methodology': [{
      id: 'sample-research-1',
      title: "Research Methodology Types",
      content: `Common research methodologies in academic writing:
- Quantitative Research: Collects numerical data for statistical analysis
- Qualitative Research: Explores experiences, behaviors, and phenomena
- Mixed Methods: Combines quantitative and qualitative approaches
- Experimental: Tests cause-and-effect relationships
- Survey Research: Gathers data from respondents
- Case Study: In-depth analysis of specific subjects`,
      url: "https://thesisai-philippines.vercel.app/docs/research-methodology",
      version: "1.0.0",
      timestamp: new Date(),
      type: 'documentation'
    }],
    'citation formats': [{
      id: 'sample-citation-1',
      title: "Citation Format Guidelines",
      content: `Standard citation formats for academic writing:
APA (7th Edition):
- Book: Author, A. A. (Year). Title of work. Publisher.
- Journal: Author, A. A. (Year). Title of article. Title of Periodical, Volume(Issue), pages.

MLA (9th Edition):
- Book: Author Last Name, First Name. Title of Book. Publisher, Year.
- Journal: Author Last Name, First Name. "Title of Source." Title of Container, other contributors, version, number, publisher, publication date, location.

Chicago:
- Notes-Bibliography: Footnotes/endnotes with full bibliographic info
- Author-Date: In-text citations with author-date-page format`,
      url: "https://thesisai-philippines.vercel.app/docs/citation-formats",
      version: "1.0.0",
      timestamp: new Date(),
      type: 'documentation'
    }],
    'react hooks': [{
      id: 'sample-react-1',
      title: "React Hooks Guide",
      content: `Essential React Hooks for development:
- useState: Manage local component state
  Example: const [count, setCount] = useState(0);
  
- useEffect: Handle side effects and lifecycle events
  Example: useEffect(() => { /* cleanup */ }, [deps]);
  
- useContext: Access React context
  Example: const value = useContext(MyContext);
  
- useRef: Access DOM elements or store mutable values
  Example: const inputRef = useRef(null);
  
- useCallback: Memoize functions to prevent unnecessary re-renders
  Example: const memoizedCallback = useCallback(() => {}, [deps]);
  
- useMemo: Memoize expensive calculations
  Example: const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`,
      url: "https://reactjs.org/docs/hooks-reference.html",
      version: "18.2.0",
      timestamp: new Date(),
      type: 'documentation'
    }],
    'nextjs api routes': [{
      id: 'sample-nextjs-api-1',
      title: "Next.js API Routes",
      content: `Next.js API Routes provide a straightforward way to create API endpoints:
- File-based routing: API routes are created in the 'pages/api' directory
- Request/Response: Each file exports a default function accepting req and res parameters
- Dynamic routes: Use [param].js for dynamic routes like /api/users/[id]

Example API route:
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Hello from API!' })
  }
}

Configuring API routes:
export const config = {
  api: {
    responseLimit: '8mb',
  },
}

API routes support:
- CORS configuration
- Body parsing
- Middlewares
- Environment-based configurations`,
      url: "https://nextjs.org/docs/api-routes/introduction",
      version: "14.0.0",
      timestamp: new Date(),
      type: 'documentation'
    }],
    'typescript generics': [{
      id: 'sample-ts-1',
      title: "TypeScript Generics",
      content: `Generics in TypeScript allow creating reusable components:
- Basic syntax: function identity<T>(arg: T): T { return arg; }
- With constraints: function loggingIdentity<T extends Lengthwise>(arg: T): T
- Generic interfaces: interface GenericIdentityFn<T> { (arg: T): T; }
- Generic classes: class GenericNumber<T> { zeroValue: T; add: (x: T, y: T) => T; }

Common generic patterns:
- Generic constraints: T extends SomeType
- Type parameters in generic constraints: Key extends keyof Obj
- Generic parameter defaults: <T = string>
- Generic utility types: Partial<T>, Required<T>, Pick<T, K>, Omit<T, K>

Example usage:
interface Lengthwise { length: number; }
function getProperty<T, K extends keyof T>(obj: T, key: K) { return obj[key]; }`,
      url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      version: "5.0.0",
      timestamp: new Date(),
      type: 'documentation'
    }]
  };

  // Simulate documentation fetching (optimized for performance)
  const simulateDocumentationFetch = async (query: string): Promise<DocumentationEntry[]> => {
    const lowerQuery = query.toLowerCase();
    
    // Quick check for cached results first
    const cachedResult = state.documentationCache[lowerQuery];
    if (cachedResult) {
      return cachedResult;
    }
    
    // Optimized search through sample data with early exit
    for (const [key, entries] of Object.entries(sampleDocumentation)) {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        cacheDocumentation(lowerQuery, entries);
        return entries;
      }
      
      // Check partial matches in key words
      const keyWords = key.split(' ');
      if (keyWords.some(word => lowerQuery.includes(word))) {
        cacheDocumentation(lowerQuery, entries);
        return entries;
      }
    }
    
    // Thematic matches for thesis-related queries
    if (lowerQuery.includes('thesis') || lowerQuery.includes('research') || lowerQuery.includes('writing')) {
      const result = [{
        id: `doc_${Date.now()}_${generateSecureId().substr(0, 9)}`,
        title: "ThesisAI Platform Documentation",
        content: `ThesisAI Philippines provides comprehensive tools for thesis writing including:
- Research question generation
- Literature review assistance
- Citation management
- Plagiarism checking
- Grammar checking
- Outline generation
- Methodology guidance
- Results interpretation
- Formatting tools for various academic styles`,
        url: "https://thesisai-philippines.vercel.app/docs",
        version: "1.0.0",
        timestamp: new Date(),
        type: 'documentation'
      }];
      cacheDocumentation(lowerQuery, result as DocumentationEntry[]);
      return result as DocumentationEntry[];
    }
    
    // Optimized tech stack matching
    if (lowerQuery.includes('react') || lowerQuery.includes('next') || lowerQuery.includes('typescript')) {
      let result: DocumentationEntry[];
      
      if (lowerQuery.includes('hook') || lowerQuery.includes('state') || lowerQuery.includes('effect')) {
        result = sampleDocumentation['react hooks'] || [{
          id: `doc_${Date.now()}_${generateSecureId().substr(0, 9)}`,
          title: "React Hooks Documentation",
          content: "Documentation for React hooks including useState, useEffect, useContext, and other essential hooks for managing component state and side effects.",
          url: "https://reactjs.org/docs/hooks-reference.html",
          version: "18.2.0",
          timestamp: new Date(),
          type: 'documentation'
        }];
      } else if (lowerQuery.includes('api') || lowerQuery.includes('route') || lowerQuery.includes('endpoint')) {
        result = sampleDocumentation['nextjs api routes'] || [{
          id: `doc_${Date.now()}_${generateSecureId().substr(0, 9)}`,
          title: "Next.js API Routes",
          content: "Documentation for creating API endpoints in Next.js applications using file-based routing.",
          url: "https://nextjs.org/docs/api-routes/introduction",
          version: "14.0.0",
          timestamp: new Date(),
          type: 'documentation'
        }];
      } else if (lowerQuery.includes('generic') || lowerQuery.includes('type') || lowerQuery.includes('interface')) {
        result = sampleDocumentation['typescript generics'] || [{
          id: `doc_${Date.now()}_${generateSecureId().substr(0, 9)}`,
          title: "TypeScript Generics",
          content: "Documentation for using generics in TypeScript to create reusable and type-safe components.",
          url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
          version: "5.0.0",
          timestamp: new Date(),
          type: 'documentation'
        }];
      } else {
        result = sampleDocumentation['react hooks'] || [{
          id: `doc_${Date.now()}_${generateSecureId().substr(0, 9)}`,
          title: "React and TypeScript Documentation",
          content: "Documentation for React, Next.js, and TypeScript development practices.",
          url: "https://reactjs.org",
          version: "18.2.0/14.0.0",
          timestamp: new Date(),
          type: 'documentation'
        }];
      }
      
      cacheDocumentation(lowerQuery, result);
      return result;
    }
    
    // Default response with suggestions
    const result = [{
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Documentation for: ${query}`,
      content: `This is simulated documentation for "${query}". In a full implementation, Context7 would fetch real-time documentation from the official sources based on your query and the current project context.

Sample queries you can try:
- "thesis writing"
- "research methodology" 
- "citation formats"
- "react hooks"
- "nextjs api routes"
- "typescript generics"`,
      timestamp: new Date(),
      type: 'documentation'
    }];
    cacheDocumentation(lowerQuery, result as DocumentationEntry[]);
    return result as DocumentationEntry[];
  };

  const value: Context7ContextType = {
    ...state,
    getDocumentation,
    cacheDocumentation,
    clearCache,
    updateConfig,
    injectContext,
    getAvailableSamples,
    getMCPServers,
    connectToMCPServer,
    disconnectFromMCPServer,
    updateMCPServerStatus,
  };

  return (
    <Context7Context.Provider value={value}>
      {children}
    </Context7Context.Provider>
  );
}

// Cleanup function to ensure no memory leaks
export const cleanupContext7 = () => {
  // Any cleanup operations if needed
};

// Custom hook to use Context7
export function useContext7() {
  const context = useContext(Context7Context);
  if (context === undefined) {
    throw new Error("useContext7 must be used within a Context7Provider");
  }
  return context;
}

// Higher-order component for easy integration
export function withContext7<T extends object>(
  Component: React.ComponentType<T>
): React.FC<T> {
  return function WithContext7(props: T) {
    return (
      <Context7Provider>
        <Component {...props} />
      </Context7Provider>
    );
  };
}