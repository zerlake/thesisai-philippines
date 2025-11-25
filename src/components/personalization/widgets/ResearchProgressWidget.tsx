/**
 * Research Progress Widget
 * Displays research progress with visual metrics and trends
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface ResearchProgressWidgetProps {
  settings?: WidgetSettings;
}

export const ResearchProgressWidget: React.FC<ResearchProgressWidgetProps> = ({
  settings = {}
}) => {
  const {
    period = 'month',
    metrics = ['papers_read', 'notes_taken'],
    chartType = 'line'
  } = settings as any;

  // Mock data
  const progressData = {
    papersRead: 24,
    notesTaken: 156,
    completionRate: 68,
    trend: '+12%'
  };

  return (
    <div className={styles.widget}>
      <div className={styles.widgetBody}>
        <div className={styles.stat}>
          <div className={styles.label}>Papers Read</div>
          <div className={styles.value}>{progressData.papersRead}</div>
          <div className={styles.trend}>+5 this {period}</div>
        </div>

        <div className={styles.stat}>
          <div className={styles.label}>Notes Taken</div>
          <div className={styles.value}>{progressData.notesTaken}</div>
          <div className={styles.trend}>+23 this {period}</div>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.label}>Completion Rate</div>
          <div className={styles.barContainer}>
            <div
              className={styles.bar}
              style={{ width: `${progressData.completionRate}%` }}
            />
          </div>
          <div className={styles.percentage}>{progressData.completionRate}%</div>
        </div>

        <div className={styles.chart}>
          <canvas id="progress-chart" />
        </div>
      </div>
    </div>
  );
};

export default ResearchProgressWidget;
