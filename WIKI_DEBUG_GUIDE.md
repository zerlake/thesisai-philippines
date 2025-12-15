# Wiki Integration - Debugging Guide

## Problem: "All folders are still empty"

If you see the wiki sidebar but no pages appear, follow this debugging guide.

---

## Step 1: Verify Wiki Files Exist

### Check wiki directory
```bash
# Windows PowerShell
dir docs\wiki\

# Should output:
# Architecture-Overview.md
# Code-Standards.md
# Getting-Started.md
# Home.md
# INDEX.md
```

### If directory is empty
Create test files:
```bash
echo "# Home" > docs/wiki/Home.md
echo "# Getting Started" > docs/wiki/Getting-Started.md
```

---

## Step 2: Test the API Directly

### Option 1: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste and run:
```javascript
fetch('/api/wiki')
  .then(r => r.json())
  .then(d => console.log('Wiki pages:', d))
```

Expected output:
```json
{
  "pages": [
    { "title": "Home", "slug": "Home", "description": "..." },
    { "title": "Getting Started", "slug": "Getting-Started", "description": "..." }
  ],
  "count": 2
}
```

### Option 2: Browser URL Bar
1. Navigate to: `http://localhost:3000/api/wiki`
2. Should show JSON response with pages array

### Option 3: cURL
```bash
curl http://localhost:3000/api/wiki
```

### If API returns empty array
- Check wiki files exist in `/docs/wiki/`
- Restart dev server: `pnpm dev`
- Check server console for error messages

---

## Step 3: Check Browser Console

While on the wiki page (`/admin/wiki`):

1. **Open DevTools**: F12
2. **Go to Console tab**
3. Look for messages like:
   ```
   Fetching wiki pages from /api/wiki...
   Response status: 200
   Wiki pages data: { pages: [...], count: 2 }
   Setting pages: [...]
   ```

### Common Console Errors

**Error: "Failed to fetch"**
- Server not running
- CORS issue
- Wrong API path

**Error: "Cannot read property 'pages' of undefined"**
- API response doesn't have `pages` field
- Check `/api/wiki` endpoint

**No log messages at all**
- Component not rendering
- JavaScript errors elsewhere
- Check for other errors in console

---

## Step 4: Check Network Requests

1. **Open DevTools**: F12
2. **Go to Network tab**
3. **Look for request to `/api/wiki`**

### Check the request:
- **Status**: Should be `200` (success)
- **Type**: `fetch` or `xhr`
- **Response**: Should contain JSON with pages array

### If request fails:
- Check server console for errors
- Verify dev server is running
- Check file permissions
- Restart dev server

---

## Step 5: Run the Test Script

```bash
node test-wiki-api.js
```

This will:
- Verify wiki directory exists
- List all markdown files
- Extract titles and descriptions
- Show if setup is correct

### Expected output:
```
🔍 Testing Wiki Setup

Wiki directory: /path/to/docs/wiki
Exists: ✅ Yes

📂 Scanning wiki directory...

Found 5 files, 5 are markdown:

  📄 Home.md
     Slug: Home
     Title: Home
     Description: Central knowledge base...
```

---

## Step 6: Check Server Logs

While the dev server is running:

1. **Look at terminal where you ran `pnpm dev`**
2. **Watch for messages like:**
   ```
   Wiki directory: /path/to/docs/wiki
   Files found: ['Home.md', 'Getting-Started.md', ...]
   MD files: ['Home.md', 'Getting-Started.md', ...]
   Processed Home.md: { title: 'Home', ... }
   Final pages: [...]
   ```

3. **If you see errors:**
   - ENOENT: File/directory not found
   - EACCES: Permission denied
   - Other: File system error

---

## Step 7: Verify Component Rendering

Check in browser console:
```javascript
// Should show component is mounted
console.log('WikiViewer mounted')

// Should see state updates
console.log('Pages state:', pages)
console.log('Is loading:', isLoadingPages)
```

---

## Common Solutions

### Pages appear but search doesn't work
- Wait for pages to load completely
- Check that pages have titles and descriptions
- Try exact match search

