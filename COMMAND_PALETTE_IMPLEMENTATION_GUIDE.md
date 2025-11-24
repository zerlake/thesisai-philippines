# Command Palette Implementation Guide for ThesisAI

## Overview
This guide provides detailed implementation instructions for adding a command palette feature (Ctrl/Cmd + K) to ThesisAI, following the architecture and best practices outlined in the requirements.

## Why This Matters
- 10x faster navigation for power users
- Reduces clicks from 3-5 to 1-2 keystrokes
- Industry standard (used by VS Code, Linear, Notion)
- Low implementation complexity, high user satisfaction

## Technical Architecture

### Component Structure
```
src/
├── components/
│   └── CommandPalette/
│       ├── CommandPalette.tsx          # Main component
│       ├── CommandItem.tsx             # Individual command item
│       ├── CommandGroup.tsx            # Grouped commands
│       ├── useCommandPalette.ts        # Hook for state management
│       └── commands.ts                 # Command registry
├── hooks/
│   └── useKeyboardShortcut.ts          # Global keyboard handler
└── utils/
    └── fuzzySearch.ts                  # Search algorithm
```

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install cmdk framer-motion
# cmdk is the best command palette library (by Vercel)
```

### Step 2: Create Command Registry
```typescript
// src/components/CommandPalette/commands.ts
import { HomeIcon, DocumentIcon, OutlineIcon, SearchIcon, PlusIcon, TimerIcon, FileIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Command {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'tools' | 'documents' | 'actions';
  shortcut?: string;
}

export const commandRegistry: Command[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Go to Dashboard',
    keywords: ['home', 'overview'],
    icon: <HomeIcon />,
    action: () => {
      const router = useRouter();
      router.push('/dashboard');
    },
    category: 'navigation'
  },
  {
    id: 'nav-documents',
    label: 'View All Documents',
    keywords: ['docs', 'files', 'papers'],
    icon: <DocumentIcon />,
    action: () => {
      const router = useRouter();
      router.push('/documents');
    },
    category: 'navigation'
  },
  {
    id: 'nav-settings',
    label: 'Open Settings',
    keywords: ['preferences', 'account', 'profile'],
    icon: <SettingsIcon />,
    action: () => {
      const router = useRouter();
      router.push('/settings');
    },
    category: 'navigation'
  },
  
  // Tools
  {
    id: 'tool-outline',
    label: 'Open Outline Generator',
    description: 'Structure your thesis chapters',
    keywords: ['structure', 'organize', 'chapters'],
    icon: <OutlineIcon />,
    action: () => {
      const router = useRouter();
      router.push('/outline');
    },
    category: 'tools'
  },
  {
    id: 'tool-research',
    label: 'Open Research Helper',
    description: 'Find and evaluate papers',
    keywords: ['papers', 'literature', 'search'],
    icon: <SearchIcon />,
    action: () => {
      const router = useRouter();
      router.push('/research');
    },
    category: 'tools'
  },
  {
    id: 'tool-methodology',
    label: 'Open Methodology Helper',
    description: 'Design your research approach',
    keywords: ['methods', 'research', 'design'],
    icon: <SearchIcon />,
    action: () => {
      const router = useRouter();
      router.push('/methodology');
    },
    category: 'tools'
  },
  {
    id: 'tool-results',
    label: 'Open Results Helper',
    description: 'Present your research findings',
    keywords: ['findings', 'data', 'analysis'],
    icon: <SearchIcon />,
    action: () => {
      const router = useRouter();
      router.push('/results');
    },
    category: 'tools'
  },
  {
    id: 'tool-conclusion',
    label: 'Open Conclusion Helper',
    description: 'Summarize your work',
    keywords: ['summary', 'end', 'wrap'],
    icon: <SearchIcon />,
    action: () => {
      const router = useRouter();
      router.push('/conclusion');
    },
    category: 'tools'
  },
  {
    id: 'tool-topic-ideas',
    label: 'Open Topic Idea Generator',
    description: 'Brainstorm your research topic',
    keywords: ['ideas', 'brainstorm', 'topics'],
    icon: <LightbulbIcon />,
    action: () => {
      const router = useRouter();
      router.push('/topic-ideas');
    },
    category: 'tools'
  },
  
  // Quick Actions
  {
    id: 'action-new-doc',
    label: 'Create New Document',
    keywords: ['new', 'write', 'start'],
    icon: <PlusIcon />,
    action: () => {
      const router = useRouter();
      router.push('/drafts');
    },
    category: 'actions',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'action-session',
    label: 'Start 15-Min Writing Session',
    keywords: ['timer', 'focus', 'pomodoro'],
    icon: <TimerIcon />,
    action: () => {
      // Assuming there's a focus mode context
      // startFocusSession();
    },
    category: 'actions'
  }
];

