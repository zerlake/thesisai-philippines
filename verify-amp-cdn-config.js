#!/usr/bin/env node

/**
 * AMP CDN Configuration Verification Script
 * Validates that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

function check(name, condition, message) {
  if (condition) {
    checks.passed.push(`✓ ${name}`);
  } else {
    checks.failed.push(`✗ ${name}: ${message}`);
  }
}

function warn(message) {
  checks.warnings.push(`⚠ ${message}`);
}

console.log('🔍 Verifying AMP CDN Configuration...\n');

// 1. Check next.config.ts exists and has required properties
console.log('Checking Next.js configuration...');
const nextConfigPath = path.join(__dirname, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
  check('next.config.ts exists', true);
  check('Has headers configuration', nextConfig.includes('headers()'), 'Missing headers() function');
  check('Has rewrites configuration', nextConfig.includes('rewrites()'), 'Missing rewrites() function');
  check('Has CDN_REGIONS config', nextConfig.includes('CDN_REGIONS'), 'Missing CDN_REGIONS configuration');
  check('Has image optimization', nextConfig.includes('images:'), 'Missing image optimization config');
  check('Has experimental config', nextConfig.includes('experimental:'), 'Missing experimental configuration');
} else {
  checks.failed.push('✗ next.config.ts not found');
}

// 2. Check AMP Cache Optimizer library
console.log('\nChecking AMP cache optimizer library...');
const ampOptimizerPath = path.join(__dirname, 'src', 'lib', 'amp-cache-optimizer.ts');
if (fs.existsSync(ampOptimizerPath)) {
  const ampOptimizer = fs.readFileSync(ampOptimizerPath, 'utf-8');
  check('amp-cache-optimizer.ts exists', true);
  check('Has AmpCacheConfig interface', ampOptimizer.includes('AmpCacheConfig'), 'Missing AmpCacheConfig interface');
  check('Has generateAmpCacheHeaders', ampOptimizer.includes('generateAmpCacheHeaders'), 'Missing generateAmpCacheHeaders function');
  check('Has getOptimalRegion', ampOptimizer.includes('getOptimalRegion'), 'Missing getOptimalRegion function');
  check('Has calculateCacheTTL', ampOptimizer.includes('calculateCacheTTL'), 'Missing calculateCacheTTL function');
  check('Has autoTuneConfiguration', ampOptimizer.includes('autoTuneConfiguration'), 'Missing autoTuneConfiguration function');
} else {
  checks.failed.push('✗ src/lib/amp-cache-optimizer.ts not found');
}

// 3. Check CDN Proxy API
console.log('\nChecking CDN proxy API...');
const cdnProxyPath = path.join(__dirname, 'src', 'api', 'cdn-proxy.ts');
if (fs.existsSync(cdnProxyPath)) {
  const cdnProxy = fs.readFileSync(cdnProxyPath, 'utf-8');
  check('cdn-proxy.ts exists', true);
  check('Has CDN_CONFIG', cdnProxy.includes('CDN_CONFIG'), 'Missing CDN_CONFIG');
  check('Has getRegion function', cdnProxy.includes('getRegion'), 'Missing getRegion function');
  check('Has fetchFromCDN function', cdnProxy.includes('fetchFromCDN'), 'Missing fetchFromCDN function');
  check('Has GET handler', cdnProxy.includes('export async function GET'), 'Missing GET handler');
} else {
  checks.failed.push('✗ src/api/cdn-proxy.ts not found');
}

// 4. Check Middleware
console.log('\nChecking middleware...');
const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middleware = fs.readFileSync(middlewarePath, 'utf-8');
  check('middleware.ts exists', true);
  check('Imports amp-cache-optimizer', middleware.includes('amp-cache-optimizer'), 'Missing import from amp-cache-optimizer');
  check('Has middleware function', middleware.includes('export function middleware'), 'Missing middleware export');
  check('Has config export', middleware.includes('export const config'), 'Missing config export');
} else {
  warn('src/middleware.ts not found - middleware is optional');
}

// 5. Check CDN Metrics library
console.log('\nChecking CDN metrics library...');
const metricsPath = path.join(__dirname, 'src', 'lib', 'cdn-metrics.ts');
if (fs.existsSync(metricsPath)) {
  const metrics = fs.readFileSync(metricsPath, 'utf-8');
  check('cdn-metrics.ts exists', true);
  check('Has recordMetric', metrics.includes('recordMetric'), 'Missing recordMetric function');
  check('Has getPerformanceReport', metrics.includes('getPerformanceReport'), 'Missing getPerformanceReport function');
  check('Has getCdnHealthStatus', metrics.includes('getCdnHealthStatus'), 'Missing getCdnHealthStatus function');
  check('Has detectAnomalies', metrics.includes('detectAnomalies'), 'Missing detectAnomalies function');
} else {
  warn('src/lib/cdn-metrics.ts not found - metrics tracking is optional');
}

// 6. Check Metrics API Routes
console.log('\nChecking metrics API routes...');
const metricsRouteDir = path.join(__dirname, 'src', 'app', 'api', 'metrics');
const metricsRoutePath = path.join(metricsRouteDir, 'route.ts');
const healthRoutePath = path.join(metricsRouteDir, 'health', 'route.ts');

if (fs.existsSync(metricsRoutePath)) {
  const metricsRoute = fs.readFileSync(metricsRoutePath, 'utf-8');
  check('/api/metrics route exists', true);
  check('Has GET handler for metrics', metricsRoute.includes('export async function GET'), 'Missing GET handler');
  check('Has POST handler for metrics', metricsRoute.includes('export async function POST'), 'Missing POST handler');
} else {
  warn('src/app/api/metrics/route.ts not found - metrics endpoint is optional');
}

if (fs.existsSync(healthRoutePath)) {
  const healthRoute = fs.readFileSync(healthRoutePath, 'utf-8');
  check('/api/metrics/health route exists', true);
  check('Has GET handler for health', healthRoute.includes('export async function GET'), 'Missing GET handler');
} else {
  warn('src/app/api/metrics/health/route.ts not found - health endpoint is optional');
}

// 7. Check Environment Variables
console.log('\nChecking environment variables...');
const envLocalPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envLocalPath)) {
  const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
  check('.env.local exists', true);
  check('Has CDN_US_PRIMARY', envLocal.includes('CDN_US_PRIMARY'), 'Add CDN_US_PRIMARY to .env.local');
  check('Has CDN_EU_PRIMARY', envLocal.includes('CDN_EU_PRIMARY'), 'Add CDN_EU_PRIMARY to .env.local');
  check('Has CDN_APAC_PRIMARY', envLocal.includes('CDN_APAC_PRIMARY'), 'Add CDN_APAC_PRIMARY to .env.local');
  check('Has AMP_CACHE_ENABLED', envLocal.includes('AMP_CACHE_ENABLED'), 'Add AMP_CACHE_ENABLED to .env.local');
} else {
  warn('.env.local not found - environment variables need to be configured');
}

// 8. Check package.json has required dependencies
console.log('\nChecking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  check('next is installed', !!packageJson.dependencies?.next, 'Next.js not found in dependencies');
  check('react is installed', !!packageJson.dependencies?.react, 'React not found in dependencies');
  check('TypeScript is installed', !!packageJson.devDependencies?.typescript, 'TypeScript not found in devDependencies');
}

// 9. Check documentation exists
console.log('\nChecking documentation...');
const docPath = path.join(__dirname, 'AMP_CDN_CONFIGURATION_GUIDE.md');
if (fs.existsSync(docPath)) {
  check('Documentation exists', true);
} else {
  warn('AMP_CDN_CONFIGURATION_GUIDE.md not found');
}

// 10. Check build configuration
console.log('\nChecking build configuration...');
check('Can build project', fs.existsSync(nextConfigPath), 'Must have next.config.ts to build');

// Print results
console.log('\n' + '='.repeat(50));
console.log('VERIFICATION RESULTS');
console.log('='.repeat(50) + '\n');

if (checks.passed.length > 0) {
  console.log('✓ PASSED CHECKS:');
  checks.passed.forEach(check => console.log('  ' + check));
  console.log();
}

if (checks.warnings.length > 0) {
  console.log('⚠ WARNINGS:');
  checks.warnings.forEach(warn => console.log('  ' + warn));
  console.log();
}

if (checks.failed.length > 0) {
  console.log('✗ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log('  ' + fail));
  console.log();
}

// Summary
const totalChecks = checks.passed.length + checks.failed.length;
const passPercentage = ((checks.passed.length / totalChecks) * 100).toFixed(1);

console.log('='.repeat(50));
console.log(`SUMMARY: ${checks.passed.length}/${totalChecks} checks passed (${passPercentage}%)`);
console.log('='.repeat(50) + '\n');

if (checks.failed.length === 0) {
  console.log('✅ AMP CDN configuration is properly set up!\n');
  process.exit(0);
} else {
  console.log('❌ Please fix the failed checks above.\n');
  process.exit(1);
}
