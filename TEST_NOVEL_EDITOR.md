# Novel Editor Integration Testing Guide

This guide provides step-by-step instructions to test the full Novel editor integration.

## Prerequisites

1. Supabase project is running locally or connected to a remote instance
2. Pnpm packages installed: `pnpm install`
3. Next.js dev server running: `pnpm dev`
4. Migration applied (see below)

## Step 1: Apply Database Migration

Apply the migration SQL to your Supabase instance:

### Option A: Via Supabase CLI
```bash
supabase migration up
```

### Option B: Via Supabase Dashboard
1. Go to Supabase Dashboard > SQL Editor
2. Copy content from `APPLY_NOVEL_EDITOR_MIGRATION.sql`
3. Run the SQL query
4. Verify tables are created

### Option C: Via Python script
```bash
python check_migrations.py
```

## Step 2: Verify Database Schema

Run these queries in Supabase SQL Editor to confirm tables were created:

```sql
-- Check document_versions table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'document_versions';

-- Check document_comments table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'document_comments';

-- Check documents table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name IN ('content_json', 'last_checkpoint_id', 'is_autosave');

-- List indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('document_versions', 'document_comments');
```

## Step 3: Test Components in Browser

### Test 3.1: Basic Editor Rendering
1. Create a test document via Supabase dashboard or API
2. Navigate to `/editor/[document-id]`
3. Verify:
   - Editor renders without errors
   - Toolbar appears with AI buttons (Intro, Improve, Outline, Summarize, More)
   - Word count is visible
   - Title field is editable

### Test 3.2: Content Editing
1. Type some text in the editor
2. Verify:
   - Text appears in editor
   - Word count updates in real-time
   - No console errors

### Test 3.3: Auto-Save
1. Type some text
2. Wait 2+ seconds
3. Verify:
   - "Saving..." indicator appears briefly
   - Document persists in database
   - Refresh page and content still there

### Test 3.4: Checkpoint Creation
1. Write some content
2. Click "Checkpoint" button
3. Enter checkpoint label: "Draft 1"
4. Click "Create Checkpoint"
5. Verify:
   - Success toast appears
   - Button disabled during creation
   - No console errors

### Test 3.5: View Checkpoints
1. Click "Versions" dropdown
2. Verify:
   - Your checkpoint appears in list with label and date
   - "Restore" button visible

### Test 3.6: Restore Version
1. Add new content to editor
2. Click "Versions" dropdown
3. Click "Restore" on previous checkpoint
4. Verify:
   - Success toast shows
   - Editor content reverts to checkpoint version
   - A new auto-backup created

## Step 4: Test AI Features

### Test 4.1: Generate Introduction
1. Click "Intro" button
2. Verify:
   - Spinner appears
   - "Generating..." message briefly shows
   - Introduction text inserted
   - Success toast appears
   - No errors in console

### Test 4.2: Improve Paragraph
1. Write a paragraph of text
2. Select all the text (Ctrl+A or highlight)
3. Click "Improve" button
4. Verify:
   - Text is improved (grammar, clarity)
   - Original meaning preserved
   - Success toast appears

### Test 4.3: Generate Outline
1. Click "Outline" button (in "More" dropdown)
2. Verify:
   - Outline structure inserted
   - Contains chapter structure
   - Formatted as list

### Test 4.4: Summarize Text
1. Write multiple paragraphs
2. Select some text
3. Click "Summarize" button
4. Verify:
   - Text replaced with 2-3 sentence summary
   - Key information preserved
   - Success message appears

### Test 4.5: Generate Related Work
1. Click "More" dropdown
2. Click "Generate Related Work"
3. Verify:
   - Related work section generated
   - Includes references and frameworks
   - Proper academic structure

### Test 4.6: Generate Conclusion
1. Click "More" dropdown
2. Click "Generate Conclusion"
3. Verify:
   - Conclusion text generated
   - Restates thesis significance
   - Suggests future research

## Step 5: API Testing

### Test 5.1: Save Document API
```bash
curl -X POST http://localhost:3000/api/documents/save \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "YOUR_DOCUMENT_UUID",
    "contentJson": {
      "type": "doc",
      "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Test content"}]}
      ]
    },
    "title": "Test Document",
    "wordCount": 2,
    "createVersion": false
  }'
```

Expected response:
```json
{
  "success": true,
  "document": {
    "id": "YOUR_DOCUMENT_UUID",
    "word_count": 2
  },
  "version": null,
  "message": "Document saved successfully"
}
```

