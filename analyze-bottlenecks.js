#!/usr/bin/env node

/**
 * Performance Bottleneck Analyzer
 * Identifies which components/images/scripts are causing performance issues
 */

const fs = require('fs');
const path = require('path');

// Find the latest lighthouse report
function findLatestReport() {
  const files = fs.readdirSync('.')
    .filter(f => f.startsWith('lighthouse-landing-page-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.error('\n❌ No lighthouse reports found. Run audit-landing-page.js first.');
    process.exit(1);
  }
  
  return files[0];
}

const reportFile = findLatestReport();
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const audits = report.audits;

console.log(`\n🔍 Analyzing Bottlenecks from: ${reportFile}\n`);
console.log('='.repeat(60));

// 1. Analyze images
console.log('\n📷 IMAGE ANALYSIS');
console.log('-'.repeat(60));

const unoptimizedImages = audits['unminified-images'];
if (unoptimizedImages && unoptimizedImages.details) {
  console.log(`\n⚠️  Unoptimized Images Found: ${unoptimizedImages.details.items?.length || 0}`);
  if (unoptimizedImages.details.items) {
    unoptimizedImages.details.items.slice(0, 5).forEach(item => {
      console.log(`  • ${item.url}`);
      console.log(`    Size: ${(item.totalBytes / 1024).toFixed(2)}KB | Savings: ${(item.wastedBytes / 1024).toFixed(2)}KB`);
    });
  }
}

// Modern image formats
const modernImageFormats = audits['modern-image-formats'];
if (modernImageFormats && modernImageFormats.details) {
  console.log(`\n📦 Images Not Using Modern Formats: ${modernImageFormats.details.items?.length || 0}`);
  if (modernImageFormats.details.items) {
    modernImageFormats.details.items.slice(0, 3).forEach(item => {
      console.log(`  • ${item.url}`);
      console.log(`    Current: ${item.currentFormat} | Savings: ${(item.savingsInBytes / 1024).toFixed(2)}KB`);
    });
  }
}

// Responsive images
const responsiveImages = audits['responsive-images'];
if (responsiveImages && responsiveImages.details) {
  console.log(`\n⚠️  Responsive Image Issues: ${responsiveImages.details.items?.length || 0}`);
  if (responsiveImages.details.items) {
    responsiveImages.details.items.slice(0, 3).forEach(item => {
      console.log(`  • ${item.url || 'Unknown'}`);
      if (item.wastedBytes) {
        console.log(`    Wasted bytes: ${(item.wastedBytes / 1024).toFixed(2)}KB`);
      }
    });
  }
}

// 2. Analyze JavaScript
console.log('\n\n📜 JAVASCRIPT ANALYSIS');
console.log('-'.repeat(60));

const unusedJs = audits['unused-javascript'];
if (unusedJs && unusedJs.details) {
  console.log(`\n⚠️  Unused JavaScript: ${unusedJs.details.items?.length || 0} items`);
  if (unusedJs.details.items) {
    unusedJs.details.items.slice(0, 5).forEach(item => {
      const url = item.url || '';
      const wastedBytes = item.wastedBytes || 0;
      const percentage = item.wastedPercent || 0;
      console.log(`  • ${url.substring(url.lastIndexOf('/') + 1)}`);
      console.log(`    Wasted: ${(wastedBytes / 1024).toFixed(2)}KB (${percentage.toFixed(0)}%)`);
    });
  }
}

const unusedCss = audits['unused-css-rules'];
if (unusedCss && unusedCss.details) {
  console.log(`\n⚠️  Unused CSS Rules: ${unusedCss.details.items?.length || 0} items`);
  if (unusedCss.details.items) {
    unusedCss.details.items.slice(0, 3).forEach(item => {
      const url = item.url || '';
      const wastedBytes = item.wastedBytes || 0;
      console.log(`  • ${url.substring(url.lastIndexOf('/') + 1)}`);
      console.log(`    Wasted: ${(wastedBytes / 1024).toFixed(2)}KB`);
    });
  }
}

// Long tasks
const longTasks = audits['long-tasks'];
if (longTasks && longTasks.details) {
  console.log(`\n⏱️  Long Tasks Blocking Main Thread: ${longTasks.details.items?.length || 0}`);
  if (longTasks.details.items) {
    longTasks.details.items.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. Duration: ${item.duration}ms`);
      if (item.attribution) {
        console.log(`     Source: ${item.attribution[0]?.name || 'Unknown'}`);
      }
    });
  }
}

// 3. Analyze Network
console.log('\n\n🌐 NETWORK ANALYSIS');
console.log('-'.repeat(60));

const networkRequests = audits['network-requests'];
if (networkRequests && networkRequests.details) {
  console.log(`\n📊 Total Network Requests: ${networkRequests.details.items?.length || 0}`);
  
  const items = networkRequests.details.items || [];
  const totalSize = items.reduce((sum, item) => sum + (item.transferSize || 0), 0);
  console.log(`   Total Transfer Size: ${(totalSize / 1024).toFixed(2)}KB`);
  
  // Group by type
  const byType = {};
  items.forEach(item => {
    const type = item.resourceType || 'unknown';
    if (!byType[type]) byType[type] = { count: 0, size: 0 };
    byType[type].count++;
    byType[type].size += item.transferSize || 0;
  });
  
  console.log('\n   By Type:');
  Object.entries(byType).forEach(([type, data]) => {
    console.log(`     • ${type}: ${data.count} requests (${(data.size / 1024).toFixed(2)}KB)`);
  });
  
  // Largest requests
  console.log('\n   Largest Requests:');
  items
    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
    .slice(0, 5)
    .forEach(item => {
      const name = item.url?.substring(item.url.lastIndexOf('/') + 1) || 'Unknown';
      console.log(`     • ${name}: ${((item.transferSize || 0) / 1024).toFixed(2)}KB`);
    });
}

// 4. Key Metrics Summary
console.log('\n\n⚡ PERFORMANCE METRICS SUMMARY');
console.log('-'.repeat(60));

const metricsToCheck = [
  { id: 'first-contentful-paint', label: 'FCP', target: 1800 },
  { id: 'largest-contentful-paint', label: 'LCP', target: 2500 },
  { id: 'cumulative-layout-shift', label: 'CLS', target: 0.1 },
  { id: 'total-blocking-time', label: 'TBT', target: 200 },
  { id: 'server-response-time', label: 'TTFB', target: 600 }
];

console.log('\nCurrent vs Target:');
metricsToCheck.forEach(({ id, label, target }) => {
  const audit = audits[id];
  if (audit) {
    const value = audit.numericValue || 0;
    const isGood = id === 'cumulative-layout-shift' 
      ? value <= target 
      : value <= target;
    const status = isGood ? '✅' : '❌';
    const diff = id === 'cumulative-layout-shift' 
      ? (value - target).toFixed(3)
      : value - target;
    console.log(`  ${status} ${label}: ${audit.displayValue} (target: ${target} ${id === 'cumulative-layout-shift' ? '' : 'ms'}) ${!isGood ? `+${diff}` : ''}`);
  }
});

// 5. Recommendations
console.log('\n\n💡 TOP RECOMMENDATIONS');
console.log('-'.repeat(60));

const recommendations = [];

if (unoptimizedImages?.details?.items?.length > 0) {
  recommendations.push('1. Optimize/compress images (potential savings: ' + 
    ((unoptimizedImages.details.items.reduce((sum, item) => sum + (item.wastedBytes || 0), 0) / 1024).toFixed(2)) + 'KB)');
}

if (unusedJs?.details?.items?.length > 0) {
  recommendations.push('2. Remove unused JavaScript (potential savings: ' + 
    ((unusedJs.details.items.reduce((sum, item) => sum + (item.wastedBytes || 0), 0) / 1024).toFixed(2)) + 'KB)');
}

if (modernImageFormats?.details?.items?.length > 0) {
  recommendations.push('3. Convert images to modern formats like WebP (potential savings: ' + 
    ((modernImageFormats.details.items.reduce((sum, item) => sum + (item.savingsInBytes || 0), 0) / 1024).toFixed(2)) + 'KB)');
}

if (longTasks?.details?.items?.length > 0) {
  recommendations.push('4. Break up long JavaScript tasks (currently ' + longTasks.details.items.length + ' tasks >50ms)');
}

if (unusedCss?.details?.items?.length > 0) {
  recommendations.push('5. Remove unused CSS rules (potential savings: ' + 
    ((unusedCss.details.items.reduce((sum, item) => sum + (item.wastedBytes || 0), 0) / 1024).toFixed(2)) + 'KB)');
}

recommendations.forEach(rec => console.log(`\n   ${rec}`));

console.log('\n' + '='.repeat(60) + '\n');
