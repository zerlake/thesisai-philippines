# Build script that disables Turbopack to work around Next.js 16 workUnitAsyncStorage issue
$env:NEXT_SKIP_TURBOPACK = '1'
npm run build
