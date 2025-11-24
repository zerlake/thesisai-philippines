#!/usr/bin/env node

// Script to remove unused imports from TypeScript/JSX files
const fs = require('fs');
const path = require('path');

// Map of files and their unused imports based on our analysis
const unusedImportsMap = {
  'src/app/(app)/admin/payouts/page.tsx': [
    'formatDistanceToNow'
  ],
  'src/app/(app)/admin/users/page.tsx': [
    'Button',
    'Loader2', 'X', 'Check',
    'formatDistanceToNow'
  ],
  'src/app/(app)/statistical-analysis/page.tsx': [
    'Button',
    'SampleSizeCalculator'
  ],
  'src/app/groups/page.tsx': [
    'MessageSquare', 'CheckSquare', 'Mail', 'Edit', 'Sparkles'
  ],
  'src/app/groups/[groupId]/page.tsx': [
    'Settings'
  ],
  'src/components/admin-dashboard.tsx': [
    'Search'
  ],
  'src/components/advisor-feedback-card.tsx': [
    'Skeleton',
    'Button'
  ],
  'src/components/CommandPalette/CommandPaletteHint.tsx': [
    'Square'
  ],
  'src/components/CommandPalette/commands.tsx': [
    'ClipboardPen'
  ],
  'src/components/context7-collaborative-literature-review.tsx': [
    'Checkbox'
  ],
  'src/components/context7-dashboard.tsx': [
    'Input'
  ],
  'src/components/context7-docs.tsx': [
    'Input'
  ],
  'src/components/critic-billing-page.tsx': [
    'Banknote'
  ],
  'src/components/critic-dashboard.tsx': [
    'Card', 'CardContent', 'CardDescription', 'CardHeader', 'CardTitle'
  ],
  'src/components/descriptive-statistics-panel.tsx': [
    'Skeleton'
  ],
  'src/components/document-analyzer.tsx': [
    'useEffect',
    'Label'
  ],
  'src/components/editor-header.tsx': [
    'Eye', 'XCircle'
  ],
  'src/components/editor-old.tsx': [
    'Award'
  ],
  'src/components/enhanced-outline-generator.tsx': [
    'Textarea', 'Separator'
  ],
  'src/components/feedback-turnaround-card.tsx': [
    'Timer'
  ],
  'src/components/grammar-checker.tsx': [
    'AlertTitle'
  ],
  'src/components/GroupCommunication.tsx': [
    'Badge', 'Mail', 'Users'
  ],
  'src/components/GroupMemberDashboard.tsx': [
    'Avatar', 'AvatarFallback', 'AvatarImage'
  ],
  'src/components/GroupTaskManager.tsx': [
    'Calendar', 'AlertTriangle', 'Circle'
  ],
  'src/components/literature-review.tsx': [
    'useEffect', 'useCallback', 'useRef',
    'Alert', 'AlertDescription',
    'Accordion', 'AccordionContent', 'AccordionItem', 'AccordionTrigger',
    'Badge',
    'Loader2', 'CheckCircle', 'AlertTriangle', 'ExternalLink', 'History', 'Download', 'RefreshCw', 'Quote', 'Save', 'Library', 'Globe',
    'Table', 'TableBody', 'TableCell', 'TableHead', 'TableHeader', 'TableRow',
    'formatDistanceToNow',
    'toPng',
    'jsPDF',
    'TabsContent',
    'Link',
    'cn'
  ],
  'src/components/qa-simulator.tsx': [
    'Loader2'
  ],
  'src/components/reference-manager.tsx': [
    'useEffect',
    'Textarea'
  ],
  'src/components/referrals-page.tsx': [
    'Gift', 'PiggyBank'
  ],
  'src/components/rich-text-editor.tsx': [
    'BubbleMenu',
    'Wand2'
  ],
  'src/components/SmartSessionGoalCard.tsx': [
    'Clock', 'Sparkles', 'CheckCircle2'
  ],
  'src/components/student-critic-billing-history.tsx': [
    'useMemo'
  ],
  'src/components/student-dashboard-enhancements.tsx': [
    'useEffect',
    'Progress',
    'BookOpen'
  ],
  'src/components/student-dmp-form.tsx': [
    'Loader2'
  ],
  'src/components/thesis-context7-docs.tsx': [
    'Input'
  ],
  'src/components/topic-ideation-tool.tsx': [
    'useEffect',
    'Alert', 'AlertDescription'
  ],
  'src/components/ui/calendar.tsx': [
    'ChevronLeft', 'ChevronRight'
  ]
};

// Function to properly remove specific identifiers from import statements
function removeUnusedImports(filePath) {
  const absolutePath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.log(`File does not exist: ${absolutePath}`);
    return false;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');
  let modified = false;
  
  if (!unusedImportsMap[filePath]) {
    console.log(`No unused imports defined for: ${filePath}`);
    return false;
  }
  
  // Process each unused import for this file
  unusedImportsMap[filePath].forEach(identifier => {
    // Create regex to match import statements containing this identifier
    // Handle both named imports { identifier } and default/named imports
    const regex = new RegExp(`(import\\s+{[^}]*?)(${identifier}\\s*(?:as\\s+\\w+)?\\s*[,}])\\s*`, 'g');
    
    let newContent = content;
    const originalContent = content;
    
    // Replace the identifier with empty string (and handle commas appropriately)
    newContent = newContent.replace(regex, (match, beforeBrace, importedItem) => {
      modified = true;
      // Remove the specific import and clean up commas
      let cleaned = match.replace(importedItem, '');
      
      // Clean up extra commas and spaces
      cleaned = cleaned.replace(/\s*,\s*,\s*/, ', ');
      cleaned = cleaned.replace(/\s*{\s*,/, '{ ');
      cleaned = cleaned.replace(/,\s*}/, ' }');
      cleaned = cleaned.replace(/^\s*import\s*{\s*}\s*from\s*/, '/* Empty import removed */\n');
      
      return cleaned;
    });
    
    content = newContent;
  });
  
  // Now do a final pass to remove completely empty import statements
  content = content.replace(/import\s+{\s*}\s+from\s+['"][^'"]+['"]\s*;/g, '/* Unused import removed */');
  
  if (modified) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`✓ Removed ${unusedImportsMap[filePath].length} unused imports from ${filePath}`);
    return true;
  } else {
    console.log(`- No changes made to ${filePath} (may not contain listed unused imports)`);
    return false;
  }
}

console.log('Removing unused imports from identified files...\n');

let totalModifiedFiles = 0;
let totalCount = 0;

// Process each file
Object.keys(unusedImportsMap).forEach(file => {
  const wasModified = removeUnusedImports(file);
  if (wasModified) {
    totalModifiedFiles++;
    totalCount += unusedImportsMap[file].length;
  }
});

console.log(`\nCompleted!`);
console.log(`- Modified ${totalModifiedFiles} files`);
console.log(`- Removed ${totalCount} unused imports total`);
console.log(`\nNote: Some imports may have been removed that weren't found in the files,`);
console.log(`indicating they might have already been removed or the detection was imprecise.`);