### Test 5.2: Create Checkpoint API
```bash
curl -X POST http://localhost:3000/api/documents/versions/checkpoint \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "YOUR_DOCUMENT_UUID",
    "content": {
      "type": "doc",
      "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Checkpoint content"}]}]
    },
    "title": "Test",
    "checkpointLabel": "Test Checkpoint",
    "wordCount": 2
  }'
```

Expected response:
```json
{
  "success": true,
  "checkpoint": {
    "id": "CHECKPOINT_UUID",
    "version_type": "checkpoint",
    "checkpoint_label": "Test Checkpoint",
    "created_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Checkpoint \"Test Checkpoint\" created successfully"
}
```

### Test 5.3: List Versions API
```bash
curl "http://localhost:3000/api/documents/versions/list?documentId=YOUR_DOCUMENT_UUID&checkpoints=true&limit=20"
```

Expected response:
```json
{
  "success": true,
  "versions": [
    {
      "id": "VERSION_UUID",
      "checkpoint_label": "Test Checkpoint",
      "created_at": "2024-01-01T12:00:00.000Z",
      "word_count": 100
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### Test 5.4: Restore Version API
```bash
curl -X POST http://localhost:3000/api/documents/versions/restore \
  -H "Content-Type: application/json" \
  -d '{
    "versionId": "VERSION_UUID",
    "documentId": "YOUR_DOCUMENT_UUID"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Version \"VERSION_UUID\" restored successfully",
  "document": {
    "id": "YOUR_DOCUMENT_UUID",
    "content": {...},
    "word_count": 100
  }
}
```

## Step 6: Database State Verification

Run these queries to verify data:

```sql
-- Check document has been updated
SELECT id, title, word_count, updated_at, is_autosave 
FROM documents 
WHERE id = 'YOUR_DOCUMENT_UUID';

-- Check versions exist
SELECT id, version_type, checkpoint_label, word_count, created_at 
FROM document_versions 
WHERE document_id = 'YOUR_DOCUMENT_UUID' 
ORDER BY created_at DESC;

-- Check auto-backups created
SELECT version_type, COUNT(*) as count 
FROM document_versions 
WHERE document_id = 'YOUR_DOCUMENT_UUID' 
GROUP BY version_type;
```

## Step 7: Error Handling Tests

### Test 7.1: Unauthorized Access
- Try to access document you don't own via API
- Verify 403 Forbidden error

### Test 7.2: Missing Parameters
- Call save API without documentId
- Verify 400 Bad Request error

### Test 7.3: Invalid Document ID
- Try to edit non-existent document
- Verify 403 or appropriate error

### Test 7.4: Network Failure
- Disconnect internet
- Try to save document
- Reconnect
- Verify document eventually saves or shows error

## Step 8: Performance Testing

### Test 8.1: Large Content
1. Paste large document (50+ KB)
2. Verify:
   - Editor remains responsive
   - Saves complete without timeout

### Test 8.2: Rapid Edits
1. Type rapidly for 10 seconds
2. Verify:
   - Auto-save debounce prevents excessive calls
   - Only saves once after typing stops

### Test 8.3: Many Checkpoints
1. Create 20+ checkpoints
2. Verify:
   - List loads quickly
   - Restore works smoothly

## Step 9: Browser Console Verification

After each test, check browser console for:
- No errors (red X marks)
- No warnings (yellow triangles)
- Expected console.log messages if any

## Troubleshooting

### Editor doesn't load
- Check document exists in database
- Verify authentication token
- Check Supabase connection

### Auto-save not working
- Verify `/api/documents/save` endpoint exists
- Check Supabase RLS policies
- Check network tab in DevTools

### AI features not working
- Verify Puter AI is initialized
- Check temperature/max_tokens in AI commands
- Verify text selection for selection-based commands

### Checkpoints not appearing
- Verify migration ran successfully
- Check RLS policies on document_versions table
- Verify document_id matches

### Performance issues
- Check database indexes are created
- Monitor Supabase query performance
- Consider pagination for large version lists

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Document saves automatically
✅ Checkpoints can be created and restored
✅ All AI features generate appropriate content
✅ APIs return correct response formats
✅ Database contains expected data
✅ RLS prevents unauthorized access

## Next Steps

Once testing is complete:

1. Update existing editor pages to use NovelEditorEnhanced
2. Integrate comments system for advisor feedback
3. Add export to PDF/DOCX functionality
4. Implement collaborative editing with Yjs (optional)
5. Create admin dashboard for user documents
