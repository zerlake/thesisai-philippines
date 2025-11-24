#!/bin/bash

# Puter AI Paraphraser Integration Tests Runner
# This script runs the Puter connection and paraphrasing tests

set -e

echo "=========================================="
echo "Puter AI Paraphraser Integration Tests"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found${NC}"
    echo "Please run: npm install"
    exit 1
fi

# Check if vitest is installed
if ! npm list vitest > /dev/null 2>&1; then
    echo -e "${RED}Error: vitest not installed${NC}"
    echo "Please run: npm install"
    exit 1
fi

echo -e "${BLUE}Running Puter Paraphraser Integration Tests${NC}"
echo ""

# Run the integration test
npm run test -- __tests__/integration/puter-paraphraser.integration.test.ts --run

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Integration tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open manual test in browser:"
    echo "   Open: __tests__/manual/puter-connection-test.html"
    echo ""
    echo "2. Or use the paraphrasing tool in the app:"
    echo "   Visit: /paraphraser page"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Integration tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure Puter SDK is loaded in the application"
    echo "2. Verify you are authenticated with Puter"
    echo "3. Check browser console for error messages"
    echo "4. Check internet connection"
    echo ""
    exit 1
fi
