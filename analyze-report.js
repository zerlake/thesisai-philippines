#!/usr/bin/env node

const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lighthouse-report-2025-11-28T02-22-27.json', 'utf8'));

console.log('\n📊 Lighthouse Report Summary\n');
console.log(`URL: ${report.finalDisplayedUrl}\n`);

const categories = report.categories;
const categoryScores = [
  { name: 'Performance', key: 'performance' },
  { name: 'Accessibility', key: 'accessibility' },
  { name: 'Best Practices', key: 'best-practices' },
  { name: 'SEO', key: 'seo' },
  { name: 'PWA', key: 'pwa' }
];

console.log('Scores:');
categoryScores.forEach(({ name, key }) => {
  if (categories[key]) {
    const score = Math.round(categories[key].score * 100);
    const status = score >= 90 ? '✅' : score >= 70 ? '⚠️ ' : '❌';
    console.log(`  ${status} ${name}: ${score}/100`);
  }
});

console.log('\nKey Metrics:');
const audits = report.audits;
const metrics = [
  { id: 'first-contentful-paint', label: 'FCP' },
  { id: 'largest-contentful-paint', label: 'LCP' },
  { id: 'speed-index', label: 'Speed Index' },
  { id: 'total-blocking-time', label: 'Total Blocking Time' },
  { id: 'cumulative-layout-shift', label: 'CLS' },
  { id: 'interactive', label: 'Time to Interactive' }
];

metrics.forEach(({ id, label }) => {
  const audit = audits[id];
  if (audit && audit.displayValue) {
    console.log(`  📍 ${label}: ${audit.displayValue}`);
  }
});

console.log('\n');