### Content doesn't render when page is selected
- Check markdown syntax in wiki files
- Verify file has content
- Check ReactMarkdown is rendering

### API responds but empty array
```
Solution:
1. Check wiki files exist: ls docs/wiki/
2. Verify file permissions
3. Restart dev server
4. Check for error messages in server logs
```

### "Wiki directory not found" error
```
Solution:
1. Create docs/wiki/ directory: mkdir -p docs/wiki
2. Add test file: echo "# Home" > docs/wiki/Home.md
3. Restart dev server
```

### Component shows "No pages loaded"
```
Solution:
1. Open browser console (F12)
2. Look for fetch error messages
3. Check /api/wiki endpoint directly
4. Verify server is running
```

---

## Manual Test Checklist

- [ ] Wiki files exist in `/docs/wiki/`
- [ ] Can access `/api/wiki` in browser
- [ ] API returns JSON with pages array
- [ ] Browser console shows fetch success
- [ ] Pages appear in sidebar
- [ ] Can click a page
- [ ] Content loads and renders
- [ ] Search filters pages
- [ ] No red errors in console

---

## Detailed API Debug

### Test Endpoint: `/api/wiki`

Expected behavior:
1. Read `/docs/wiki/` directory
2. Find all `.md` files
3. Extract metadata (title, description)
4. Return JSON array

Check with:
```bash
# In Node.js or browser console
const response = await fetch('/api/wiki');
const data = await response.json();
console.log('Full response:', data);
console.log('Pages array:', data.pages);
console.log('Page count:', data.count);
console.log('First page:', data.pages[0]);
```

Expected structure:
```json
{
  "pages": [
    {
      "title": "string",      // From # heading
      "slug": "string",       // Filename without .md
      "description": "string" // From first paragraph
    }
  ],
  "count": number
}
```

---

## Reset to Clean State

If still having issues:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart dev server
pnpm dev

# 4. Hard refresh browser
# Windows/Linux: Ctrl+Shift+R
# Mac: Cmd+Shift+R

# 5. Open DevTools and check console
# F12 -> Console tab
```

---

## Enable Full Debug Mode

Add this to your browser console and reload:

```javascript
// Enable verbose logging
localStorage.debug = 'wiki:*';

// Reload page
location.reload();

// Watch network tab for all requests
```

---

## If Still Not Working

### Information to provide:

1. **Output of**: `node test-wiki-api.js`
2. **Browser console messages**: Copy all wiki-related messages
3. **Server console output**: Paste last 20 lines from `pnpm dev` terminal
4. **API response**: From `http://localhost:3000/api/wiki`
5. **File listing**: Output of `ls -la docs/wiki/`

### Check the files:

```bash
# Verify component exists
ls -la src/components/admin/wiki-viewer.tsx

# Verify API endpoints exist
ls -la src/app/api/wiki/

# Verify wiki files exist
ls -la docs/wiki/
```

---

## Success Indicators

✅ **You'll know it's working when:**

1. Browser console shows:
   ```
   Fetching wiki pages from /api/wiki...
   Response status: 200
   Wiki pages data: { pages: [...], count: 5 }
   ```

2. Sidebar shows list of pages

3. Clicking a page loads content

4. Search filters pages

5. No red errors in console

---

## Quick Fixes

```bash
# Fix 1: Restart dev server
pnpm dev

# Fix 2: Clear cache and restart
rm -rf .next && pnpm dev

# Fix 3: Verify setup
node test-wiki-api.js

# Fix 4: Test API directly
curl http://localhost:3000/api/wiki | jq .

# Fix 5: Check file permissions
chmod 644 docs/wiki/*.md
chmod 755 docs/wiki/
```

---

## Still Need Help?

1. **Check logs**: Server console + Browser console
2. **Run test script**: `node test-wiki-api.js`
3. **Verify files**: `ls docs/wiki/`
4. **Test API**: Visit `http://localhost:3000/api/wiki`
5. **Review this guide**: Re-read relevant section
6. **Hard reset**: Delete `.next` folder and restart

---

**Last Updated**: December 2024
