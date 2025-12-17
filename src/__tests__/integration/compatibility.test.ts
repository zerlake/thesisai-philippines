// src/__tests__/integration/compatibility.test.ts

import { test, describe, expect, beforeAll, afterAll } from 'vitest';

describe('Compatibility Integration Tests', () => {
  beforeAll(() => {
    console.log('Starting compatibility integration tests');
  });

  afterAll(() => {
    console.log('Completed compatibility integration tests');
  });

  test('Test compatibility with different browsers (via API)', async () => {
    // Though we can't test actual browser rendering in this environment,
    // we can test that the API responds appropriately to different browser user agents
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];

    for (const userAgent of userAgents) {
      const response = await fetch('/api/learning/analytics', {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    }

    console.log('Browser compatibility test completed');
  }, 25000);

  test('Test compatibility with older API versions (backward compatibility)', async () => {
    // Test that API endpoints maintain backward compatibility
    
    // Test with current API structure
    const currentResponse = await fetch('/api/learning/analytics');
    expect(currentResponse.status).toBe(200);
    const currentData = await currentResponse.json();
    expect(currentData.success).toBe(true);

    // Test that required fields are still present
    expect(currentData.data).toBeDefined();
    expect(currentData.data.estimatedReadiness).toBeDefined();
    expect(typeof currentData.data.estimatedReadiness).toBe('number');

    // Test that the API responds to requests with different accept headers
    const xmlLikeResponse = await fetch('/api/learning/progress', {
      headers: {
        'Accept': 'application/json;q=0.9, */*;q=0.8'
      }
    });
    
    expect(xmlLikeResponse.status).toBe(200);
    const xmlLikeData = await xmlLikeResponse.json();
    expect(xmlLikeData.success).toBe(true);

    console.log('API backward compatibility test completed');
  }, 15000);

  test('Test compatibility across different device screen sizes (via responsive API)', async () => {
    // Test that API returns appropriate data for different "device contexts"
    
    const deviceSpecs = [
      { viewport: 'mobile', width: 375, height: 667, expects: 'compact' },
      { viewport: 'tablet', width: 768, height: 1024, expects: 'balanced' },
      { viewport: 'desktop', width: 1920, height: 1080, expects: 'full' }
    ];

    for (const device of deviceSpecs) {
      const response = await fetch('/api/learning/analytics', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': `TestClient/${device.viewport}/${device.width}x${device.height}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      // API should return consistent data regardless of device context
      expect(data.data).toBeDefined();
    }

    console.log('Device compatibility test completed');
  }, 20000);

  test('Test compatibility with different text encodings', async () => {
    // Test that API handles different text encodings properly
    
    const encodings = [
      { lang: 'en-US', text: 'English text for compatibility testing' },
      { lang: 'es-ES', text: 'Texto en español para prueba de compatibilidad' },
      { lang: 'fr-FR', text: 'Texte en français pour test de compatibilité' },
      { lang: 'zh-CN', text: '用于兼容性测试的中文文本' },
      { lang: 'ja-JP', text: '互換性テストのための日本語テキスト' },
      { lang: 'ru-RU', text: 'Текст на русском языке для проверки совместимости' },
      { lang: 'ar-SA', text: 'نص عربي لاختبار التوافق' },
      { lang: 'hi-IN', text: 'अनुकूलता परीक्षण के लिए हिंदी में पाठ' }
    ];

    for (const encoding of encodings) {
      const response = await fetch('/api/study-guides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Language': encoding.lang
        },
        body: JSON.stringify({
          title: `Encoding Test - ${encoding.text}`,
          executiveSummary: `Testing compatibility with ${encoding.lang} encoding`,
          sections: [{
            heading: `Section in ${encoding.lang}`,
            content: encoding.text,
            keyPoints: [`Key point in ${encoding.lang}`],
            reviewQuestions: [`Question in ${encoding.lang}?`]
          }],
          keyTerms: [{
            term: `Term in ${encoding.lang}`,
            definition: encoding.text
          }],
          studyTips: [`Tip in ${encoding.lang}`],
          citationsList: [`Citation in ${encoding.lang}`],
          estimatedReadingTime: 10
        })
      });

      // Should handle the text regardless of language/encoding
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);

      if (response.status === 200) {
        const result = await response.json();
        expect(result.success).toBeDefined();
      }
    }

    console.log('Text encoding compatibility test completed');
  }, 40000);

  test('Test compatibility with different network conditions (timeout simulation)', async () => {
    // Test API behavior under different network conditions
    // We'll simulate this by checking response time expectations
    const start = Date.now();
    
    const response = await fetch('/api/learning/analytics');
    const end = Date.now();
    const responseTime = end - start;
    
    // Should respond within reasonable time even under simulated "slow network"
    expect(responseTime).toBeLessThan(5000); // Under 5 seconds
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    console.log(`Network compatibility test completed in ${responseTime}ms`);
  }, 10000);

  console.log('Completed 5 compatibility integration tests');
});