#!/usr/bin/env node

/**
 * Landing Page Lighthouse Audit
 * Tests the public landing page without auth requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const URL = 'http://localhost:3000/';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const REPORT_FILE = path.join('.', `lighthouse-landing-page-${TIMESTAMP}.json`);

console.log('\n🔍 Landing Page Lighthouse Audit');
console.log('==================================\n');
console.log(`URL: ${URL}`);
console.log(`Report: ${REPORT_FILE}\n`);

try {
  // Install lighthouse if needed
  console.log('Checking Lighthouse installation...');
  try {
    execSync('lighthouse --version', { stdio: 'pipe' });
    console.log('✅ Lighthouse found\n');
  } catch (e) {
    console.log('⚠️  Installing Lighthouse globally...');
    execSync('npm install -g lighthouse', { stdio: 'inherit' });
    console.log('✅ Lighthouse installed\n');
  }

  // Run the audit
  console.log('Running Lighthouse audit...');
  console.log('(This may take 2-3 minutes)\n');

  const cmd = `lighthouse "${URL}" --chrome-flags="--headless=new" --output json --output-path "${REPORT_FILE}" --emulated-form-factor mobile`;
  
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    
    // Parse and display results
    if (fs.existsSync(REPORT_FILE)) {
      console.log('\n✅ Audit Complete!\n');
      
      const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
      displayResults(report);
      
      console.log(`\n📄 Full report: ${REPORT_FILE}\n`);
    }
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  }
} catch (error) {
  console.error('Fatal error:', error.message);
  process.exit(1);
}

function displayResults(report) {
  const categories = report.categories;
  const audits = report.audits;

  // Display scores
  console.log('📊 Lighthouse Scores:');
  console.log('=====================\n');

  const categoryMap = [
    { name: 'Performance', key: 'performance' },
    { name: 'Accessibility', key: 'accessibility' },
    { name: 'Best Practices', key: 'best-practices' },
    { name: 'SEO', key: 'seo' },
    { name: 'PWA', key: 'pwa' }
  ];

  categoryMap.forEach(({ name, key }) => {
    if (categories[key]) {
      const score = Math.round(categories[key].score * 100);
      const status = score >= 90 ? '✅' : score >= 70 ? '⚠️ ' : '❌';
      console.log(`${status} ${name}: ${score}/100`);
    }
  });

  // Display key metrics
  console.log('\n📈 Core Web Vitals:');
  console.log('===================\n');

  const metrics = [
    { id: 'first-contentful-paint', label: 'First Contentful Paint (FCP)', target: '<1.8s' },
    { id: 'largest-contentful-paint', label: 'Largest Contentful Paint (LCP)', target: '<2.5s' },
    { id: 'cumulative-layout-shift', label: 'Cumulative Layout Shift (CLS)', target: '<0.1' },
    { id: 'total-blocking-time', label: 'Total Blocking Time (TBT)', target: '<200ms' },
    { id: 'speed-index', label: 'Speed Index', target: '<3.4s' },
    { id: 'interactive', label: 'Time to Interactive (TTI)', target: '<3.5s' }
  ];

  metrics.forEach(({ id, label, target }) => {
    const audit = audits[id];
    if (audit && audit.displayValue) {
      const value = audit.displayValue;
      const score = audit.score;
      const status = score >= 0.75 ? '✅' : score >= 0.5 ? '⚠️ ' : '❌';
      console.log(`${status} ${label}: ${value} (target: ${target})`);
    }
  });

  // Display opportunities (quick wins)
  console.log('\n💡 Top Opportunities:');
  console.log('====================\n');

  const opportunities = report.categories.performance.auditRefs
    .filter(ref => audits[ref.id] && audits[ref.id].details?.type === 'opportunity')
    .slice(0, 5)
    .map(ref => audits[ref.id])
    .filter(audit => audit && audit.details && audit.details.overallSavingsMs > 0);

  if (opportunities.length > 0) {
    opportunities.forEach((opp, i) => {
      const savings = opp.details.overallSavingsMs || 0;
      if (savings > 0) {
        console.log(`${i + 1}. ${opp.title}`);
        console.log(`   Potential savings: ${savings}ms`);
        console.log(`   ${opp.description}\n`);
      }
    });
  } else {
    console.log('No major opportunities detected.\n');
  }

  // Diagnostics
  console.log('\n🔧 Diagnostic Information:');
  console.log('===========================\n');

  const diagnostics = [
    { id: 'dom-size', label: 'DOM Size' },
    { id: 'network-requests', label: 'Network Requests' },
    { id: 'total-byte-weight', label: 'Total Byte Weight' },
    { id: 'unused-javascript', label: 'Unused JavaScript' }
  ];

  diagnostics.forEach(({ id, label }) => {
    const audit = audits[id];
    if (audit && audit.displayValue) {
      console.log(`${label}: ${audit.displayValue}`);
    }
  });

  console.log('\n');
}
