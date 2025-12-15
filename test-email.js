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
console.log('Using API Key from .env.local');

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

console.log('\nSending email to: zerlake@gmail.com');
console.log('-----------------------------------\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\nResponse:');
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✓ Email sent successfully!');
      } else {
        console.log('\n✗ Email failed to send');
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(JSON.stringify(payload));
req.end();
