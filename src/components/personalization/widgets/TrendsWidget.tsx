/**
 * Topic Trends Widget
 * See trending topics in research area
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface TrendsWidgetProps {
  settings?: WidgetSettings;
}

export const TrendsWidget: React.FC<TrendsWidgetProps> = ({
  settings = {}
}) => {
  const { timeRange = '30d', metrics = ['citations', 'mentions'], limit = 10 } = settings as any;

  const trends = [
    { topic: 'Machine Learning', trend: '+45%', mentions: 2341, rank: 1 },
    { topic: 'Climate Change', trend: '+32%', mentions: 1891, rank: 2 },
    { topic: 'Quantum Computing', trend: '+28%', mentions: 1456, rank: 3 }
  ].slice(0, limit);

  return (
    <div className={styles.widget}>
      <div className={styles.trendsContainer}>
        <div className={styles.trendsHeader}>
          <h3>Trending Topics</h3>
          <span className={styles.timeRange}>Last {timeRange}</span>
        </div>

        <div className={styles.trendsList}>
          {trends.map((item) => (
            <div key={item.rank} className={styles.trendItem}>
              <div className={styles.trendRank}>#{item.rank}</div>
              <div className={styles.trendContent}>
                <div className={styles.trendTopic}>{item.topic}</div>
                <div className={styles.trendMeta}>{item.mentions} mentions</div>
              </div>
              <div className={`${styles.trendValue} ${item.trend.includes('+') ? styles.positive : ''}`}>
                {item.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsWidget;
