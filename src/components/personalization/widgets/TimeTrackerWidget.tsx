/**
 * Time Tracker Widget
 * Track time spent on research activities
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface TimeTrackerWidgetProps {
  settings?: WidgetSettings;
}

export const TimeTrackerWidget: React.FC<TimeTrackerWidgetProps> = ({
  settings = {}
}) => {
  const { categories = ['reading', 'writing', 'research'], period = 'week' } = settings as any;

  const timeData = [
    { category: 'reading', hours: 12.5, percentage: 45 },
    { category: 'writing', hours: 8.2, percentage: 30 },
    { category: 'research', hours: 6.3, percentage: 25 }
  ];

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];

  return (
    <div className={styles.widget}>
      <div className={styles.timeTrackerContainer}>
        <div className={styles.trackerHeader}>
          <h3>Time Tracking</h3>
          <span className={styles.period}>This {period}</span>
        </div>

        <div className={styles.timeBreakdown}>
          {timeData.map((item, idx) => (
            <div key={item.category} className={styles.timeItem}>
              <div className={styles.timeItemLeft}>
                <div className={styles.dot} style={{ backgroundColor: colors[idx] }} />
                <div className={styles.label}>{item.category}</div>
              </div>
              <div className={styles.timeItemRight}>
                <div className={styles.hours}>{item.hours}h</div>
                <div className={styles.badge}>{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.totalTime}>
          <span>Total: 27h</span>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackerWidget;
