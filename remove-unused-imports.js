#!/usr/bin/env node

// Script to remove unused imports from TypeScript/JSX files
const fs = require('fs');
const path = require('path');

// This script removes unused imports based on the list from our previous scan
// It's a simplified approach - a real solution would use AST parsing for more accuracy

function removeSpecificUnusedImports() {
  const results = [];

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
    ],
  };

  Object.keys(unusedImportsMap).forEach(file => {
    const absolutePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(absolutePath)) {
      console.log(`File does not exist: ${absolutePath}`);
      return;
    }

    let content = fs.readFileSync(absolutePath, 'utf8');
    let modified = false;
    
    unusedImportsMap[file].forEach(identifier => {
      // Create a regex to match the import of this specific identifier
      // This is a simplified approach - in reality, proper AST parsing would be needed
      const importRegex = new RegExp(`(import\\s+{[^}]*)(,?\\s*${identifier}\\s*,?)([^}]*}\\s+from\\s+['"][^'"]+['"])`, 'g');
      
      let newContent = content.replace(importRegex, (match, before, removal, after) => {
        modified = true;
        
        // Remove the identifier and clean up extra commas/spaces
        let cleanedBefore = before.trim().replace(/,\s*$/, ''); // Remove trailing comma
        let cleanedAfter = after.trim();
        
        // Handle when we're removing the last item in a destructuring import
        if (cleanedBefore === 'import {' || cleanedAfter.startsWith('} from')) {
          // If removing the last item, remove the whole import line
          return '';
        }
        
        // If there's a trailing comma after removal, remove it
        const newMatch = `import {${cleanedBefore}${cleanedBefore && cleanedAfter !== '} from' ? ', ' : ''}${cleanedAfter}`;
        return newMatch;
      });
      
      // If import became empty (only whitespace between curly braces), remove the entire import
      newContent = newContent.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];/g, '');
      
      content = newContent;
    });
    
    if (modified) {
      fs.writeFileSync(absolutePath, content, 'utf8');
      results.push({ file, count: unusedImportsMap[file].length });
      console.log(`Removed ${unusedImportsMap[file].length} unused imports from ${file}`);
    }
  });

  console.log(`\nProcessed ${results.length} files with unused imports.`);
  return results;
}

console.log('Removing unused imports...\n');
const results = removeSpecificUnusedImports();

if (results.length === 0) {
  console.log('No files were modified.');
} else {
  console.log(`\nCompleted! Modified ${results.length} files.`);
}