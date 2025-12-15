# Keyboard Navigation Testing Guide - Session 14

## Overview

This guide provides step-by-step instructions for testing keyboard accessibility on the ThesisAI dashboard.

**WCAG Compliance**: Tests against WCAG 2.1 Level AA standards (2.1 Keyboard Accessible, 2.4 Navigable)

---

## Prerequisites

- [ ] Project built: `pnpm build`
- [ ] Dev server running: `pnpm dev`
- [ ] Dashboard accessible at: `http://localhost:3000/dashboard`
- [ ] Browser: Chrome, Firefox, Safari, or Edge

---

## Test Execution

### Phase 1: Tab Navigation (15 minutes)

**Objective**: Verify that all interactive elements are reachable via Tab key and follow logical order

**Steps**:

1. **Open Dashboard**
   ```
   URL: http://localhost:3000/dashboard
   Action: Press Tab once
   Expected: Skip link appears at top (blue button saying "Skip to main content")
   ```

2. **Tab Through Navigation**
   ```
   Action: Continue pressing Tab
   Elements to verify:
   ├─ Skip link (visible on focus)
   ├─ Main navigation (if exists)
   ├─ Dashboard header/greeting
   ├─ Widget refresh buttons
   ├─ Widget content (links, buttons, inputs)
   └─ Footer links and logout
   
   ✅ Expected: Smooth flow without jumps
   ❌ Problems to watch: Elements skipped, illogical order
   ```

3. **Verify Tab Order**
   ```
   Tab Order should be:
   1. Skip to content link
   2. Top navigation (if any)
   3. Dashboard title
   4. Widget controls (left to right, top to bottom)
   5. Widget content
   6. Footer
   7. Logout (usually last)
   
   ✅ Expected: Left-to-right, top-to-bottom flow
   ❌ Problems: Jumping around, back and forth
   ```

4. **Reverse Navigation (Shift+Tab)**
   ```
   Action: From bottom of page, hold Shift and press Tab
   Expected: Navigate backwards through same elements
   ❌ Problems: Shift+Tab doesn't work, elements skipped
   ```

---

### Phase 2: Focus Indicators (10 minutes)

**Objective**: Verify that focus is always visible and clear

**Steps**:

1. **Check Focus Outline on Each Element**
   ```
   Tab through dashboard and check each element:
   
   ├─ Buttons
   │  ✅ Should show visible outline/ring
   │  ✅ Color should contrast with background
   │  ✅ Outline should be at least 2px
   
   ├─ Links
   │  ✅ Should show visible outline
   │  ✅ Not just color change
   │  ✅ Ring should be around the text
   
   ├─ Form Inputs
   │  ✅ Should show border or outline
   │  ✅ Usually blue/primary color ring
   │  ✅ Should match button outline style
   
   ├─ Checkboxes/Toggles
   │  ✅ Should show visible ring
   │  ✅ Ring should surround the control
   
   └─ Dropdowns/Selects
      ✅ Should show focus on the button
      ✅ Open state should maintain visibility
   ```

2. **Contrast Check**
   ```
   For each focused element:
   
   Light Theme:
   ├─ Focus ring color (usually blue): #3B82F6 or similar
   ├─ Ring on white background: Should be clearly visible
   └─ Ratio check: Need at least 3:1 contrast
   
   Dark Theme:
   ├─ Focus ring color: Lighter blue for dark background
   ├─ Ring on dark background: Should be clearly visible
   └─ Ratio check: Need at least 3:1 contrast
   ```

3. **Document Issues**
   ```
   If focus indicator is not visible:
   
   ✅ Acceptable: Focus outline with 2px or larger
   ✅ Acceptable: Focus ring in primary color
   ❌ Problem: Outline removed completely (outline: none)
   ❌ Problem: Outline invisible (outline color same as background)
   ❌ Problem: Outline less than 2px thick
   ```

---

### Phase 3: Modal/Dialog Testing (10 minutes)

