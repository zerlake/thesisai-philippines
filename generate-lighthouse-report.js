#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const URL = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';
const OUTPUT_PATH = path.join(__dirname, 'lighthouse-report.html');
const JSON_OUTPUT_PATH = path.join(__dirname, 'lighthouse-report.json');

// Check if Lighthouse is installed
function checkLighthouseInstalled() {
  return new Promise((resolve) => {
    exec('npx lighthouse --version', (error) => {
      if (error) {
        console.error('Lighthouse is not installed globally or in this project.');
        console.log('Please install it using: npm install -g lighthouse');
        console.log('Or add to your project: npm install --save-dev lighthouse');
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Run Lighthouse audit
function runLighthouse() {
  const command = `npx lighthouse ${URL} --output html --output json --output-path "${OUTPUT_PATH.replace(/\.html$/, '')}" --chrome-flags="--headless=new"`;

  console.log('🚀 Starting Lighthouse audit...');
  console.log(`📊 Auditing: ${URL}`);
  console.log(`📁 Output: ${OUTPUT_PATH}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Lighthouse audit failed: ${error.message}`);
      console.error(stderr);
      return;
    }

    console.log('✅ Lighthouse audit completed successfully!');
    console.log(`📄 Report saved as: ${OUTPUT_PATH}`);
    console.log(`📄 JSON report saved as: ${JSON_OUTPUT_PATH}`);
    
    // Also save the JSON version
    exec(`npx lighthouse ${URL} --output json --output-path "${JSON_OUTPUT_PATH.replace(/\.json$/, '')}" --chrome-flags="--headless=new"`, 
      (jsonError, jsonStdout, jsonStderr) => {
        if (jsonError) {
          console.error(`⚠️ Could not create JSON report: ${jsonError.message}`);
        } else {
          console.log(`📄 JSON report saved as: ${JSON_OUTPUT_PATH}`);
        }
        
        console.log('\n🎉 Lighthouse report generation complete!');
        console.log(`\n📋 To view the report, open: ${path.resolve(OUTPUT_PATH)}`);
      }
    );
  });
}

// Main execution
async function main() {
  console.log('🔍 Lighthouse Report Generator');
  console.log('==============================\n');

  const isInstalled = await checkLighthouseInstalled();
  if (!isInstalled) {
    process.exit(1);
  }

  runLighthouse();
}

// Run the main function
main().catch(console.error);