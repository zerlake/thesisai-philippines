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
        e.key &&
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