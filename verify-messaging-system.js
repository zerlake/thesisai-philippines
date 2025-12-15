#!/usr/bin/env node

/**
 * Verification Script for Messaging System Implementation
 *
 * This script verifies that all messaging system components are correctly implemented.
 * Run with: node verify-messaging-system.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Messaging System Implementation...\n');

let allChecksPass = true;

// Check 1: StudentMessagesPanel component exists
console.log('✓ Check 1: StudentMessagesPanel component');
const studentPanelPath = path.join(__dirname, 'src', 'components', 'student-messages-panel.tsx');
if (fs.existsSync(studentPanelPath)) {
  const content = fs.readFileSync(studentPanelPath, 'utf8');

  // Check for key features
  const hasPolling = content.includes('setInterval(fetchMessages, 3000)');
  const hasTextareaFix = content.includes("style={{ color: '#111827' }}");
  const hasTwoPanels = content.includes('Message List') && content.includes('Message Detail');
  const hasReplyHandler = content.includes('handleSendReply');

  console.log(`  ✓ File exists: ${studentPanelPath}`);
  console.log(`  ${hasPolling ? '✓' : '✗'} Has polling (every 3 seconds)`);
  console.log(`  ${hasTextareaFix ? '✓' : '✗'} Has textarea text color fix`);
  console.log(`  ${hasTwoPanels ? '✓' : '✗'} Has two-panel layout`);
  console.log(`  ${hasReplyHandler ? '✓' : '✗'} Has reply handler`);

  if (!hasPolling || !hasTextareaFix || !hasTwoPanels || !hasReplyHandler) {
    allChecksPass = false;
  }
} else {
  console.log(`  ✗ File NOT found: ${studentPanelPath}`);
  allChecksPass = false;
}

console.log('');

// Check 2: StudentMessagesPanel is imported in student dashboard
console.log('✓ Check 2: StudentMessagesPanel integration in dashboard');
const dashboardPath = path.join(__dirname, 'src', 'components', 'student-dashboard-enterprise.tsx');
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');

  const hasImport = content.includes('import { StudentMessagesPanel }');
  const hasUsage = content.includes('<StudentMessagesPanel />');
  const hasMessagesCard = content.includes('Messages from Advisors/Critics') || content.includes('<CardTitle>Messages</CardTitle>');

  console.log(`  ${hasImport ? '✓' : '✗'} Component is imported`);
  console.log(`  ${hasUsage ? '✓' : '✗'} Component is used in JSX`);
  console.log(`  ${hasMessagesCard ? '✓' : '✗'} Messages card exists`);

  if (!hasImport || !hasUsage || !hasMessagesCard) {
    allChecksPass = false;
  }
} else {
  console.log(`  ✗ Dashboard file NOT found: ${dashboardPath}`);
  allChecksPass = false;
}

console.log('');

// Check 3: Editor notifications sidebar uses real data
console.log('✓ Check 3: Editor notifications sidebar (real data)');
const editorSidebarPath = path.join(__dirname, 'src', 'components', 'editor-email-notifications-sidebar.tsx');
if (fs.existsSync(editorSidebarPath)) {
  const content = fs.readFileSync(editorSidebarPath, 'utf8');

  const hasRealDataFetch = content.includes('/api/messages/get?userId=');
  const noMockData = !content.includes('const mockNotifications: EmailNotification[] = [');
  const hasPolling = content.includes('setInterval(fetchNotifications,');

  console.log(`  ${hasRealDataFetch ? '✓' : '✗'} Fetches from /api/messages/get`);
  console.log(`  ${noMockData ? '✓' : '✗'} No hardcoded mock notifications`);
  console.log(`  ${hasPolling ? '✓' : '✗'} Has polling for updates`);

  if (!hasRealDataFetch || !noMockData || !hasPolling) {
    allChecksPass = false;
  }
} else {
  console.log(`  ✗ File NOT found: ${editorSidebarPath}`);
  allChecksPass = false;
}

console.log('');

// Check 4: Advisor messages panel has textarea fix
console.log('✓ Check 4: Advisor messages panel (textarea fix)');
const advisorPanelPath = path.join(__dirname, 'src', 'components', 'advisor-messages-panel.tsx');
if (fs.existsSync(advisorPanelPath)) {
  const content = fs.readFileSync(advisorPanelPath, 'utf8');

  const hasTextareaFix = content.includes("style={{ color: '#111827' }}");

  console.log(`  ${hasTextareaFix ? '✓' : '✗'} Has textarea text color fix`);

  if (!hasTextareaFix) {
    allChecksPass = false;
  }
} else {
  console.log(`  ✗ File NOT found: ${advisorPanelPath}`);
  allChecksPass = false;
}

console.log('');
console.log('═'.repeat(60));

if (allChecksPass) {
  console.log('\n✅ ALL CHECKS PASSED!\n');
  console.log('The messaging system implementation is complete and verified.');
  console.log('\nNext steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
  console.log('3. Test the messaging flow:');
  console.log('   - Login as advisor → Send message');
  console.log('   - Login as student → Check Messages card in dashboard');
  console.log('   - Verify message appears within 3 seconds');
  console.log('   - Reply and verify advisor receives it');
  console.log('');
  process.exit(0);
} else {
  console.log('\n❌ SOME CHECKS FAILED\n');
  console.log('Please review the errors above and ensure all components are correctly implemented.');
  console.log('\nRefer to MESSAGING_SYSTEM_COMPLETE.md for detailed implementation guide.');
  console.log('');
  process.exit(1);
}
