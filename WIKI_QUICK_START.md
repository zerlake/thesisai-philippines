# Wiki Integration - Quick Start Guide

## ⚡ Get the Wiki Working in 5 Steps

### Step 1: Start Development Server
```bash
pnpm dev
```
Wait for "Ready in Xms" message

### Step 2: Navigate to Admin
```
http://localhost:3000/admin
```

### Step 3: Click Wiki
- **Option A**: Click the orange "Wiki" card
- **Option B**: Click the "Wiki" tab in the dashboard

### Step 4: You Should See Pages
The sidebar should show:
- Home
- Getting Started
- Architecture Overview
- Code Standards
- Technology Stack

### Step 5: Explore
- Click any page to view content
- Use search to find pages
- Read the documentation

---

## ✅ It's Working If You See...

✅ Pages listed in the sidebar  
✅ Page content displays when clicked  
✅ Search filters pages  
✅ No red errors in browser console  

---

## 🐛 Pages Still Empty? Troubleshoot Here

### Quick Fixes (Try in Order)

#### 1. Hard Refresh Browser
- **Windows/Linux**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R
- Clear cache and reload

#### 2. Check Dev Server is Running
```
Check terminal - should show:
✓ Ready in XXms
```

#### 3. Check Browser Console
- Press F12
- Go to Console tab
- Look for messages about wiki loading
- Check for red error messages

#### 4. Check Network Request
- Press F12
- Go to Network tab
- Look for `/api/wiki` request
- Should show status `200`

#### 5. Restart Dev Server
```bash
# Stop server: Ctrl+C
# Start again: pnpm dev
```

#### 6. Check Wiki Files Exist
```bash
ls docs/wiki/
```
Should show:
```
Home.md
Getting-Started.md
Architecture-Overview.md
Code-Standards.md
Technology-Stack.md
INDEX.md
```

---

## 🔧 If Still Not Working

### Test the API Directly

**In Browser Console** (F12):
```javascript
fetch('/api/wiki')
  .then(r => r.json())
  .then(d => console.log('Pages:', d.pages))
```

Should see pages array in console.

**Or in Browser URL Bar**:
```
http://localhost:3000/api/wiki
```

Should see JSON response with pages.

### Check Server Logs

**In terminal where `pnpm dev` is running:**

Look for messages like:
```
Wiki directory: /path/to/docs/wiki
Files found: [...]
MD files: [...]
Final pages: [...]
```

---

## 📝 Use the Wiki

### Search Pages
1. Type in search box (e.g., "code", "standards")
2. Results filter instantly

### View Page Content
1. Click a page in sidebar
2. Content appears on right
3. Markdown renders with:
   - Headings
   - Lists
   - Code blocks
   - Tables

### Go Back to Dashboard
- Click "Back to Dashboard" button at top

---

## 📚 Read More

- **Full Guide**: [WIKI_INTEGRATION_COMPLETE.md](./WIKI_INTEGRATION_COMPLETE.md)
- **User Guide**: [docs/WIKI_QUICK_REFERENCE.md](./docs/WIKI_QUICK_REFERENCE.md)
- **Debugging**: [WIKI_DEBUG_GUIDE.md](./WIKI_DEBUG_GUIDE.md)
- **Testing**: [TEST_WIKI_INTEGRATION.md](./TEST_WIKI_INTEGRATION.md)

---

## 🆘 Still Stuck?

1. **Open browser console** (F12)
2. **Run the test**:
   ```bash
   node test-wiki-api.js
   ```
3. **Share the output** from:
   - Browser console messages
   - `node test-wiki-api.js` output
   - `http://localhost:3000/api/wiki` response

---

## ✨ Features Once Working

- ✅ Search all documentation
- ✅ Read formatted markdown
- ✅ Navigate between pages
- ✅ Quick access from admin dashboard
- ✅ No setup needed for new pages

---

## 📌 Remember

- Wiki pages are in `/docs/wiki/`
- Add new pages by creating `.md` files
- Pages auto-appear (no restart needed)
- All standard markdown features supported

---

**Status**: Ready to Use 🚀

**Navigate to**: `/admin` → Wiki card or tab

Happy documenting! 📚
