// src/lib/memory-monitor.ts

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly threshold: number;
  private readonly checkInterval: number;
  
  constructor(thresholdMB: number = 1500, checkIntervalMs: number = 30000) { // 30 second checks
    this.threshold = thresholdMB * 1024 * 1024; // Convert to bytes
    this.checkInterval = checkIntervalMs;
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(): void {
    if (this.intervalId) {
      console.log('Memory monitoring already started');
      return;
    }

    console.log(`Starting memory monitoring with ${this.threshold / 1024 / 1024}MB threshold`);
    
    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      
      if (usage.heapUsed > this.threshold) {
        console.warn(`⚠️  High memory usage detected: ${heapUsedMB}MB`);
        console.warn('Attempting automatic garbage collection...');
        
        // Trigger garbage collection if available (in Node.js with --expose-gc)
        if (global.gc) {
          global.gc();
          console.log('✅ Manual garbage collection triggered');
        } else {
          console.warn('⚠️ Garbage collection not available. Make sure to run Node.js with --expose-gc flag.');
        }
      } else {
        console.log(`✅ Memory usage normal: ${heapUsedMB}MB`);
      }
    }, this.checkInterval);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Memory monitoring stopped');
    }
  }

  getCurrentUsage(): { heapUsed: string; heapTotal: string; rss: string } {
    const usage = process.memoryUsage();
    return {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      rss: `${Math.round(usage.rss / 1024 / 1024 * 100) / 100} MB`,
    };
  }
}

// Usage example:
// const monitor = MemoryMonitor.getInstance();
// monitor.startMonitoring();