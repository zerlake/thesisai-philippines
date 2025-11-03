import { getResearchTrends } from '../../services/research-trends-service';
import 'dotenv/config';

describe('Research Trends Service - Integration Test', () => {
  // This test calls the live Semantic Scholar API and will be skipped if the API key is not available.
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  const itif = apiKey ? it : it.skip;

  itif('should fetch real research trends from Semantic Scholar API', async () => {
    // Arrange
    const fieldOfStudy = 'machine learning';
    
    // Act
    const result = await getResearchTrends(fieldOfStudy);

    // Assert
    expect(result).toBeDefined();
    expect(result.trends).toBeInstanceOf(Array);
    expect(result.trends.length).toBeGreaterThan(0);

    const firstTrend = result.trends[0];
    expect(firstTrend).toHaveProperty('title');
    expect(firstTrend).toHaveProperty('year');
    expect(firstTrend).toHaveProperty('citations');
    expect(firstTrend).toHaveProperty('venue');
    expect(firstTrend).toHaveProperty('isOpenAccess');
    expect(firstTrend).toHaveProperty('influentialCitations');

    expect(result.totalPapers).toBeGreaterThan(0);
    expect(result.mostCited).toBeDefined();
    expect(result.averageCitations).toBeGreaterThan(0);
    expect(result.hottestTopics).toBeInstanceOf(Array);
    expect(result.emergingTrends).toBeInstanceOf(Array);

  }, 20000); // Increase timeout for live API call
});
