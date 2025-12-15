# Novel.sh Editor Integration

This document describes the full integration of Novel.sh (Tiptap-based) editor with AI-powered features, document versioning, and checkpoints.

## Overview

The integration replaces the basic Tiptap editor with a sophisticated, AI-enhanced editor featuring:
- Novel.sh/Tiptap-based rich text editing
- AI-powered slash commands and text generation
- Document versioning and checkpoints
- Auto-save with debounce
- Advisor comment system
- IMRaD-compliant structure support

## Architecture

### Core Components

1. **NovelEditor** (`src/components/novel-editor.tsx`)
   - Base editor component with AI toolbar
   - Slash commands for AI features (/generate-intro, /improve, /summarize, etc.)
   - Checkpoint creation dialog
   - Auto-save with debounce
   - Word count tracking

2. **NovelEditorEnhanced** (`src/components/novel-editor-enhanced.tsx`)
   - Wrapper component with document metadata
   - Version management and restore functionality
   - Title editing with auto-save
   - Checkpoint list and restore UI

3. **useDocumentSave Hook** (`src/hooks/use-document-save.ts`)
   - Manages document saving to Supabase
   - Handles version creation
   - Implements checkpoint creation and restoration
   - Provides version listing

### Database Schema

**New Tables:**

1. **document_versions**
   - Stores historical versions of documents
   - Supports auto-saves, manual saves, and named checkpoints
   - Maintains full JSONB content for Tiptap format

2. **document_comments**
   - Stores advisor/critic feedback on specific text ranges
   - Linked to document and position in text
   - Includes resolved/unresolved status

**Modified Tables:**

1. **documents**
   - `content_json`: JSONB field for Tiptap document structure
   - `content`: HTML field for display
   - `last_checkpoint_id`: Reference to last checkpoint version
   - `is_autosave`: Boolean flag for auto-saved versions

### API Routes

1. **POST /api/documents/save**
   - Saves document content to documents table
   - Optionally creates a version record
   - Returns word count and version info

2. **POST /api/documents/versions/checkpoint**
   - Creates a named checkpoint
   - Stores full document state
   - Updates document's last_checkpoint_id

3. **GET /api/documents/versions/list**
   - Lists versions/checkpoints for a document
   - Supports filtering by type
   - Implements pagination

4. **POST /api/documents/versions/restore**
   - Restores a previous version
   - Creates auto-backup of current state
   - Updates document with restored content

## AI Features

### Slash Commands

The NovelEditor includes the following AI-powered commands:

1. **Generate Introduction**
   - Creates a compelling academic introduction
   - 200-300 words
   - Academic tone with problem statement

2. **Improve Paragraph**
   - Selects current paragraph
   - Enhances clarity, grammar, and academic tone
   - Preserves original meaning

3. **Generate Outline**
   - Creates thesis chapter outline
   - IMRaD structure
   - Includes word count estimates

4. **Summarize Selection**
   - Summarizes selected text
   - 2-3 sentences
   - Maintains key information

5. **Generate Related Work**
   - Creates literature review section
   - Discusses key studies and frameworks
   - 300-400 words

6. **Generate Conclusion**
   - Writes comprehensive conclusion
   - Summarizes findings and implications
   - Suggests future research

### Integration with Puter AI

All AI features use the existing `callPuterAI` function from `src/lib/puter-ai-wrapper.ts`:

```typescript
const text = await callPuterAI(prompt, { 
  temperature: 0.7, 
  max_tokens: 500 
});
```

## Usage

### Basic Usage

```tsx
import { NovelEditorEnhanced } from '@/components/novel-editor-enhanced';

export default function MyPage() {
  return (
    <NovelEditorEnhanced
      documentId="some-uuid"
      title="My Document"
      phase="write"
    />
  );
}
```

### Using the Hook Directly

```tsx
import { useDocumentSave } from '@/hooks/use-document-save';

function MyEditor() {
  const { save, createCheckpoint, listVersions, restoreVersion } = useDocumentSave({
    documentId: 'some-uuid',
    debounceDelay: 2000,
  });

  // Save on demand
  await save({
    documentId: 'some-uuid',
    contentJson: editorContent,
    title: 'My Doc',
    wordCount: 1000,
  });

  // Create checkpoint
  await createCheckpoint(content, title, 'Draft Complete');

  // List versions
  const versions = await listVersions(true, 20); // Only checkpoints, limit 20

  // Restore version
  await restoreVersion(versionId);
}
```

