import { useState, useEffect } from 'react';
import { getResearchTrends } from '../services/research-trends-service';

type ResearchTrend = {
  title: string;
  year: number;
  citations: number;
  venue: string;
  isOpenAccess: boolean;
  influentialCitations: number;
  authors: string[];
};

type ResearchTrendsData = {
  trends: ResearchTrend[];
  yearlyTrends: Record<string, ResearchTrend[]>;
  totalPapers: number;
  mostCited: ResearchTrend | null;
  averageCitations: number;
};

export const useResearchTrends = (field: string) => {
  const [trends, setTrends] = useState<ResearchTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!field) return;

    const fetchTrends = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getResearchTrends(field);
        setTrends(data);
      } catch (err) {
        console.error('Error fetching research trends:', err);
        setError('Failed to load research trends');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [field]);

  return { trends, isLoading, error };
};