**Objective**: Verify that modal dialogs work correctly with keyboard

**Steps**:

1. **Open any Modal Dialog**
   ```
   Action: Find and click a button that opens a modal
   Example: Settings, Create new item, Confirm action
   ```

2. **Tab Within Modal**
   ```
   Action: Press Tab multiple times
   Expected: Focus stays inside modal
   ❌ Problem: Focus moves to background page
   ❌ Problem: Escape key doesn't work
   ```

3. **Close Modal with Escape**
   ```
   Action: Press Escape key
   Expected: Modal closes
   Expected: Focus returns to trigger button
   ❌ Problem: Modal doesn't close
   ❌ Problem: Focus is lost
   ```

4. **Tab to Focus Trap**
   ```
   Action: Keep pressing Tab when at last element
   Expected: Focus cycles back to first element in modal
   ✅ Expected: Focus trapped inside modal while open
   ❌ Problem: Can Tab out of modal
   ```

5. **Close with Button**
   ```
   Action: Tab to Close button, press Enter
   Expected: Modal closes
   Expected: Focus returns to trigger
   ```

---

### Phase 4: Form Testing (15 minutes)

**Objective**: Verify all form interactions work with keyboard

**Steps**:

1. **Tab to First Input**
   ```
   Action: Tab until reaching first form field
   Expected: Input has visible focus
   Expected: Cursor in input field
   ```

2. **Type in Input**
   ```
   Action: Type text (e.g., "test message")
   Expected: Text appears in input
   Expected: No unexpected page behavior
   ```

3. **Tab to Next Field**
   ```
   Action: Press Tab
   Expected: Focus moves to next input
   Expected: First input retains value
   ```

4. **Test Checkboxes**
   ```
   Action: Tab to checkbox
   Expected: Checkbox has visible focus
   
   Action: Press Space
   Expected: Checkbox toggles
   Expected: Focus remains on checkbox
   ```

5. **Test Dropdowns**
   ```
   Action: Tab to dropdown
   Expected: Button has focus
   
   Action: Press Space or Enter
   Expected: Dropdown opens
   Expected: First option highlighted
   
   Action: Press Arrow Down/Up
   Expected: Options cycle through
   
   Action: Press Enter
   Expected: Selection made, dropdown closes
   ```

6. **Test Form Submission**
   ```
   Action: Tab to Submit button
   Expected: Button has visible focus
   
   Action: Press Enter
   Expected: Form submits
   Expected: Appropriate feedback (success/error)
   ```

---

### Phase 5: Special Elements (10 minutes)

**Objective**: Verify special interactive elements work with keyboard

**Steps**:

1. **Buttons with Menus**
   ```
   Action: Tab to button with dropdown
   Expected: Focus on button
   
   Action: Press Enter or Space
   Expected: Menu opens
   
   Action: Press Arrow Keys
   Expected: Items highlight
   
   Action: Press Enter
   Expected: Item selected
   ```

2. **Accordions/Collapsibles**
   ```
   Action: Tab to accordion header
   Expected: Header has focus
   
   Action: Press Space or Enter
   Expected: Accordion expands/collapses
   
   Action: Tab within expanded content
   Expected: All content items accessible
   ```

3. **Tabs**
   ```
   Action: Tab to tab button
   Expected: Tab has focus
   
   Action: Press Space or Enter
   Expected: Tab activates, content changes
   
   Action: Press Arrow Left/Right
   Expected: Adjacent tabs activate (optional, but nice)
   ```

4. **Sliders (if present)**
   ```
   Action: Tab to slider
   Expected: Slider has focus
   
   Action: Press Arrow Keys
   Expected: Value changes
   Expected: Feedback shown
   ```

---

## Checklist for Success

### Critical (Must Fix)
```
□ All buttons are keyboard accessible (Tab + Enter)
□ All links are keyboard accessible (Tab + Enter)
□ All form inputs are keyboard accessible (Tab + type)
□ Focus indicators visible on every element
□ Tab order is logical and doesn't jump
□ Shift+Tab navigates backwards
□ No keyboard traps (except modals)
□ Escape closes modals
□ Focus returns after closing modal
```

