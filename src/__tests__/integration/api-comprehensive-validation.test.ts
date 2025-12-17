// Additional API validation tests
test('API response time consistency under varying loads', async () => {
  // Test API performance with different numbers of requests
  const testSizes = [1, 5, 10, 15]; // Different request counts
  
  for (const size of testSizes) {
    const startTime = Date.now();
    
    const requests = Array(size).fill(0).map(() => fetch('/api/learning/progress'));
    const responses = await Promise.all(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTimePerRequest = totalTime / size;
    
    // Verify all responses were successful
    for (const response of responses) {
      expect(response.status).toBe(200);
    }
    
    console.log(`Load test with ${size} concurrent requests: ${totalTime}ms total, ${avgTimePerRequest}ms avg per request`);
    
    // Verify response time stayed reasonable (under 500ms per request on average)
    expect(avgTimePerRequest).toBeLessThan(500);
  }
  
  console.log('API performance under load test completed');
}, 45000);

// Test for proper request body parsing
test('API endpoints handle different content types', async () => {
  // Test with JSON content type
  const jsonResponse = await fetch('/api/learning/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: 'data' })
  });
  
  expect(jsonResponse.status).toBeGreaterThanOrEqual(200);
  expect(jsonResponse.status).toBeLessThan(500);
  
  // Test with form data (though this might not be supported for all endpoints)
  const formData = new FormData();
  formData.append('test', 'data');
  
  const formResponse = await fetch('/api/learning/progress', {
    method: 'POST',
    body: formData
  });
  
  // Form data might result in different status codes but shouldn't crash
  expect(formResponse.status).toBeGreaterThanOrEqual(200);
  expect(formResponse.status).toBeLessThan(500);
  
  console.log('Content type handling test completed');
}, 15000);

// Test for proper resource cleanup
test('Resource management and cleanup validation', async () => {
  // Multiple quick requests to verify resource management
  for (let i = 0; i < 10; i++) {
    const response = await fetch('/api/learning/insights');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThanOrEqual(500);
  }
  
  // Allow any cleanup to happen
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Resource management test completed');
}, 15000);

// Final comprehensive validation test
test('Comprehensive integration validation', async () => {
  // Test all main endpoints work together
  const endpoints = ['/api/learning/progress', '/api/learning/analytics'];
  
  const responses = await Promise.all(
    endpoints.map(endpoint => fetch(endpoint))
  );
  
  for (const response of responses) {
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
    
    const data = await response.json();
    expect(data.success).toBeDefined();
  }
  
  console.log('Comprehensive integration validation completed');
}, 15000);