# Wiki Quick Reference Guide

## Accessing the Wiki

### Via Admin Dashboard
1. Go to `/admin`
2. Click **"Wiki"** card (orange, BookOpen icon)
3. Or click **"Wiki"** tab in the dashboard tabs

### Direct URL
- Full-page wiki viewer: `/admin/wiki`

## Search & Navigation

### Find a Page
1. Type in the search box (e.g., "standards", "architecture")
2. Results filter in real-time
3. Click any page to view content

### Browse All Pages
Available pages:
- **Home** - Wiki overview
- **Getting Started** - Setup & dev environment
- **Architecture Overview** - System design
- **Code Standards** - Coding conventions
- **Technology Stack** - Libraries & frameworks

## Reading Documentation

### Page Layout
- **Left sidebar**: Page list and search
- **Right panel**: Full page content
- **Content**: Formatted markdown with syntax highlighting

### Features
- Search filters by title and description
- Category badges show topic grouping
- Markdown rendering with proper formatting
- Scrollable content area

## Managing Wiki Pages

### Add a New Page

1. **Create file** in `/docs/wiki/`
   ```
   /docs/wiki/New-Page-Name.md
   ```

2. **Write markdown content**
   ```markdown
   # Page Title
   
   Content here...
   ```

3. **Use naming**: PascalCase-With-Hyphens
   - Good: `Feature-Implementation.md`
   - Bad: `feature_implementation.md`

4. **Restart dev server** (if needed)

5. **Access at**: `/api/wiki/New-Page-Name`

### Update Existing Page

1. **Edit file** in `/docs/wiki/`
2. **Save changes**
3. **Reload browser** to see updates
4. **No restart needed**

### Best Practices

- **Clear titles**: Use descriptive headings
- **Organized content**: Use proper markdown hierarchy
- **Code examples**: Include real code snippets
- **Links**: Link between related pages
- **Formatting**: Use tables, lists, code blocks

## File Structure

```
docs/wiki/
├── INDEX.md                 # Index and navigation
├── Home.md                  # Homepage
├── Getting-Started.md
├── Architecture-Overview.md
├── Code-Standards.md
└── ... (more pages)
```

## Common Tasks

### Search for content
**How**: Use search box in left sidebar
**Example**: Search "database" finds all database-related pages

### View a specific page
**How**: Click page name in sidebar
**Result**: Content loads in right panel

### Find API documentation
**How**: Search "API" in wiki
**Find**: API Reference page with all endpoints

### Learn coding standards
**How**: Click "Code Standards" page
**Get**: Conventions, patterns, examples

### Understand system architecture
**How**: Click "Architecture Overview" page
**Get**: System design and data flow

## Troubleshooting

### Page doesn't appear
- Check filename in `/docs/wiki/`
- Ensure `.md` extension
- Restart dev server
- Clear browser cache

### Search returns no results
- Check for typos
- Page title might be different
- Try searching by category

### Content not displaying correctly
- Check markdown syntax
- Verify heading levels (# ## ###)
- Fix code block formatting

### Link not working
- Ensure link format is correct
- Check target page exists
- Use relative paths for internal links

## Tips & Tricks

### Quick Navigation
- Home page lists all available pages
- Categories help organize pages
- Search is fastest for finding topics

### Reading Efficiently
- Start with "Getting Started" for new topics
- Reference "Code Standards" while coding
- Bookmark frequently used pages

### Contributing
- Keep pages focused and concise
- Use examples from actual code
- Link related pages together
- Update when code changes

## API Reference

### Fetch Wiki Content
```bash
curl http://localhost:3000/api/wiki/Code-Standards
```

Returns:
```json
{
  "slug": "Code-Standards",
  "content": "# Code Standards...",
  "title": "Code Standards"
}
```

## Related Documentation

- Full integration guide: `WIKI_INTEGRATION_COMPLETE.md`
- AGENTS.md: Command reference
- /docs/wiki/: All wiki pages
- /src/components/admin/wiki-viewer.tsx: Component code

---

**Last Updated**: December 2024

**Status**: Ready to Use ✅
