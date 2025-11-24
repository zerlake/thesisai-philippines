import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommandPaletteHintProps {
  isVisible: boolean;
}

export function CommandPaletteHint({ isVisible }: CommandPaletteHintProps) {
  const [showHint, setShowHint] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the hint
    const dismissed = localStorage.getItem('commandPaletteHintDismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
    } else {
      setShowHint(isVisible && !dismissed);
    }
  }, [isVisible]);

  const dismissHint = () => {
    setHasDismissed(true);
    setShowHint(false);
    localStorage.setItem('commandPaletteHintDismissed', 'true');
  };

  if (!showHint || hasDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-[100] max-w-xs p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Command className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Quick Navigation</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Press <kbd className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">Ctrl+K</kbd> to quickly navigate to any tool or document.
            </p>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={dismissHint}
              >
                Got it
              </Button>
              <button 
                onClick={dismissHint}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}