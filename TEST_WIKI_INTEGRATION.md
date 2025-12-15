# Wiki Integration Test Guide

## How to Test the Wiki Integration

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Navigate to Admin Dashboard
```
http://localhost:3000/admin
```

### 3. Access Wiki - Two Methods

#### Method A: From Admin Landing Page
1. Look for the **"Wiki"** card (orange with BookOpen icon)
2. Click **"View Wiki"** button
3. You will see the dedicated wiki page at `/admin/wiki`

#### Method B: From Dashboard Component
1. Click on the **"Wiki"** tab in the dashboard tabs
2. The wiki viewer appears inline with other admin tabs

### 4. Test Wiki Functionality

#### Test Search
1. Type in the search box (e.g., "code", "standards", "getting")
2. Pages should filter in real-time
3. Try clearing search to see all pages again

#### Test Page Loading
1. Click any page from the sidebar
2. Content should load in the main panel
3. Markdown should render properly with:
   - Headings formatted correctly
   - Lists formatted
   - Code blocks with syntax highlighting
   - Tables (if present)

#### Test Navigation
1. Select different pages to verify content changes
2. The selected page should be highlighted in sidebar
3. Content should load dynamically for each page

### 5. Expected Results

#### Pages Should Appear
- Home
- Getting Started
- Architecture Overview
- Code Standards
- Technology Stack
- (Any other .md files in /docs/wiki/)

#### Markdown Should Render
- # Headings as titles
- Regular text paragraphs
- Lists and code blocks
- Tables if present
- Links if present

#### Search Should Work
- Filter by page title
- Filter by page description
- Case-insensitive matching

### 6. Troubleshooting

#### Pages not appearing
**Problem**: Sidebar shows loading but no pages appear
**Solutions**:
- Check `/docs/wiki/` folder has .md files
- Verify file names are correct
- Check browser console for errors
- Try refreshing page
- Restart dev server

#### Content not rendering
**Problem**: Page loads but markdown not formatted
**Solutions**:
- Check markdown syntax in the file
- Verify headings start with #
- Check code blocks use ``` markers
- Try refreshing page

#### Search not working
**Problem**: Search doesn't filter pages
**Solutions**:
- Wait for pages to load first
- Check page titles and descriptions are in files
- Try exact match search
- Clear search box and try again

### 7. API Endpoints

#### List All Wiki Pages
```bash
curl http://localhost:3000/api/wiki
```

**Expected Response:**
```json
{
  "pages": [
    {
      "title": "Home",
      "slug": "Home",
      "description": "Central knowledge base for..."
    },
    {
      "title": "Getting Started",
      "slug": "Getting-Started",
      "description": "Setup, development, first..."
    },
    ...
  ]
}
```

#### Get Single Wiki Page Content
```bash
curl http://localhost:3000/api/wiki/Code-Standards
```

**Expected Response:**
```json
{
  "slug": "Code-Standards",
  "content": "# Code Standards & Guidelines\n\nDevelopment standards...",
  "title": "Code Standards"
}
```

### 8. Browser Console

Check for any errors:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Check if API calls are successful (Network tab)

### 9. File Verification

Verify wiki files exist:
```bash
ls -la docs/wiki/
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

### 10. Manual API Test

#### Test endpoint directly in browser
```
http://localhost:3000/api/wiki
```
Should return JSON with pages array

```
http://localhost:3000/api/wiki/Home
```
Should return JSON with markdown content

---

## Success Checklist

- ✅ Wiki appears in admin dashboard
- ✅ Wiki pages load from sidebar
- ✅ Markdown content renders correctly
- ✅ Search filters pages
- ✅ Page selection updates content
- ✅ Multiple pages can be viewed
- ✅ No console errors
- ✅ API endpoints respond correctly

## If Tests Fail

1. **Check dev server is running**: `pnpm dev`
2. **Verify wiki files exist**: Check `/docs/wiki/` folder
3. **Check browser console**: F12 → Console tab
4. **Check network requests**: F12 → Network tab
5. **Check server logs**: Look at terminal running `pnpm dev`
6. **Restart server**: Kill and restart `pnpm dev`
7. **Clear cache**: Clear browser cache or use incognito mode

---

**Last Updated**: December 2024
