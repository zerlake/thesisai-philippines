import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { callPuterAI } from '../puter-ai-wrapper';

const autocompletePluginKey = new PluginKey('autocomplete');

// Define the AutocompleteOptions interface
interface AutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  maxSuggestions?: number;
  enabled?: boolean;
}

// Define the state for autocomplete
interface AutocompleteState {
  isActive: boolean;
  suggestions: string[];
  currentIndex: number;
  currentInput: string;
  position: { top: number; left: number } | null;
}

// Define the AutocompleteStorage interface
interface AutocompleteStorage {
  state: AutocompleteState;
  getSuggestions: (userInput: string, documentContext: string) => Promise<string[]>;
}

// Create the autocomplete extension
export const Autocomplete = Extension.create<AutocompleteOptions, AutocompleteStorage>({
  name: 'autocomplete',

  addOptions() {
    return {
      debounceMs: 500,
      minChars: 3,
      maxSuggestions: 3,
      enabled: true,
    };
  },

  addProseMirrorPlugins() {
    const { debounceMs, minChars = 3, maxSuggestions, enabled } = this.options; // Provide a default value
    const getSuggestions = this.storage.getSuggestions;

    if (!enabled) {
      return [];
    }

    return [
      new Plugin({
        key: new PluginKey('autocomplete'),
        state: {
          init() {
            return {
              timeoutId: null as NodeJS.Timeout | null,
              isActive: false,
              suggestions: [],
              currentIndex: 0,
              currentInput: '',
              position: null,
            };
          },
          apply(tr, pluginState, oldState, newState) {
            // Check if the transaction has any input or deletion
            if (tr.docChanged) {
              if (pluginState.timeoutId) {
                clearTimeout(pluginState.timeoutId);
              }

              // Set a timeout to trigger autocomplete after user stops typing
              const timeoutId = setTimeout(async () => {
                const { selection, doc } = tr;
                const { from } = selection;

                // Get the current text from the beginning to the cursor position
                const textBeforeCursor = doc.textBetween(Math.max(0, from - minChars - 50), from, ' ');

                // Check if we have enough characters and the last character is not a punctuation
                const lastChar = textBeforeCursor.slice(-1);
                if (textBeforeCursor.length >= minChars && !['.', '!', '?', ':', ';'].includes(lastChar)) {
                  // Extract the current user input (last few words)
                  const words = textBeforeCursor.split(/\s+/);
                  const userInput = words.slice(-3).join(' ').trim(); // Get last 3 words

                  if (userInput.length >= minChars) {
                    try {
                      // Call Puter AI to get suggestions
                      const suggestions = await getSuggestions(userInput, doc.textContent);

                      if (suggestions && suggestions.length > 0) {
                        // Update the plugin state with suggestions
                        const newPluginState = {
                          ...pluginState,
                          isActive: true,
                          suggestions,
                          currentIndex: 0,
                          currentInput: userInput,
                          position: { top: 0, left: 0 }, // Position will be calculated by the UI component
                        };

                        // Dispatch transaction to update state
                        tr.getMeta('autocomplete') ? tr.setMeta('autocomplete', newPluginState) : tr.setMeta('autocomplete', newPluginState);
                      }
                    } catch (error) {
                      console.error('Error getting autocomplete suggestions:', error);
                      // Reset state on error
                      tr.setMeta('autocomplete', {
                        ...pluginState,
                        isActive: false,
                        suggestions: [],
                        currentIndex: 0,
                        currentInput: '',
                        position: null,
                      });
                    }
                  }
                }
              }, debounceMs);

              return { ...pluginState, timeoutId };
            }

            return pluginState;
          },
        },
        props: {
          handleKeyDown(view, event) {
            const pluginState = view.state.plugins
              .find(p => p.spec.key === autocompletePluginKey)?.getState(view.state);

            if (!pluginState?.isActive) return false;

            if (event.key === 'ArrowDown') {
              event.preventDefault();

              const newState = {
                ...pluginState,
                currentIndex: Math.min(pluginState.suggestions.length - 1, pluginState.currentIndex + 1),
              };

              view.dispatch(
                view.state.tr.setMeta('autocomplete', newState)
              );

              return true;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();

              const newState = {
                ...pluginState,
                currentIndex: Math.max(0, pluginState.currentIndex - 1),
              };

              view.dispatch(
                view.state.tr.setMeta('autocomplete', newState)
              );

              return true;
            }

            if (event.key === 'Tab' || event.key === 'Enter') {
              event.preventDefault();

              const suggestion = pluginState.suggestions[pluginState.currentIndex];
              if (suggestion) {
                const { selection } = view.state;
                const { from, to } = selection;

                // Insert the suggestion
                const transaction = view.state.tr.insertText(suggestion, from, to);

                // Reset autocomplete state
                const newState = {
                  timeoutId: null,
                  isActive: false,
                  suggestions: [],
                  currentIndex: 0,
                  currentInput: '',
                  position: null,
                };

                view.dispatch(
                  transaction.setMeta('autocomplete', newState)
                );
              }

              return true;
            }

            if (event.key === 'Escape') {
              event.preventDefault();

              // Reset autocomplete state
              const newState = {
                timeoutId: null,
                isActive: false,
                suggestions: [],
                currentIndex: 0,
                currentInput: '',
                position: null,
              };

              view.dispatch(
                view.state.tr.setMeta('autocomplete', newState)
              );

              return true;
            }

            return false;
          },
        },
      }),
    ];
  },

  onTransaction() {
    // Store the autocomplete state in editor storage so it can be accessed by other parts of the editor
    // Use 'any' as a workaround for TypeScript's type inference issues with Tiptap storage
    const editorStorage: any = this.editor.storage;
    const pluginState = editorStorage.autocomplete?.state; // Access with optional chaining

    if (pluginState) {
      editorStorage.autocomplete = {
        ...editorStorage.autocomplete,
        state: pluginState,
      };
    }
  },

  addStorage() {
    return {
      state: {
        isActive: false,
        suggestions: [],
        currentIndex: 0,
        currentInput: '',
        position: null,
      },
      // Method to get suggestions from Puter AI
      getSuggestions: async (userInput: string, documentContext: string) => {
        if (!userInput.trim()) return [];

        try {
          const prompt = `You are an academic writing assistant helping with thesis composition.
          Continue the following text in an academic context: "${userInput}"

          Document context: ${documentContext.substring(0, 1000)}...

          Provide 3 different continuation options that are academically appropriate and contextually relevant.
          Each option should be 10-30 words long.
          Return only the suggestions as a JSON array of strings.
          Do not include any other text.`;

          const response = await callPuterAI(prompt, {
            temperature: 0.7,
            max_tokens: 300
          });

          // Parse the response as JSON
          let suggestions: string[] = [];

          try {
            suggestions = JSON.parse(response);
          } catch {
            // If parsing fails, try to extract suggestions from text
            const suggestionMatches = response.match(/["']([^"']+)["']/g);
            if (suggestionMatches) {
              suggestions = suggestionMatches.map(s => s.replace(/["']/g, '').trim());
            } else {
              // Split by newlines as a fallback
              suggestions = response.split('\n').filter(s => s.trim().length > 0);
            }
          }

          // Filter and limit suggestions
          return suggestions
            .slice(0, this.options.maxSuggestions)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        } catch (error) {
          console.error('Error calling Puter AI for suggestions:', error);
          return [];
        }
      },
    };
  },
});