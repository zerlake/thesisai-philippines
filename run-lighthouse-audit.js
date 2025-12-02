#!/usr/bin/env node

/**
 * Lighthouse Audit Runner - Session 13
 * Runs Lighthouse audit on the dashboard
 * 
 * Prerequisites: lighthouse must be installed globally
 * Install with: npm install -g lighthouse
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/';
const OUTPUT_DIR = '.';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

console.log('\n🔍 Lighthouse Audit Runner - Session 13');
console.log('========================================\n');

console.log(`Target URL: ${BASE_URL}`);
console.log(`Output Directory: ${OUTPUT_DIR}`);
console.log(`Timestamp: ${TIMESTAMP}\n`);

try {
  // Check if lighthouse is installed
  try {
    execSync('lighthouse --version', { stdio: 'ignore' });
  } catch (e) {
    console.log('⚠️  Lighthouse not found. Installing...');
    execSync('npm install -g lighthouse', { stdio: 'inherit' });
  }

  // Run Lighthouse audit
  console.log('Running Lighthouse audit...\n');
  
  const reportPath = path.join(OUTPUT_DIR, `lighthouse-report-${TIMESTAMP}`);
  
  const cmd = `lighthouse "${BASE_URL}" --chrome-flags="--headless" --output json --output-path "${reportPath}.json"`;
  
  console.log(`Command: ${cmd}\n`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ Lighthouse audit completed successfully!\n');
    
    // Try to read and parse the report
    const reportFile = `${reportPath}.json`;
    if (fs.existsSync(reportFile)) {
      const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      
      console.log('📊 Lighthouse Scores:');
      console.log('====================\n');
      
      const scores = reportData.categories;
      const metrics = [
        { name: 'Performance', key: 'performance' },
        { name: 'Accessibility', key: 'accessibility' },
        { name: 'Best Practices', key: 'best-practices' },
        { name: 'SEO', key: 'seo' },
        { name: 'PWA', key: 'pwa' }
      ];
      
      metrics.forEach(metric => {
        if (scores[metric.key]) {
          const score = scores[metric.key].score * 100;
          const status = score >= 90 ? '✅' : score >= 70 ? '⚠️ ' : '❌';
          console.log(`${status} ${metric.name}: ${score.toFixed(0)}/100`);
        }
      });
      
      console.log('\n📈 Key Metrics:');
      console.log('===============\n');
      
      if (reportData.audits) {
        const metrics = {
          'first-contentful-paint': 'First Contentful Paint',
          'largest-contentful-paint': 'Largest Contentful Paint',
          'cumulative-layout-shift': 'Cumulative Layout Shift',
          'total-blocking-time': 'Total Blocking Time'
        };
        
        Object.entries(metrics).forEach(([key, label]) => {
          if (reportData.audits[key]) {
            const audit = reportData.audits[key];
            const value = audit.displayValue || audit.result?.displayValue || 'N/A';
            console.log(`📍 ${label}: ${value}`);
          }
        });
      }
      
      console.log(`\n📄 Full report saved to: ${reportFile}`);
      console.log(`📋 HTML report: ${reportPath}.html\n`);
    }
    
  } catch (error) {
    console.error('\n❌ Error running Lighthouse audit:');
    console.error(error.message);
    process.exit(1);
  }
  
} catch (error) {
  console.error('Fatal error:', error.message);
  process.exit(1);
}