### Important (Should Fix)
```
□ Focus indicators are consistent in style
□ Focus indicators contrast well with background
□ Skip link works and appears on first Tab
□ All aria-labels present where needed
□ Form error messages associated with fields
□ Loading states don't trap focus
□ Dropdowns work with arrow keys
```

### Nice to Have
```
□ Arrow keys navigate between similar elements
□ Enter and Space work consistently
□ Custom focus styles match design
□ Keyboard shortcuts documented
□ Speed of keyboard navigation reasonable
□ No unexpected page jumps when tabbing
```

---

## Common Issues and Fixes

### Issue: Focus Outline Not Visible

**Problem**: Can't see where keyboard focus is

**Causes**:
- CSS `outline: none` removing focus
- Focus color same as background
- Outline too thin to see

**Fix**:
```css
/* In globals.css or component */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Issue: Shift+Tab Doesn't Work

**Problem**: Can't navigate backwards

**Cause**: Usually browser issue or incorrect CSS

**Fix**: Check that elements aren't given negative `tabindex`
```typescript
// ❌ Wrong
<button tabIndex={-1}>Skip This</button>

// ✅ Right
<button>Include This</button>
```

### Issue: Tab Order Wrong

**Problem**: Tabbing skips elements or goes in wrong order

**Cause**: CSS changes tab order or elements out of source order

**Fix**: Use logical HTML order, avoid changing with CSS
```typescript
// ✅ Good
<div>
  <button>First</button>
  <button>Second</button>
  <button>Third</button>
</div>

// ❌ Bad (reversed with CSS)
<div className="flex flex-row-reverse">
  <button>First</button>
  <button>Second</button>
  <button>Third</button>
</div>
```

### Issue: Can't Close Modal with Keyboard

**Problem**: Modal open but can't close it

**Causes**:
- No Escape key handler
- Close button not keyboard accessible
- Focus trapped outside modal

**Fix**:
```typescript
// In modal component
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### Issue: Form Won't Submit with Keyboard

**Problem**: Can tab to button but Enter doesn't submit

**Cause**: Button missing proper type or handler

**Fix**:
```typescript
// ✅ Good
<button type="submit">Submit</button>

// ❌ Bad
<button onClick={handleSubmit}>Submit</button>

// Also works
<button type="button" onClick={handleSubmit} onKeyDown={(e) => {
  if (e.key === 'Enter') handleSubmit();
}}>
  Submit
</button>
```

---

## Testing Report Template

```markdown
## Keyboard Accessibility Test Report - Session 14

**Date**: ___________
**Tested By**: ___________
**Browser**: ___________
**Device**: ___________

### Results

| Category | Status | Notes |
|----------|--------|-------|
| Tab Navigation | ✅/⚠️/❌ | |
| Focus Indicators | ✅/⚠️/❌ | |
| Modal Dialogs | ✅/⚠️/❌ | |
| Forms | ✅/⚠️/❌ | |
| Special Elements | ✅/⚠️/❌ | |
| Overall | ✅/⚠️/❌ | |

### Issues Found

1. [Category] Issue description
   - [ ] Critical
   - [ ] Important
   - [ ] Nice to have
   
### Recommendations

- 
- 

### Sign Off

**Tested By**: ___________
**Date**: ___________
**Status**: Ready for Production / Needs Fixes
```

---

## Next Steps

1. ✅ Run this test
2. ✅ Document any issues
3. ✅ Create bugs for critical issues
4. ✅ Fix and re-test
5. ✅ Run full Lighthouse audit
6. ✅ Get accessibility sign-off

---

## Resources

- [WCAG 2.1 Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [MDN Keyboard Event Handling](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)

---

**Time to Complete**: ~1 hour  
**Difficulty**: Medium  
**WCAG Target**: 2.1 Level AA
