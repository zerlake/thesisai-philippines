import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentHighlightOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentHighlight: {
      setCommentHighlight: (commentId: string) => ReturnType;
      toggleCommentHighlight: (commentId: string) => ReturnType;
      unsetCommentHighlight: () => ReturnType;
    };
  }
}

export const CommentHighlight = Mark.create<CommentHighlightOptions>({
  name: 'commentHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      'data-comment-id': {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes['data-comment-id']) {
            return {};
          }
          return { 'data-comment-id': attributes['data-comment-id'] };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCommentHighlight: (commentId: string) => ({ chain }) => {
        return chain().setMark(this.name, { 'data-comment-id': commentId }).run();
      },
      toggleCommentHighlight: (commentId: string) => ({ chain }) => {
        return chain().toggleMark(this.name, { 'data-comment-id': commentId }).run();
      },
      unsetCommentHighlight: () => ({ chain }) => {
        return chain().unsetMark(this.name).run();
      },
    };
  },
});