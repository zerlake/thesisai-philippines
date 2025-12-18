export type ErrorType =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'rate-limit'
  | 'api-error'
  | 'validation'
  | 'fallback'
  | 'unknown';

export interface RecoveryContext {
  tool: string;
  operation: 'generate' | 'analyze' | 'transform';
  userContext?: Record<string, any>;
  previousAttempts?: number;
  lastError?: Error;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'manual' | 'skip';
  action: 'wait-and-retry' | 'use-mock' | 'show-error' | 'skip-step';
  delay?: number;
  maxAttempts?: number;
  message: string;
}

export interface ErrorPattern {
  errorType: ErrorType;
  frequency: number;
  lastOccurrence: Date;
  recoverySuccessRate: number;
}

export interface AlternativeApproach {
  description: string;
  action: string;
}

export class AdvancedRecoveryEngine {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryHistory: Array<{
    error: Error;
    strategy: RecoveryStrategy;
    success: boolean;
    timestamp: Date;
  }> = [];

  /**
   * Identify error type and generate recovery strategy
   */
  async handleError(
    error: Error,
    context: RecoveryContext
  ): Promise<RecoveryStrategy> {
    const errorType = this.classifyError(error);
    this.recordErrorPattern(errorType);

    const strategy = this.selectRecoveryStrategy(
      errorType,
      error,
      context
    );

    return strategy;
  }

  /**
   * Classify error into known types
   */
  classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('net::')
    ) {
      return 'network';
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return 'auth';
    }

    if (message.includes('429') || message.includes('rate limit')) {
      return 'rate-limit';
    }

    if (message.includes('timeout')) {
      return 'timeout';
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }

    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'api-error';
    }

    return 'unknown';
  }

  /**
   * Select recovery strategy based on error type and context
   */
  private selectRecoveryStrategy(
    errorType: ErrorType,
    error: Error,
    context: RecoveryContext
  ): RecoveryStrategy {
    const attempts = context.previousAttempts ?? 0;

    switch (errorType) {
      case 'network':
        if (attempts < 2) {
          return {
            type: 'retry',
            action: 'wait-and-retry',
            delay: 1000 * Math.pow(2, attempts),
            maxAttempts: 3,
            message: 'Network connection issue. Retrying...'
          };
        }
        return {
          type: 'fallback',
          action: 'use-mock',
          message: 'Using offline data. Please check your connection.'
        };

      case 'timeout':
        return {
          type: 'retry',
          action: 'wait-and-retry',
          delay: 2000,
          maxAttempts: 2,
          message: 'Request timed out. Retrying with extended timeout...'
        };

      case 'rate-limit':
        return {
          type: 'retry',
          action: 'wait-and-retry',
          delay: 5000,
          maxAttempts: 1,
          message: 'Rate limited. Waiting before retry...'
        };

      case 'auth':
        return {
          type: 'manual',
          action: 'show-error',
          message: 'Authentication required. Please sign in again.'
        };

      case 'validation':
        return {
          type: 'skip',
          action: 'skip-step',
          message: 'Invalid input. Skipping this step.'
        };

      case 'api-error':
        return {
          type: 'fallback',
          action: 'use-mock',
          message: 'Service temporarily unavailable. Using cached data.'
        };

      default:
        return {
          type: 'manual',
          action: 'show-error',
          message: `An unexpected error occurred: ${error.message}`
        };
    }
  }

  /**
   * Execute recovery strategy
   */
  async executeFallback<T>(
    strategy: RecoveryStrategy,
    fallbackFn?: () => Promise<T>
  ): Promise<T | null> {
    switch (strategy.action) {
      case 'wait-and-retry':
        // Let caller handle retry
        return null;

      case 'use-mock':
        if (fallbackFn) {
          return fallbackFn();
        }
        return null;

      case 'show-error':
        // Let caller display error
        return null;

      case 'skip-step':
        return null;

      default:
        return null;
    }
  }

  /**
   * Suggest alternatives for failed operation
   */
  async suggestAlternatives(error: Error): Promise<AlternativeApproach[]> {
    const errorType = this.classifyError(error);

    const alternatives: Record<ErrorType, AlternativeApproach[]> = {
      network: [
        {
          description: 'Check internet connection',
          action: 'verify-connectivity'
        },
        {
          description: 'Try a different network',
          action: 'switch-network'
        },
        {
          description: 'Use cached data',
          action: 'use-cache'
        }
      ],
      timeout: [
        {
          description: 'Try again with simpler input',
          action: 'simplify-input'
        },
        {
          description: 'Request shorter response',
          action: 'reduce-output-size'
        }
      ],
      'rate-limit': [
        {
          description: 'Wait a few minutes before trying again',
          action: 'wait'
        },
        {
          description: 'Try a different tool',
          action: 'switch-tool'
        }
      ],
      auth: [
        {
          description: 'Sign in to your account',
          action: 'sign-in'
        },
        {
          description: 'Create a new account',
          action: 'create-account'
        }
      ],
      'api-error': [
        {
          description: 'Try again in a few moments',
          action: 'retry-later'
        },
        {
          description: 'Check service status',
          action: 'check-status'
        }
      ],
      validation: [
        {
          description: 'Review and fix input errors',
          action: 'fix-input'
        }
      ],
      fallback: [
        {
          description: 'Contact support',
          action: 'contact-support'
        }
      ],
      unknown: [
        {
          description: 'Try again',
          action: 'retry'
        }
      ]
    };

    return alternatives[errorType] || alternatives.unknown;
  }

  /**
   * Record error pattern for analytics
   */
  private recordErrorPattern(errorType: ErrorType): void {
    const key = errorType;
    const current = this.errorPatterns.get(key) || {
      errorType,
      frequency: 0,
      lastOccurrence: new Date(),
      recoverySuccessRate: 0
    };

    current.frequency++;
    current.lastOccurrence = new Date();

    this.errorPatterns.set(key, current);
  }

  /**
   * Record recovery attempt result
   */
  recordRecoveryResult(
    error: Error,
    strategy: RecoveryStrategy,
    success: boolean
  ): void {
    this.recoveryHistory.push({
      error,
      strategy,
      success,
      timestamp: new Date()
    });

    // Update success rate
    const errorType = this.classifyError(error);
    const pattern = this.errorPatterns.get(errorType);
    if (pattern) {
      const successes = this.recoveryHistory.filter(
        r => r.success && this.classifyError(r.error) === errorType
      ).length;
      pattern.recoverySuccessRate =
        successes / this.recoveryHistory.length;
    }
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    return {
      totalErrors: this.recoveryHistory.length,
      byType: Object.fromEntries(this.errorPatterns),
      successRate:
        this.recoveryHistory.filter(r => r.success).length /
        (this.recoveryHistory.length || 1),
      recentErrors: this.recoveryHistory.slice(-10)
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.recoveryHistory = [];
    this.errorPatterns.clear();
  }

  /**
   * Get error patterns
   */
  getErrorPatterns(): Map<string, ErrorPattern> {
    return new Map(this.errorPatterns);
  }
}

export const advancedRecoveryEngine = new AdvancedRecoveryEngine();
