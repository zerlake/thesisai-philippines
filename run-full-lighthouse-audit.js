#!/usr/bin/env node

/**
 * Full Lighthouse Audit Runner
 * Tests both landing page and authenticated dashboard
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LANDING_URL = 'http://localhost:3000/';
const DASHBOARD_URL = 'http://localhost:3000/dashboard';
const OUTPUT_DIR = '.';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

console.log('\n🔍 Full Lighthouse Audit - Landing Page & Dashboard');
console.log('=====================================================\n');

// Function to run a single audit
async function runAudit(url, name) {
  return new Promise((resolve) => {
    console.log(`\n📍 Auditing: ${name}`);
    console.log(`   URL: ${url}\n`);

    try {
      // Check if lighthouse is installed
      try {
        execSync('lighthouse --version', { stdio: 'ignore' });
      } catch (e) {
        console.log('⚠️  Installing Lighthouse...');
        execSync('npm install -g lighthouse', { stdio: 'inherit' });
      }

      const reportPath = path.join(OUTPUT_DIR, `lighthouse-${name.toLowerCase().replace(/\s+/g, '-')}-${TIMESTAMP}`);
      const cmd = `lighthouse "${url}" --chrome-flags="--headless" --output json --output-path "${reportPath}.json"`;

      console.log(`Running: ${cmd}\n`);
      
      try {
        execSync(cmd, { stdio: 'inherit' });
        
        // Read and display results
        const reportFile = `${reportPath}.json`;
        if (fs.existsSync(reportFile)) {
          const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
          
          console.log(`\n✅ ${name} Audit Complete`);
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
          
          console.log('\nKey Metrics:');
          if (reportData.audits) {
            const auditMetrics = {
              'first-contentful-paint': 'FCP',
              'largest-contentful-paint': 'LCP',
              'speed-index': 'Speed Index',
              'total-blocking-time': 'Total Blocking Time',
              'cumulative-layout-shift': 'CLS',
              'interactive': 'Time to Interactive'
            };
            
            Object.entries(auditMetrics).forEach(([key, label]) => {
              if (reportData.audits[key]) {
                const audit = reportData.audits[key];
                const value = audit.displayValue || 'N/A';
                console.log(`  📍 ${label}: ${value}`);
              }
            });
          }
          
          console.log(`\n📄 Full report: ${reportFile}`);
          console.log(`📋 HTML report: ${reportPath}.html\n`);
        }
        
        resolve(true);
      } catch (error) {
        console.error(`\n❌ Error running audit for ${name}:`);
        console.error(error.message);
        resolve(false);
      }
    } catch (error) {
      console.error('Fatal error:', error.message);
      resolve(false);
    }
  });
}

// Main execution
async function main() {
  console.log('Starting audits...\n');
  
  // Run landing page audit
  const landingResult = await runAudit(LANDING_URL, 'Landing Page');
  
  // Wait a bit between audits
  console.log('\n⏳ Waiting 10 seconds before dashboard audit...\n');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Run dashboard audit
  const dashboardResult = await runAudit(DASHBOARD_URL, 'Dashboard');
  
  console.log('\n\n📊 Audit Summary');
  console.log('================');
  console.log(`Landing Page: ${landingResult ? '✅ Complete' : '❌ Failed'}`);
  console.log(`Dashboard:    ${dashboardResult ? '✅ Complete' : '❌ Failed'}`);
  console.log('\nCheck the generated reports for detailed analysis.\n');
}

main().catch(console.error);
