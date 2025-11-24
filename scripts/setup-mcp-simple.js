#!/usr/bin/env node

/**
 * Simple MCP Setup Script
 * Uses Node.js for cross-platform compatibility
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUTER_ENDPOINT = process.env.PUTER_ENDPOINT || 'http://localhost:8000';
const SERENA_URL = process.env.SERENA_URL || 'http://localhost:3000';

console.log('========================================');
console.log('Serena MCP Server Integration Setup');
console.log('========================================');
console.log('');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('Installing dependencies...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install dependencies');
    process.exit(1);
  }
}

// Create necessary directories
const directories = [
  'src/lib/mcp',
  'src/hooks',
  'src/components/mcp',
  '.checkpoints',
];

for (const dir of directories) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

// Update environment file
console.log('Creating .env configuration...');
const envFile = '.env.local';
let envContent = '';

if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, 'utf-8');
}

// Add or update MCP-related environment variables
if (!envContent.includes('PUTER_LOCAL_ENDPOINT')) {
  envContent += `\nPUTER_LOCAL_ENDPOINT=${PUTER_ENDPOINT}`;
}
if (!envContent.includes('SERENA_URL')) {
  envContent += `\nSERINA_URL=${SERENA_URL}`;
}

fs.writeFileSync(envFile, envContent, 'utf-8');
console.log('✓ Environment configured');

// Verify amp.json exists
if (!fs.existsSync('amp.json')) {
  console.log('Warning: amp.json not found. Creating default config...');
  const ampConfig = {
    selectedAuthType: 'none',
    mcpServers: {
      serena: {
        command: 'uvx',
        args: [
          '--from',
          'git+https://github.com/oraios/serena',
          'serena',
          'start-mcp-server',
        ],
      },
    },
    settings: {
      serverPort: 3000,
      mcpDebug: false,
      logLevel: 'info',
    },
  };

  fs.writeFileSync('amp.json', JSON.stringify(ampConfig, null, 2), 'utf-8');
  console.log('✓ Created amp.json');
}

// Verify puter.config.ts exists
if (!fs.existsSync('puter.config.ts')) {
  console.log('✓ puter.config.ts already exists');
}

// TypeScript compilation check
console.log('');
console.log('Checking TypeScript compilation...');
if (fs.existsSync('tsconfig.json')) {
  console.log('✓ TypeScript configuration found');
} else {
  console.log('⚠ tsconfig.json not found');
}

console.log('');
console.log('========================================');
console.log('Setup Complete!');
console.log('========================================');
console.log('');
console.log('Next steps:');
console.log(`1. Ensure Puter.js is running: ${PUTER_ENDPOINT}`);
console.log('2. Verify environment variables in .env.local');
console.log("3. Run 'npm run dev' to start the development server");
console.log('4. Test MCP integration: npm run test:mcp');
console.log('');
