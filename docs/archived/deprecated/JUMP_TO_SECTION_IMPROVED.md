# Jump to Section - Now Fully Functional

## Problem
The "Jump to Section" button showed which section it would jump to, but the actual jump/scroll wasn't working. The ID-based approach didn't work because TipTap editor doesn't preserve custom IDs in rendered HTML.

## Solution
Implemented a **text-search-based approach** that:
1. Reads the section name from the notification
2. Searches the editor for headings matching that section
3. Scrolls smoothly to the heading
4. Highlights it with a visual pulse effect for 3 seconds

## How It Works

### 1. **Section Name Mapping**
```typescript
const getSectionName = (sectionId: string): string => {
  const sectionMap: Record<string, string> = {
    'literature-review': 'Literature Review',
    'methodology': 'Methodology',
    'conclusion': 'Conclusion',
    // ... etc
  };
  return sectionMap[sectionId];
};
```

### 2. **Smart Section Finder**
```typescript
const jumpToSection = (sectionId: string) => {
  const sectionName = getSectionName(sectionId);
  
  // Get editor content area
  const editorContent = document.querySelector('[class*="prose"]');
  
  // Search all headings for matching text
  const headings = Array.from(editorContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  
  // Find heading that matches section name
  const foundElement = headings.find(heading =>
    heading.textContent?.toLowerCase().includes(sectionName.toLowerCase())
  );
  
  if (foundElement) {
    // Scroll smoothly to section
    foundElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add highlight effect
    foundElement.classList.add('editor-section-highlight');
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      foundElement.classList.remove('editor-section-highlight');
    }, 3000);
  }
};
```

### 3. **Visual Highlight Effect**
When a section is found and scrolled to, it gets a blue highlight that pulses for 3 seconds:

```css
@keyframes section-highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  50% {
    background-color: rgba(59, 130, 246, 0.15);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  100% {
    background-color: transparent;
    box-shadow: 0 0 0 0px rgba(59, 130, 246, 0);
  }
}

.editor-section-highlight {
  animation: section-highlight 3s ease-out forwards;
  padding: 0.5rem;
  border-radius: 0.375rem;
}
```

## User Experience

### Before Clicking
```
Email Workspace
├─ Feedback on Chapter II
│  From: Dr. Sarah Chen
│  Message: "Your literature review is comprehensive..."
│  
│  Target Section: Literature Review
│  [Jump to "Literature Review"]
```

### After Clicking
1. **Smooth Scroll** → Editor content scrolls to find "Literature Review"
2. **Visual Highlight** → The "Literature Review" heading gets highlighted with blue pulse
3. **Auto-Fade** → Highlight fades out after 3 seconds
4. **Focus** → Student can now read and edit the section

## Technical Details

**Files Modified:**
- `src/components/editor-email-notifications-sidebar.tsx`
  - Added `getSectionName()` function
  - Added `jumpToSection()` helper with text search logic
  - Updated button click handler to use new logic
  - Improved UI to show target section name

- `src/globals.css`
  - Added `section-highlight` animation
  - Added `.editor-section-highlight` class

**Search Strategy:**
1. Looks in prose editor area first
2. Searches h1-h6 headings and paragraphs
3. Case-insensitive matching
4. Falls back to scrolling editor area if section not found

## Features

✅ **Shows Target Section** - Button displays "Jump to 'Literature Review'"  
✅ **Visual Feedback** - Blue highlight pulse when section found  
✅ **Smooth Scrolling** - Native `scrollIntoView()` animation  
✅ **Auto-Fade** - Highlight automatically removes after 3 seconds  
✅ **Robust Search** - Works even if exact headings vary  
✅ **Fallback** - Scrolls editor area if section not found  

## Testing

### Test Case 1: Jump to Literature Review
1. Open `/drafts/doc-2` as student
2. Click first email notification (Feedback on Chapter II)
3. Click "Jump to 'Literature Review'" button
4. **Expected**: Page scrolls to "Literature Review" heading with blue highlight

### Test Case 2: Jump to Methodology
1. Same page, click second notification
2. Click "Jump to 'Methodology'" button  
3. **Expected**: Scrolls to "Methodology" heading with highlight

### Test Case 3: Jump to Conclusion
1. Same page, click third notification
2. Click "Jump to 'Conclusion'" button
3. **Expected**: Scrolls to "Conclusion" heading with highlight

## Status
✅ **Complete and tested** - Build successful, functionality verified
