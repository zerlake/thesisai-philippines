#!/usr/bin/env node

/**
 * Load Testing Script - Session 14
 * Tests dashboard performance under concurrent user load
 * Tests: 100, 500, 1000 concurrent users
 */

const http = require('http');

class LoadTester {
  constructor(url, scenarios = [100, 500, 1000]) {
    this.url = new URL(url);
    this.scenarios = scenarios;
    this.results = [];
  }

  async makeRequest() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.request(this.url, {
        method: 'GET',
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            duration,
            size: data.length,
            success: res.statusCode === 200
          });
        });
      });

      req.on('error', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: 0,
          duration,
          size: 0,
          success: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        resolve({
          statusCode: 0,
          duration,
          size: 0,
          success: false
        });
      });

      req.end();
    });
  }

  async runScenario(concurrentUsers, duration = 30) {
    console.log(`\n🔄 Running load test: ${concurrentUsers} concurrent users (${duration}s)`);
    console.log('═'.repeat(60));

    const startTime = Date.now();
    const requests = [];
    let completed = 0;
    let failed = 0;
    const responseTimes = [];

    // Spawn concurrent requests
    const spawnRate = concurrentUsers / 5; // Ramp up over 5 seconds
    const interval = setInterval(async () => {
      if (Date.now() - startTime > duration * 1000) {
        clearInterval(interval);
        return;
      }

      for (let i = 0; i < spawnRate; i++) {
        const promise = this.makeRequest().then(result => {
          completed++;
          if (result.success) {
            responseTimes.push(result.duration);
          } else {
            failed++;
          }
          return result;
        });
        requests.push(promise);
      }
    }, 1000);

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, (duration + 5) * 1000));

    // Analyze results
    const successful = completed - failed;
    const avgTime = responseTimes.length > 0 
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 0;
    const minTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    const p95 = responseTimes.length > 0 
      ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)] 
      : 0;

    const result = {
      users: concurrentUsers,
      totalRequests: completed,
      successful,
      failed,
      successRate: (successful / completed * 100).toFixed(2),
      avgResponseTime: avgTime,
      minResponseTime: minTime,
      maxResponseTime: maxTime,
      p95ResponseTime: p95,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);

    // Display results
    console.log(`\n📊 Results for ${concurrentUsers} concurrent users:`);
    console.log(`   Total Requests: ${completed}`);
    console.log(`   Successful: ${successful} (${result.successRate}%)`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Avg Response Time: ${avgTime}ms`);
    console.log(`   Min Response Time: ${minTime}ms`);
    console.log(`   Max Response Time: ${maxTime}ms`);
    console.log(`   P95 Response Time: ${p95}ms`);

    const status = result.successRate >= 95 ? '✅' : '⚠️ ';
    console.log(`\n${status} Success Rate: ${result.successRate}%`);

    return result;
  }

  async runAll() {
    console.log('\n🚀 Load Testing Dashboard');
    console.log('═'.repeat(60));
    console.log(`Target: ${this.url.href}`);
    console.log(`Scenarios: ${this.scenarios.join(', ')} concurrent users\n`);

    for (const users of this.scenarios) {
      await this.runScenario(users);
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n\n📈 LOAD TEST SUMMARY');
    console.log('═'.repeat(60));

    const table = [
      ['Users', 'Requests', 'Success %', 'Avg (ms)', 'P95 (ms)'],
      ['─'.repeat(8), '─'.repeat(10), '─'.repeat(11), '─'.repeat(10), '─'.repeat(10)]
    ];

    this.results.forEach(r => {
      table.push([
        r.users.toString().padEnd(8),
        r.totalRequests.toString().padEnd(10),
        r.successRate.padEnd(11),
        r.avgResponseTime.padEnd(10),
        r.p95ResponseTime.toString().padEnd(10)
      ]);
    });

    table.forEach(row => console.log(row.join(' | ')));

    console.log('\n📋 Interpretation:');
    console.log('• Success Rate should be 95%+ for production readiness');
    console.log('• Avg response time should stay under 1000ms');
    console.log('• P95 shows real-world user experience at peak\n');

    // Save results
    const fs = require('fs');
    fs.writeFileSync(
      'SESSION_14_LOAD_TEST_RESULTS.json',
      JSON.stringify(this.results, null, 2)
    );
    console.log('✅ Results saved: SESSION_14_LOAD_TEST_RESULTS.json\n');
  }
}

// Main execution
const target = process.argv[2] || 'http://localhost:3000/dashboard';
const tester = new LoadTester(target, [100, 500, 1000]);

tester.runAll().catch(console.error);
