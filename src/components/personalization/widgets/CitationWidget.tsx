/**
 * Citation Manager Widget
 * Quick access to citations and references
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface CitationWidgetProps {
  settings?: WidgetSettings;
}

export const CitationWidget: React.FC<CitationWidgetProps> = ({
  settings = {}
}) => {
  const { format = 'APA', showCount = true } = settings as any;

  const citationStats = {
    total: 247,
    thisMonth: 34,
    formats: { APA: 247, MLA: 0, Chicago: 0, Harvard: 0 }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.citationContainer}>
        <div className={styles.citationHeader}>
          <h3>Citations</h3>
          {showCount && <span className={styles.count}>{citationStats.total}</span>}
        </div>

        <div className={styles.citationStats}>
          <div className={styles.stat}>
            <div className={styles.label}>Format</div>
            <div className={styles.value}>{format}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>This Month</div>
            <div className={styles.value}>{citationStats.thisMonth}</div>
          </div>
        </div>

        <div className={styles.formatList}>
          {Object.entries(citationStats.formats).map(([fmt, count]) => (
            <div key={fmt} className={`${styles.formatItem} ${fmt === format ? styles.active : ''}`}>
              <span>{fmt}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>

        <button className={styles.actionBtn}>View All</button>
      </div>
    </div>
  );
};

export default CitationWidget;
