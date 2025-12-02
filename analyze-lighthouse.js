#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find the latest lighthouse report
const reportFile = 'lighthouse-report-2025-11-28T02-22-27.json';

if (!fs.existsSync(reportFile)) {
  console.error('Lighthouse report not found');
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(reportFile, 'utf8'));

console.log('\n📊 Lighthouse Audit Analysis - Session 13\n');
console.log('='.repeat(50));

// Overall scores
console.log('\n✨ OVERALL SCORES:');
console.log('='.repeat(50));
const categories = json.categories;
Object.keys(categories).forEach(key => {
  const cat = categories[key];
  const score = Math.round(cat.score * 100);
  const status = score >= 90 ? '✅' : score >= 80 ? '⚠️ ' : score >= 70 ? '⚠️ ' : '❌';
  console.log(`${status} ${cat.title}: ${score}/100`);
});

// Failed audits
console.log('\n\n❌ FAILED AUDITS (Score = 0):');
console.log('='.repeat(50));
const failedAudits = Object.keys(json.audits)
  .filter(k => json.audits[k].score === 0)
  .slice(0, 20);

if (failedAudits.length > 0) {
  failedAudits.forEach(k => {
    const a = json.audits[k];
    console.log(`\n• ${a.title}`);
    if (a.description) {
      const desc = a.description.replace(/<[^>]*>/g, '');
      console.log(`  ${desc.substring(0, 100)}...`);
    }
  });
} else {
  console.log('No failed audits!');
}

// Low scoring audits
console.log('\n\n⚠️  LOW SCORING AUDITS (0 < Score < 0.5):');
console.log('='.repeat(50));
const lowAudits = Object.keys(json.audits)
  .filter(k => json.audits[k].score !== null && json.audits[k].score > 0 && json.audits[k].score < 0.5)
  .sort((a, b) => json.audits[a].score - json.audits[b].score)
  .slice(0, 15);

if (lowAudits.length > 0) {
  lowAudits.forEach(k => {
    const a = json.audits[k];
    const score = Math.round(a.score * 100);
    console.log(`\n• ${a.title} (${score}/100)`);
    if (a.details && a.details.items) {
      const items = a.details.items.slice(0, 2);
      items.forEach(item => {
        if (typeof item === 'string') {
          console.log(`  - ${item}`);
        } else if (item.description) {
          console.log(`  - ${item.description}`);
        }
      });
    }
  });
}

// Passed audits
console.log('\n\n✅ PASSED AUDITS (Score = 1):');
console.log('='.repeat(50));
const passedCount = Object.keys(json.audits)
  .filter(k => json.audits[k].score === 1).length;
console.log(`Total passed: ${passedCount} audits`);

// Performance metrics
console.log('\n\n📈 KEY PERFORMANCE METRICS:');
console.log('='.repeat(50));
const metrics = {
  'first-contentful-paint': 'First Contentful Paint',
  'largest-contentful-paint': 'Largest Contentful Paint',
  'cumulative-layout-shift': 'Cumulative Layout Shift',
  'total-blocking-time': 'Total Blocking Time',
  'speed-index': 'Speed Index'
};

Object.entries(metrics).forEach(([key, label]) => {
  if (json.audits[key]) {
    const audit = json.audits[key];
    const value = audit.displayValue || 'N/A';
    const score = audit.score !== null ? Math.round(audit.score * 100) : 'N/A';
    console.log(`\n${label}`);
    console.log(`  Value: ${value}`);
    console.log(`  Score: ${score}/100`);
  }
});

// Accessibility details
console.log('\n\n♿ ACCESSIBILITY FINDINGS:');
console.log('='.repeat(50));
const a11yAudits = [
  'color-contrast',
  'button-name',
  'image-alt',
  'label',
  'input-image-alt'
];

a11yAudits.forEach(k => {
  if (json.audits[k]) {
    const a = json.audits[k];
    const score = a.score === 1 ? '✅' : a.score === 0 ? '❌' : '⚠️ ';
    console.log(`${score} ${a.title}`);
  }
});

// Recommendations
console.log('\n\n💡 TOP RECOMMENDATIONS:');
console.log('='.repeat(50));
console.log(`
1. Performance (30/100): CRITICAL
   - Largest Contentful Paint is 15.4s (target: <2.5s)
   - Total Blocking Time is 6,550ms (target: <300ms)
   - Main issue: Heavy JavaScript execution during page load

2. Accessibility (84/100): GOOD (Minor issues)
   - 16-point gap from excellent score
   - Review color contrast
   - Ensure all interactive elements are keyboard accessible

3. Best Practices (100/100): EXCELLENT ✅
4. SEO (100/100): EXCELLENT ✅

ACTION ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Profile JavaScript execution - identify blocking scripts
2. Defer non-critical JavaScript
3. Optimize image loading and compression
4. Implement code splitting for dashboard
5. Check color contrast ratios for accessibility
6. Test with screen reader for WCAG AA compliance
`);

console.log('\n');
