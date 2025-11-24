import { useCallback, useRef, useEffect, useState } from "react";

export interface MultimodalInput {
  type: "keyboard" | "voice" | "touch" | "eye-gaze";
  text: string;
  confidence: number;
  timestamp: number;
}

// Type definition for Speech Recognition API
interface SpeechRecognitionAPI extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start(): void;
  abort(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

/**
 * Hook for multi-modal interactions
 * Supports keyboard, voice, touch, and prepares for eye-tracking
 */
export function useMultimodalInput(onCommand: (command: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [lastInput, setLastInput] = useState<MultimodalInput | null>(null);
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);

  /**
   * Process voice commands using intent recognition
   */
  const processVoiceCommand = useCallback(
    (text: string) => {
      const lowerText = text.toLowerCase();

      // Command mappings for voice
      const commands: Record<string, string> = {
        // Research commands
        "outline my thesis": "open-outline-generator",
        "generate outline": "open-outline-generator",
        "help me brainstorm": "open-ai-ideation",
        "find research gaps": "open-gap-identifier",

        // Writing commands
        "paraphrase that": "open-paraphraser",
        "improve my text": "open-grammar",
        "check grammar": "open-grammar",
        "fix my writing": "open-grammar",

        // Citation commands
        "cite that": "open-citation",
        "generate citation": "open-citation",
        "check plagiarism": "open-plagiarism-check",

        // Collaboration commands
        "invite advisor": "open-invite-dialog",
        "share my work": "open-share-dialog",
        "start collaboration": "open-collaboration",

        // Defense commands
        "practice questions": "open-qa-simulator",
        "generate slides": "open-slides-generator",
        "prepare presentation": "open-presentation-prep",

        // Navigation
        "go to research": "nav-research",
        "go to writing": "nav-writing",
        "go to analytics": "nav-analytics",
      };

      // Fuzzy match voice command
      let bestMatch = "";
      let bestScore = 0;

      for (const [command, action] of Object.entries(commands)) {
        const score = calculateSimilarity(lowerText, command);
        if (score > bestScore && score > 0.6) {
          bestScore = score;
          bestMatch = action;
        }
      }

      if (bestMatch) {
        setLastInput({
          type: "voice",
          text: text,
          confidence: bestScore,
          timestamp: Date.now(),
        });
        onCommand(bestMatch);
      }
    },
    [onCommand]
  );

  /**
   * Initialize Web Speech API
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition() as SpeechRecognitionAPI;
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setVoiceText(transcript);
            processVoiceCommand(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [processVoiceCommand]);

  /**
   * Start voice recognition
   */
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, []);

  /**
   * Stop voice recognition
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyboardShortcut = useCallback(
    (event: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + Space for voice input
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        isListening ? stopListening() : startListening();
      }

      // Common shortcuts
      const shortcuts: Record<string, string> = {
        "Ctrl+G": "open-gap-identifier",
        "Ctrl+P": "open-paraphraser",
        "Ctrl+.": "open-grammar",
        "Ctrl+C": "open-citation",
        "Ctrl+?": "open-qa-simulator",
      };

      const key = `${event.ctrlKey ? "Ctrl+" : ""}${event.code}`;
      if (shortcuts[key]) {
        event.preventDefault();
        setLastInput({
          type: "keyboard",
          text: key,
          confidence: 1.0,
          timestamp: Date.now(),
        });
        onCommand(shortcuts[key]);
      }
    },
    [isListening, startListening, stopListening, onCommand]
  );

  /**
   * Handle touch gestures
   */
  const handleTouchGesture = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      const gestureType = detectGesture(event);

      if (gestureType) {
        setLastInput({
          type: "touch",
          text: gestureType,
          confidence: 0.9,
          timestamp: Date.now(),
        });

        // Handle common touch gestures
        const gestures: Record<string, string> = {
          "swipe-left": "nav-next",
          "swipe-right": "nav-previous",
          "long-press": "context-menu",
          "double-tap": "quick-action",
        };

        if (gestures[gestureType]) {
          onCommand(gestures[gestureType]);
        }
      }
    },
    [onCommand]
  );

  /**
   * Prepare for eye-tracking (ready for integration)
   */
  const onGazePoint = useCallback(
    (x: number, y: number, duration: number) => {
      // This will be connected to eye-tracking API
      setLastInput({
        type: "eye-gaze",
        text: `Gazing at (${x}, ${y}) for ${duration}ms`,
        confidence: 0.8,
        timestamp: Date.now(),
      });

      // Trigger actions based on gaze duration
      if (duration > 1000) {
        // User has been looking at something for 1+ second
        const element = document.elementFromPoint(x, y);
        if (element?.hasAttribute("data-eye-action")) {
          onCommand(element.getAttribute("data-eye-action") || "");
        }
      }
    },
    [onCommand]
  );

  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  return {
    isListening,
    voiceText,
    startListening,
    stopListening,
    handleTouchGesture,
    onGazePoint,
    lastInput,
  };
}

/**
 * Calculate similarity between two strings (for fuzzy matching)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function getEditDistance(str1: string, str2: string): number {
  const costs: number[] = [];

  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[str2.length] = lastValue;
    }
  }

  return costs[str2.length];
}

/**
 * Detect touch gestures
 */
function detectGesture(event: React.TouchEvent): string | null {
  // Simplified gesture detection
  // In production, use a gesture library like Hammer.js
  if (event.touches.length === 1) {
    return "single-touch";
  }
  if (event.touches.length === 2) {
    return "pinch"; // Could be zoom
  }
  return null;
}
