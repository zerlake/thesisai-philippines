const http = require('http');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const apiKey = envVars['NEXT_PUBLIC_INTERNAL_API_KEY'];

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/notifications/send-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  }
};

const payload = {
  to: 'zerlake@gmail.com',
  advisorName: 'Dr. Johnson',
  studentName: 'Test Student',
  actionType: 'submission',
  documentTitle: 'Chapter 1 - Introduction',
  message: 'Your document has been submitted for review.',
  actionUrl: 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText: 'Review Now'
};

console.log('\n📧 RESEND EMAIL TEST\n');
console.log('To send this email successfully:');
console.log('');
console.log('Option 1: Verify your domain in Resend');
console.log('  1. Go to: https://resend.com/domains');
console.log('  2. Add and verify: thesisai-philippines.com');
console.log('  3. Or point RESEND_FROM_EMAIL to a verified custom domain');
console.log('');
console.log('Option 2: Use Resend\'s test domain (for development)');
console.log('  1. Update .env.local:');
console.log('     RESEND_FROM_EMAIL=onboarding@resend.dev');
console.log('  2. Restart the dev server');
console.log('');
console.log('-------------------------------------------\n');
console.log('Current configuration:');
console.log(`  From: ${envVars['RESEND_FROM_EMAIL'] || 'noreply@thesisai-philippines.com'}`);
console.log(`  To: zerlake@gmail.com`);
console.log(`  Status: ⚠️  Domain not verified\n`);
