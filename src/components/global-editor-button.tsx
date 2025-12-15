"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PenTool, X } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function GlobalEditorButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on editor pages or public pages
  const isEditorPage = pathname.includes('/editor');
  const isPublicPage = pathname === '/' || pathname.includes('/papers') || pathname.includes('/landing');

  if (isEditorPage || isPublicPage) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
        title="Open Document Editor"
        aria-label="Open Document Editor"
      >
        <PenTool className="h-6 w-6" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a Chapter to Edit</DialogTitle>
            <DialogDescription>
              Select which chapter you'd like to open in the full-screen editor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 mt-6">
            {[1, 2, 3, 4, 5].map((chapter) => (
              <Link
                key={chapter}
                href={`/thesis-phases/chapter-${chapter}/editor`}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-secondary"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Chapter {chapter} - Text Editor
                </Button>
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              💡 Tip: You can also access the editor from the chapter pages or use Ctrl+K to open the command palette.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
