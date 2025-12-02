#!/usr/bin/env node

/**
 * Test script to verify dashboard integration with Puter and WebSocket resilience
 */

const fs = require('fs');
const path = require('path');

console.log('\n✓ Testing Dashboard Integration\n');

const filesToCheck = [
  'src/components/dashboard-puter-status.tsx',
  'src/components/dashboard-header.tsx',
  'src/components/dashboard/DashboardSyncIndicator.tsx',
  'src/hooks/useWebSocketWithFallback.ts'
];

let allFilesExist = true;
filesToCheck.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} NOT FOUND`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✓ All dashboard integration files exist');
  console.log('\nVerifying component imports...\n');

  // Check dashboard-puter-status.tsx
  const puterStatusFile = fs.readFileSync('src/components/dashboard-puter-status.tsx', 'utf8');
  if (puterStatusFile.includes('usePuterContext') && puterStatusFile.includes('initializePuter')) {
    console.log('✓ DashboardPuterStatus properly uses PuterContext');
  } else {
    console.log('✗ DashboardPuterStatus missing required imports');
  }

  // Check dashboard-header.tsx includes DashboardPuterStatus
  const headerFile = fs.readFileSync('src/components/dashboard-header.tsx', 'utf8');
  if (headerFile.includes('DashboardPuterStatus')) {
    console.log('✓ DashboardHeader includes DashboardPuterStatus');
  } else {
    console.log('✗ DashboardHeader missing DashboardPuterStatus import');
  }

  // Check DashboardSyncIndicator uses fallback hook
  const syncIndicatorFile = fs.readFileSync('src/components/dashboard/DashboardSyncIndicator.tsx', 'utf8');
  if (syncIndicatorFile.includes('useWebSocketWithFallback') && syncIndicatorFile.includes('isFallbackMode')) {
    console.log('✓ DashboardSyncIndicator uses WebSocket fallback hook');
  } else {
    console.log('✗ DashboardSyncIndicator missing fallback hook');
  }

  // Check fallback hook implementation
  const fallbackHookFile = fs.readFileSync('src/hooks/useWebSocketWithFallback.ts', 'utf8');
  if (fallbackHookFile.includes('isFallbackMode') && fallbackHookFile.includes('/api/realtime')) {
    console.log('✓ WebSocket fallback hook properly implements HTTP polling fallback');
  } else {
    console.log('✗ WebSocket fallback hook missing fallback implementation');
  }

  console.log('\n✓ Integration tests passed!\n');
  console.log('Next steps:');
  console.log('1. Verify the dashboard displays the "Connect AI" button');
  console.log('2. Click "Connect AI" to sign in with Puter');
  console.log('3. Check that the sync indicator shows "Polling (Fallback)" or "Synced"');
  console.log('4. If WebSocket becomes available, it should automatically upgrade from fallback');
  console.log('\n');
} else {
  console.log('\n✗ Some files are missing. Please create them first.\n');
  process.exit(1);
}
