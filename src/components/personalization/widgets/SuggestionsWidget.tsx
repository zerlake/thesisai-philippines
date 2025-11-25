/**
 * AI Suggestions Widget
 * Get AI-powered suggestions for research
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface SuggestionsWidgetProps {
  settings?: WidgetSettings;
}

export const SuggestionsWidget: React.FC<SuggestionsWidgetProps> = ({
  settings = {}
}) => {
  const { frequency = 'daily', suggestionTypes = ['papers', 'topics', 'collaborators'], limit = 5 } = settings as any;

  const suggestions = [
    { id: 1, type: 'paper', title: 'Recommended: Deep Learning in NLP', relevance: 94 },
    { id: 2, type: 'topic', title: 'Explore: Transformer Architecture', relevance: 87 },
    { id: 3, type: 'collaborator', title: 'Connect with: Dr. Jane Smith', relevance: 82 }
  ].slice(0, limit);

  return (
    <div className={styles.widget}>
      <div className={styles.suggestionsContainer}>
        <div className={styles.suggestionsHeader}>
          <h3>AI Suggestions</h3>
          <span className={styles.frequency}>{frequency}</span>
        </div>

        <div className={styles.suggestionsList}>
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className={styles.suggestionItem}>
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>{suggestion.title}</div>
                <div className={styles.suggestionType}>{suggestion.type}</div>
              </div>
              <div className={styles.relevanceScore}>{suggestion.relevance}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsWidget;
