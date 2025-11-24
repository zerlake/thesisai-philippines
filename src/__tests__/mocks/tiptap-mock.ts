import { vi } from 'vitest';

export const createMockEditor = () => {
  return {
    commands: {
      setContent: vi.fn(),
      focus: vi.fn(() => ({
        deleteRange: vi.fn(() => ({
          insertContent: vi.fn(() => ({
            run: vi.fn(),
          })),
        })),
      })),
      insertContent: vi.fn(() => ({
        run: vi.fn(),
      })),
      insertContentAt: vi.fn(() => ({
        run: vi.fn(),
      })),
    },
    isActive: vi.fn(() => false), // Add isActive method
    can: vi.fn(() => ({
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        deleteRange: vi.fn(() => ({
          insertContent: vi.fn(() => ({
            run: vi.fn(),
          })),
        })),
        insertContent: vi.fn(() => ({
          run: vi.fn(),
        })),
        insertContentAt: vi.fn(() => ({
          run: vi.fn(),
        })),
      })),
    })),
    getHTML: vi.fn(() => '<p>test content</p>'),
    state: {
      selection: { from: 0, to: 10 },
      doc: {
        textBetween: vi.fn(() => 'test text'),
      },
    },
  };
};