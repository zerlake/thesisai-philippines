#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

const tests = {
  COMPONENT_TESTS: [
    { name: 'Editor', cmd: 'test:editor' },
    { name: 'Sign In Form', cmd: 'test:sign-in' },
    { name: 'Dashboard', cmd: 'test:dashboard' },
    { name: 'Research Questions', cmd: 'test:research-questions' },
    { name: 'Outline Builder', cmd: 'test:outline' },
    { name: 'Grammar Checker', cmd: 'test:grammar' },
    { name: 'Notifications', cmd: 'test:notifications' },
    { name: 'Paper Search', cmd: 'test:papers' },
    { name: 'Theme Toggle', cmd: 'test:theme' },
    { name: 'Bibliography Generator', cmd: 'test:bibliography' },
    { name: 'Button (UI)', cmd: 'test:button' },
    { name: 'Input (UI)', cmd: 'test:input' },
    { name: 'Card (UI)', cmd: 'test:card' },
  ],
  HOOK_TESTS: [
    { name: 'useAuth', cmd: 'test:use-auth' },
    { name: 'useTheme', cmd: 'test:use-theme' },
    { name: 'useDebounce', cmd: 'test:use-debounce' },
  ],
  API_TESTS: [
    { name: 'Thesis API', cmd: 'test:api-thesis' },
    { name: 'Papers API', cmd: 'test:api-papers' },
  ],
  INTEGRATION_TESTS: [
    { name: 'Auth Workflow', cmd: 'test:integration-auth' },
    { name: 'Thesis Creation', cmd: 'test:integration-thesis' },
    { name: 'AI Tools', cmd: 'test:integration-ai' },
  ],
};

function printHeader(text) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${text}`);
  console.log('='.repeat(60) + '\n');
}

function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(`pnpm ${cmd}`, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function runTests(category) {
  if (!category || !tests[category]) {
    printHeader('TEST RUNNER MENU');
    console.log('Usage: node scripts/run-tests.js [CATEGORY]');
    console.log('\nAvailable categories:');
    Object.keys(tests).forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('\nExamples:');
    console.log('  node scripts/run-tests.js COMPONENT_TESTS');
    console.log('  node scripts/run-tests.js HOOK_TESTS');
    console.log('  node scripts/run-tests.js API_TESTS');
    console.log('  node scripts/run-tests.js INTEGRATION_TESTS');
    return;
  }

  const testList = tests[category];
  printHeader(`Running ${category.replace(/_/g, ' ')}`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of testList) {
    console.log(`\n▶ Running: ${test.name}...`);
    const { error, stdout, stderr } = await runCommand(test.cmd);

    if (error) {
      failed++;
      results.push({ name: test.name, status: '❌ FAILED', cmd: test.cmd });
      console.log(`  ${test.name}: FAILED`);
      if (stderr) console.log(`  Error: ${stderr.substring(0, 100)}`);
    } else {
      passed++;
      results.push({ name: test.name, status: '✓ PASSED', cmd: test.cmd });
      console.log(`  ${test.name}: PASSED`);
    }
  }

  printHeader('TEST RESULTS SUMMARY');
  console.log(`Total: ${testList.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nDetailed Results:`);
  results.forEach(r => {
    console.log(`  ${r.status} - ${r.name} (pnpm ${r.cmd})`);
  });
}

const category = process.argv[2];
runTests(category);