// Dynamic commands from user data
export const getDynamicCommands = (documents: Document[]): Command[] => {
  return documents.slice(0, 10).map(doc => ({
    id: `doc-${doc.id}`,
    label: doc.title || "Untitled Document",
    description: `${doc.wordCount || 0} words • ${new Date(doc.updated_at || '').toLocaleDateString()}`,
    icon: <FileIcon />,
    action: () => {
      const router = useRouter();
      router.push(`/drafts/${doc.id}`);
    },
    category: 'documents',
    keywords: [doc.title?.toLowerCase() || '', 'document', 'open']
  }));
};
```

### Step 3: Build Command Palette Component
```typescript
// src/components/CommandPalette/CommandPalette.tsx
import { Command } from 'cmdk';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { commandRegistry, getDynamicCommands, type Command } from './commands';
import { Document } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const [search, setSearch] = useState('');
  const { supabase, session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  // Fetch documents for dynamic commands
  useEffect(() => {
    if (!session?.user.id || !open) return;
    
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching documents:', error);
      } else if (data) {
        setDocuments(data as Document[]);
      }
    };

    fetchDocuments();
  }, [session, open, supabase]);

  // Combine static and dynamic commands
  const allCommands = useMemo(() => {
    return [
      ...commandRegistry,
      ...getDynamicCommands(documents)
    ];
  }, [documents]);

  // Filter by search
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;
    
    const searchLower = search.toLowerCase();
    return allCommands.filter(cmd => {
      return (
        cmd.label.toLowerCase().includes(searchLower) ||
        (cmd.description && cmd.description.toLowerCase().includes(searchLower)) ||
        (cmd.keywords?.some(k => k.includes(searchLower)))
      );
    });
  }, [allCommands, search]);

  // Group by category
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  const handleSelect = (command: Command) => {
    command.action();
    onOpenChange(false);
    setSearch('');
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={onOpenChange}
          label="Command Menu"
          className="fixed top-20 left-1/2 w-full max-w-lg -translate-x-1/2 rounded-lg border bg-popover p-0 shadow-md outline-none animate-in fade-in-0 zoom-in-90"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="w-full border-0 px-4 py-3 text-sm focus:ring-0"
            />
            
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm">
                No results found.
              </Command.Empty>

              {Object.entries(groupedCommands).map(([category, commands]) => (
                <Command.Group 
                  key={category} 
                  heading={formatCategory(category)}
                  className="px-2"
                >
                  {commands.map(cmd => (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleSelect(cmd)}
                      className="flex items-center gap-3 rounded-sm px-2 py-3 text-sm data-[disabled]:opacity-50 data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                        <span className="text-xs">{cmd.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="ml-auto text-xs text-muted-foreground">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
```

### Step 4: Global Keyboard Hook
```typescript
// src/hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { ctrl, meta, shift, alt } = options;
      
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        (!ctrl || e.ctrlKey) &&
        (!meta || e.metaKey) &&
        (!shift || e.shiftKey) &&
        (!alt || e.altKey)
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}
```

### Step 5: Integration in Root Layout
```typescript
// Integrate in your main layout component (e.g., src/app/layout.tsx or src/app/(app)/layout.tsx)
import { useState, useEffect } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [commandOpen, setCommandOpen] = useState(false);

  useKeyboardShortcut('k', () => setCommandOpen(true), { 
    ctrl: true, 
    meta: true // Cmd on Mac, Ctrl on Windows
  });

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {children}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
```

### Step 6: Styling
Add to your global CSS or Tailwind config:
```css
/* If using global CSS, add to globals.css */
.command-palette {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 640px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  overflow: hidden;
}

.command-input {
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  font-size: 16px;
  outline: none;
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.command-item[aria-selected="true"] {
  background: #f3f4f6;
}

.command-item-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.command-item-content {
  flex: 1;
}

.command-item-label {
  font-weight: 500;
  color: #111827;
}

.command-item-description {
  font-size: 13px;
  color: #6b7280;
}

.command-shortcut {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}
```

### Step 7: Testing
```typescript
// src/components/CommandPalette/CommandPalette.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(<CommandPalette open={true} onOpenChange={() => {}} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
  });

  it('filters commands', () => {
    render(<CommandPalette open={true} onOpenChange={() => {}} />);
    
    const input = screen.getByPlaceholderText('Type a command or search...');
    fireEvent.change(input, { target: { value: 'dashboard' } });
    
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });
});
```

## Additional Considerations

### Performance
- Use memoization to prevent unnecessary re-renders
- Implement debouncing for search input
- Limit the number of dynamic commands shown

### Accessibility
- Ensure proper ARIA attributes
- Keyboard navigation support (arrow keys, enter)
- Screen reader compatibility

### Future Enhancements
- Category-based filtering
- Recently used commands
- User-specific personalized commands
- Integration with AI suggestions

## Deployment Steps
1. Add the necessary dependencies: `npm install cmdk framer-motion`
2. Create the command palette components in `src/components/CommandPalette`
3. Add the keyboard hook to `src/hooks/useKeyboardShortcut.ts`
4. Integrate the command palette in your root layout
5. Test keyboard shortcuts and functionality
6. Deploy and monitor usage metrics

This implementation follows the architecture specified in the requirements and provides a solid foundation for a command palette feature with room for future enhancements.