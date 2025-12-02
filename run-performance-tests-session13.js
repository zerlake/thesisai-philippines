#!/usr/bin/env node

/**
 * Performance Benchmarking Script - Session 13
 * Tests dashboard API endpoints for performance
 * Modified to use port 3000 (development server)
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const WARMUP_ITERATIONS = 2;
const TEST_ITERATIONS = 5;

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results storage
const results = {
  singleWidgetMiss: [],
  singleWidgetHit: [],
  batchFive: [],
  batchFiveForceRefresh: [],
  invalid: [],
  errors: []
};

// Utility to make HTTP requests
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            duration,
            body: json,
            cached: json.results?.[Object.keys(json.results || {})[0]]?.cached
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            duration,
            body: data,
            cached: false
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Format ms with color
function formatTime(ms, target = 100) {
  let color = colors.green;
  if (ms > target * 1.5) color = colors.red;
  else if (ms > target) color = colors.yellow;
  return `${color}${ms.toFixed(2)}ms${colors.reset}`;
}

// Test 1: Single Widget Fetch (Cache Miss)
async function testSingleWidgetMiss() {
  console.log(`\n${colors.blue}Test 1: Single Widget (Cache Miss)${colors.reset}`);
  
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await makeRequest('/api/dashboard/widgets/batch', 'POST', {
      widgetIds: ['metrics-test-' + Date.now()],
      forceRefresh: true
    }).catch(err => {
      results.errors.push(err.message);
    });
  }

  // Test runs
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest('/api/dashboard/widgets/batch', 'POST', {
        widgetIds: ['stats'],
        forceRefresh: true
      });
      results.singleWidgetMiss.push(result.duration);
      console.log(`  Run ${i + 1}: ${formatTime(result.duration, 300)} (status: ${result.status})`);
    } catch (err) {
      results.errors.push(`Single miss test: ${err.message}`);
      console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
    }
  }
}

// Test 2: Single Widget Fetch (Cache Hit)
async function testSingleWidgetHit() {
  console.log(`\n${colors.blue}Test 2: Single Widget (Cache Hit)${colors.reset}`);
  
  // Prime the cache
  await makeRequest('/api/dashboard/widgets/batch', 'POST', {
    widgetIds: ['stats'],
    forceRefresh: false
  }).catch(() => {});

  // Wait a moment for cache to settle
  await new Promise(r => setTimeout(r, 100));

  // Test runs
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest('/api/dashboard/widgets/batch', 'POST', {
        widgetIds: ['stats'],
        forceRefresh: false
      });
      results.singleWidgetHit.push(result.duration);
      const cached = result.cached ? `${colors.green}(cached)${colors.reset}` : '(not cached)';
      console.log(`  Run ${i + 1}: ${formatTime(result.duration, 50)} ${cached}`);
    } catch (err) {
      results.errors.push(`Single hit test: ${err.message}`);
      console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
    }
  }
}

// Test 3: Batch Fetch (5 Widgets)
async function testBatchFive() {
  console.log(`\n${colors.blue}Test 3: Batch Fetch (5 Widgets)${colors.reset}`);
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest('/api/dashboard/widgets/batch', 'POST', {
        widgetIds: [
          'research-progress',
          'quick-stats',
          'recent-papers',
          'writing-goals',
          'collaboration'
        ],
        forceRefresh: i === 0 // First is fresh, rest are cached
      });
      results.batchFive.push(result.duration);
      const status = i === 0 ? '(first)' : '(cached)';
      console.log(`  Run ${i + 1}: ${formatTime(result.duration, i === 0 ? 500 : 100)} ${status}`);
    } catch (err) {
      results.errors.push(`Batch 5 test: ${err.message}`);
      console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
    }
  }
}

// Test 4: Batch Force Refresh
async function testBatchForceRefresh() {
  console.log(`\n${colors.blue}Test 4: Batch Force Refresh${colors.reset}`);
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest('/api/dashboard/widgets/batch', 'POST', {
        widgetIds: ['stats', 'research-progress', 'recent-papers'],
        forceRefresh: true
      });
      results.batchFiveForceRefresh.push(result.duration);
      console.log(`  Run ${i + 1}: ${formatTime(result.duration, 300)}`);
    } catch (err) {
      results.errors.push(`Batch force refresh test: ${err.message}`);
      console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
    }
  }
}

// Test 5: Invalid Widget ID
async function testInvalidWidget() {
  console.log(`\n${colors.blue}Test 5: Invalid Widget ID (Error Handling)${colors.reset}`);
  
  try {
    const result = await makeRequest('/api/dashboard/widgets/batch', 'POST', {
      widgetIds: ['invalid-widget-id', 'stats']
    });
    results.invalid.push(result.duration);
    const statusColor = result.status === 207 ? colors.green : colors.yellow;
    console.log(`  ${statusColor}Status: ${result.status}${colors.reset} (should be 207)`);
    console.log(`  Duration: ${formatTime(result.duration)}`);
    if (result.body.errors) {
      console.log(`  ${colors.cyan}Errors:${colors.reset} ${JSON.stringify(result.body.errors)}`);
    }
  } catch (err) {
    results.errors.push(`Invalid widget test: ${err.message}`);
    console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
  }
}

// Calculate statistics
function calculateStats(data) {
  if (data.length === 0) return null;
  
  const sorted = [...data].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  return { avg, min, max, p50, p95, p99 };
}

// Print summary
function printSummary() {
  console.log(`\n${colors.blue}=== Performance Summary ===${colors.reset}\n`);

  const tests = [
    {
      name: 'Single Widget (Cache Miss)',
      data: results.singleWidgetMiss,
      target: 300,
      unit: 'ms'
    },
    {
      name: 'Single Widget (Cache Hit)',
      data: results.singleWidgetHit,
      target: 50,
      unit: 'ms'
    },
    {
      name: 'Batch (5 Widgets)',
      data: results.batchFive,
      target: 500,
      unit: 'ms'
    },
    {
      name: 'Batch Force Refresh',
      data: results.batchFiveForceRefresh,
      target: 300,
      unit: 'ms'
    }
  ];

  for (const test of tests) {
    const stats = calculateStats(test.data);
    if (!stats) {
      console.log(`${colors.red}✗ ${test.name}: No data${colors.reset}`);
      continue;
    }

    const passTarget = stats.avg <= test.target;
    const status = passTarget ? `${colors.green}✓${colors.reset}` : `${colors.yellow}⚠${colors.reset}`;

    console.log(`${status} ${test.name}`);
    console.log(`  Avg: ${formatTime(stats.avg, test.target)} (target: <${test.target}ms)`);
    console.log(`  Min: ${formatTime(stats.min)} | Max: ${formatTime(stats.max)}`);
    console.log(`  P50: ${formatTime(stats.p50)} | P95: ${formatTime(stats.p95)} | P99: ${formatTime(stats.p99)}`);
    console.log();
  }

  // Cache effectiveness
  if (results.singleWidgetMiss.length > 0 && results.singleWidgetHit.length > 0) {
    const missAvg = calculateStats(results.singleWidgetMiss).avg;
    const hitAvg = calculateStats(results.singleWidgetHit).avg;
    const improvement = ((missAvg - hitAvg) / missAvg * 100).toFixed(1);
    console.log(`${colors.green}✓ Cache Effectiveness${colors.reset}`);
    console.log(`  Cache miss avg: ${formatTime(missAvg, 300)}`);
    console.log(`  Cache hit avg: ${formatTime(hitAvg, 50)}`);
    console.log(`  Performance improvement: ${improvement}%\n`);
  }

  if (results.errors.length > 0) {
    console.log(`${colors.red}Errors encountered:${colors.reset}`);
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
}

// Main execution
async function main() {
  console.log(`${colors.cyan}🚀 Dashboard Performance Benchmark - Session 13${colors.reset}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Iterations: ${TEST_ITERATIONS} per test\n`);

  try {
    await testSingleWidgetMiss();
    await testSingleWidgetHit();
    await testBatchFive();
    await testBatchForceRefresh();
    await testInvalidWidget();
    
    printSummary();

    // Exit code based on results
    const hasCriticalErrors = results.singleWidgetMiss.length === 0 || results.singleWidgetHit.length === 0;
    process.exit(hasCriticalErrors ? 1 : 0);
  } catch (err) {
    console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
