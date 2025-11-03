// memory.config.ts
export const MEMORY_CONFIG = {
  // Maximum size for in-memory operations (500MB)
  MAX_MEMORY_SIZE: 500 * 1024 * 1024,
  
  // Threshold for switching to disk-based processing
  DISK_PROCESSING_THRESHOLD: 100 * 1024 * 1024,
  
  // Buffer size for streaming operations (10MB)
  STREAM_BUFFER_SIZE: 10 * 1024 * 1024,
  
  // Timeout for memory-intensive operations (30 seconds)
  OPERATION_TIMEOUT: 30000,
};

// Function to check system memory usage
export function checkMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
  };
}