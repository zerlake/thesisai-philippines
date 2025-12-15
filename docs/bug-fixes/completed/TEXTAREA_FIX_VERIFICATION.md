# Textarea Text Visibility Fix - Verification Guide

## Issue
The reply textarea in the advisor's message panel shows white/invisible text until hovered.

## Changes Made

### 1. File: `src/components/advisor-messages-panel.tsx` (Line 206)

**Added inline style to force text color:**
```tsx
<textarea
  value={replyText}
  onChange={(e) => setReplyText(e.target.value)}
  placeholder="Type your reply..."
  disabled={sending}
  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 resize-none disabled:opacity-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
  style={{ color: '#111827' }}  // <-- THIS LINE FORCES DARK TEXT COLOR
  rows={3}
/>
```

**Color value:** `#111827` is Tailwind's `gray-900` - a very dark gray that provides strong contrast on white backgrounds.

## How to Verify the Fix

### Option 1: Check the Source Code
```bash
# Navigate to project directory
cd C:\Users\Projects\thesis-ai-fresh

# Check the textarea has the inline style
grep -A2 "style={{ color" src/components/advisor-messages-panel.tsx
```

**Expected output:**
```
style={{ color: '#111827' }}
rows={3}
```

### Option 2: Inspect in Browser DevTools

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Login as an advisor**

3. **Navigate to Dashboard** and find the Messages card

4. **Open Browser DevTools** (F12)

5. **Inspect the textarea element:**
   - Right-click on the reply textarea
   - Click "Inspect Element"
   - Look for the `<textarea>` element in the HTML

6. **Verify the inline style is present:**
   ```html
   <textarea ... style="color: rgb(17, 24, 39);" ...>
   ```

7. **Check computed styles:**
   - In the "Styles" or "Computed" tab
   - Look for `color: rgb(17, 24, 39)` or `color: #111827`
   - This should NOT be crossed out (which would indicate it's being overridden)

### Option 3: Visual Test

1. Start dev server: `npm run dev`
2. Login as advisor
3. Go to Messages section in dashboard
4. Click on any message
5. Type in the reply textarea
6. **Text should be visible immediately** (dark gray on white background)
7. Text should remain visible without needing to hover

## Why Previous Attempts Failed

### Problem:
The Card component applies `text-card-foreground` to all children, which was being inherited by the textarea and overriding Tailwind classes like `text-gray-900`.

### Solution:
Inline styles have the highest CSS specificity, so `style={{ color: '#111827' }}` cannot be overridden by any CSS class, ensuring text is always visible.

## If Text is Still Invisible

### Possible Causes:

1. **Browser Cache**
   - Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
   - Or clear browser cache completely

2. **Dev Server Not Restarted**
   ```bash
   # Stop the dev server (Ctrl+C)
   # Restart it
   npm run dev
   ```

3. **Build Cache**
   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Rebuild
   npm run build
   ```

4. **Check Wrong Component**
   - Make sure you're looking at the advisor dashboard, not student dashboard
   - Student dashboard uses a different component

5. **CSS Override in Browser Extension**
   - Disable any dark mode or styling browser extensions
   - Test in incognito/private mode

## Test Script

Run this to verify the file has the correct code:

```bash
cd C:\Users\Projects\thesis-ai-fresh
node -e "
const fs = require('fs');
const content = fs.readFileSync('src/components/advisor-messages-panel.tsx', 'utf8');
const hasInlineStyle = content.includes(\"style={{ color: '#111827' }}\");
const hasClassName = content.includes('bg-white dark:bg-gray-800');
console.log('✓ File has inline style:', hasInlineStyle);
console.log('✓ File has background classes:', hasClassName);
console.log('');
if (hasInlineStyle && hasClassName) {
  console.log('✅ FIX IS CORRECTLY APPLIED IN SOURCE CODE');
  console.log('');
  console.log('If you still see white text:');
  console.log('1. Hard refresh browser (Ctrl+Shift+R)');
  console.log('2. Restart dev server');
  console.log('3. Clear .next folder and rebuild');
} else {
  console.log('❌ FIX NOT FOUND IN SOURCE CODE');
}
"
```

## Architecture Note

- **Advisor Messages**: Uses `AdvisorMessagesPanel` component (this is the one we fixed)
- **Student Notifications**: Uses `EditorEmailNotificationsSidebar` component (different, uses mock data)
- These are two completely separate components with different purposes

## Build Verification

The changes compile successfully:
```bash
npm run build
# Should complete with: ✓ Compiled successfully
```

## Contact

If the issue persists after:
1. Hard refreshing the browser
2. Restarting the dev server
3. Clearing Next.js cache

Then the problem may be environmental or related to:
- Browser extensions
- System-level CSS overrides
- Different component being viewed than expected
