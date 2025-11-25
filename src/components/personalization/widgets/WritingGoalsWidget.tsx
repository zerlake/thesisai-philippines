/**
 * Writing Goals Widget
 * Monitor writing progress and goals
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface WritingGoalsWidgetProps {
  settings?: WidgetSettings;
}

export const WritingGoalsWidget: React.FC<WritingGoalsWidgetProps> = ({
  settings = {}
}) => {
  const { goalType = 'words_per_day', target = 1000, interval = 'daily' } = settings as any;

  const progress = 742;
  const percentage = Math.round((progress / target) * 100);

  return (
    <div className={styles.widget}>
      <div className={styles.widgetBody}>
        <div className={styles.goalHeader}>
          <h3>Today's Goal</h3>
          <span className={styles.interval}>{interval}</span>
        </div>

        <div className={styles.goalProgress}>
          <div className={styles.progressNumber}>
            <span className={styles.current}>{progress}</span>
            <span className={styles.total}>/ {target}</span>
          </div>
          <div className={styles.barContainer}>
            <div
              className={styles.bar}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className={styles.percentage}>{percentage}%</div>
        </div>

        <div className={styles.goalType}>
          <p>{goalType.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default WritingGoalsWidget;
