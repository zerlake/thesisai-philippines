import { Command } from 'cmdk';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { commandRegistry, getDynamicCommands } from './commands';
import { Document } from '@/types/document';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const [search, setSearch] = useState('');
  const { session, supabase } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted to true on client side to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch documents for dynamic commands
  useEffect(() => {
    if (!session?.user.id || !open || !isMounted) return;
    
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
  }, [session, open, supabase, isMounted]);

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
    }, {} as Record<string, any>);
  }, [filteredCommands]);

  const router = useRouter();
  
  const handleSelect = (command: any) => {
    const path = command.action();
    router.push(path);
    onOpenChange(false);
    setSearch('');
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={onOpenChange}
          label="Command Menu"
          className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-popover p-0 shadow-lg outline-none animate-in fade-in-0 zoom-in-90"
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
                  {commands.map((cmd: any) => (
                    <Command.Item
                      key={cmd.id}
                      onSelect={() => handleSelect(cmd)}
                      className="flex items-center gap-3 rounded-sm px-2 py-3 text-sm data-[disabled]:opacity-50 data-[selected]:bg-accent data-[selected]:text-accent-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                        {cmd.icon}
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
            
            <div className="border-t p-2 text-center text-xs text-muted-foreground">
              Press ESC to close • Use ↑↓ to navigate
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}