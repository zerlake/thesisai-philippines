#!/bin/bash
# startup-with-gc.sh - Start the application with garbage collection enabled

echo "Starting application with garbage collection and memory limits..."
echo "Current memory limits: $(node -e "console.log('Heap size limit:', require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024, 'MB')")"

# Start the application with GC exposed and memory limits
node --expose-gc --max-old-space-size=8192 --max-semi-space-size=512 --max-old-space-size=8192 ./node_modules/.bin/next dev