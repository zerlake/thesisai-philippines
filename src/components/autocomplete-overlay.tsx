import React, { useState, useEffect, useCallback } from 'react';

interface AutocompleteOverlayProps {
  editor: any; // The Tiptap editor instance
}

const AutocompleteOverlay: React.FC<AutocompleteOverlayProps> = ({ editor }) => {
  const [state, setState] = useState({
    isActive: false,
    suggestions: [] as string[],
    currentIndex: 0,
    position: { top: 0, left: 0 },
    currentInput: '',
  });

  // Update state when editor changes
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      // Access the autocomplete plugin state
      const autocompletePlugin = editor.storage.autocomplete;
      if (autocompletePlugin) {
        const pluginState = editor.view.state.plugins
          .find((p: any) => p.spec.key?.key === 'autocomplete')
          ?.getState(editor.view.state);

        if (pluginState) {
          setState({
            isActive: pluginState.isActive,
            suggestions: pluginState.suggestions || [],
            currentIndex: pluginState.currentIndex || 0,
            position: pluginState.position || { top: 0, left: 0 },
            currentInput: pluginState.currentInput || '',
          });
        }
      }
    };

    // Initial state update
    updateState();

    // Subscribe to editor updates
    try {
      const unsubscribe = editor.on('transaction', updateState);

      // Clean up subscription
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.warn('Failed to subscribe to editor updates:', error);
      return undefined;
    }
  }, [editor]);

  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback((suggestion: string) => {
    if (editor && suggestion) {
      // Use the editor's built-in commands to handle the suggestion
      editor.commands.insertContent(suggestion);
    }
  }, [editor]);

  // Handle dismissing the suggestions
  const handleDismiss = useCallback(() => {
    if (editor) {
      // Reset autocomplete state
      const newState = {
        timeoutId: null,
        isActive: false,
        suggestions: [],
        currentIndex: 0,
        currentInput: '',
        position: null,
      };

      editor.view.dispatch(
        editor.state.tr.setMeta('autocomplete', newState)
      );
    }
  }, [editor]);

  // Don't render if not active or no suggestions
  if (!state.isActive || !state.suggestions.length) {
    return null;
  }

  return (
    <div
      className="absolute z-50 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden min-w-[300px]"
      style={{
        top: state.position.top,
        left: state.position.left,
        transform: 'translateY(4px)', // Add slight offset below cursor
      }}
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        {state.suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`px-4 py-2 cursor-pointer transition-colors ${
              index === state.currentIndex
                ? 'bg-blue-100 dark:bg-blue-900/50'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onMouseDown={() => handleAcceptSuggestion(suggestion)}
          >
            <div className="text-sm text-gray-800 dark:text-gray-200">
              {suggestion}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <span>Use ↑↓ to navigate, Tab/Enter to accept</span>
        <button
          onClick={handleDismiss}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Esc to dismiss
        </button>
      </div>
    </div>
  );
};

export default AutocompleteOverlay;