## Migration Instructions

### 1. Apply Database Migration

```bash
supabase migration up
```

This creates:
- `document_versions` table
- `document_comments` table
- Indexes for performance
- RLS policies for security

### 2. Install Dependencies

```bash
pnpm install
```

This adds:
- `novel@^4.1.0` - Novel editor package (optional, uses built-in Tiptap)

### 3. Update Editor Pages

Existing editor pages can be updated to use the new NovelEditor:

**Old:**
```tsx
<Editor documentId={documentId} phase="write" />
```

**New:**
```tsx
<NovelEditorEnhanced documentId={documentId} phase="write" />
```

### 4. Access New Editor

New dedicated editor pages are available at:
- `/editor/[documentId]`

Example:
- `/editor/550e8400-e29b-41d4-a716-446655440000`

## Features Walkthrough

### Auto-Save

Documents auto-save every 2 seconds (configurable) as you type. A status indicator shows the last save time.

### Checkpoints

Click "Checkpoint" in the toolbar to save a named version:
1. Enter a checkpoint label (e.g., "Draft of Chapter 1")
2. The current state is saved with metadata
3. Access saved checkpoints from the "Versions" dropdown
4. Click "Restore" to revert to any checkpoint

### AI Assistance

Use the toolbar buttons or type `/` to access AI features:
- **Intro**: Generate introduction section
- **Improve**: Enhance selected paragraph
- **Outline**: Create thesis outline
- **Summarize**: Condense selected text
- **More**: Access additional commands

### Version History

The "Versions" dropdown shows:
- All saved checkpoints
- Creation date for each checkpoint
- Quick restore for any version

## Phase-Specific Behavior

The editor adapts based on the thesis phase:

| Phase | AI Tools | Features |
|-------|----------|----------|
| conceptualize | Limited | Content generation only |
| research | Standard | All tools available |
| write | Standard | All tools available |
| submit | Full | Grammar, summarize, paraphrase |

## Comments System (Future)

The `document_comments` table supports advisor feedback:

```tsx
const comment = {
  documentId: 'uuid',
  userId: 'advisor-uuid',
  positionFrom: 100,
  positionTo: 150,
  text: 'Selected text',
  comment: 'This needs clarification',
};
```

## Performance Optimization

1. **Debounced Auto-Save**: 2-second debounce prevents excessive API calls
2. **Indexing**: Efficient indexes on document_id, user_id, and checkpoint_label
3. **Pagination**: Version lists support pagination (default limit: 50)
4. **JSONB Storage**: Efficient Tiptap JSON storage in Supabase

## Security

- **RLS Policies**: All tables use row-level security
- **User Isolation**: Users can only access their own documents
- **Permission Checks**: API routes verify document ownership
- **Advisor Access**: Comments support role-based access (future)

## Troubleshooting

### Auto-save not working
- Check browser console for errors
- Verify Supabase credentials
- Check network tab in DevTools

### Checkpoints not appearing
- Refresh the page
- Check that RLS policies allow access
- Verify migration ran successfully

### AI commands not working
- Check Puter AI is initialized
- Verify text selection for selection-based commands
- Check temperature/max_tokens parameters

## Example: Full Integration

```tsx
'use client';

import { NovelEditorEnhanced } from '@/components/novel-editor-enhanced';

export default function ThesisEditorPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <h1 className="text-2xl font-bold p-4">Thesis Editor</h1>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <NovelEditorEnhanced
          documentId={documentId}
          title="My Thesis"
          phase="write"
          isReadOnly={false}
          onTitleChange={(title) => console.log('Title changed:', title)}
        />
      </main>
    </div>
  );
}
```

## Next Steps

1. Test editor with sample documents
2. Integrate comments system for advisor feedback
3. Add collaborative editing with Yjs (optional)
4. Implement PDF/DOCX export with content transformation
5. Add citation manager integration
6. Create advisor read-only view with comments panel

## Related Files

- Migration: `supabase/migrations/46_document_versions_and_checkpoints.sql`
- Components: `src/components/novel-editor*.tsx`
- Hooks: `src/hooks/use-document-save.ts`
- API Routes: `src/app/api/documents/versions/*`
- Editor Page: `src/app/editor/[id]/page.tsx`
