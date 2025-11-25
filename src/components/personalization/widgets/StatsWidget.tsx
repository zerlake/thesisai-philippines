/**
 * Quick Stats Widget
 * Display key statistics at a glance
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface StatsWidgetProps {
  settings?: WidgetSettings;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  settings = {}
}) => {
  const stats = [
    { label: 'Total Papers', value: '156', icon: '📄' },
    { label: 'Total Notes', value: '2,341', icon: '📝' },
    { label: 'Completion Rate', value: '68%', icon: '✓' }
  ];

  return (
    <div className={styles.widget}>
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.icon}>{stat.icon}</div>
            <div className={styles.label}>{stat.label}</div>
            <div className={styles.value}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsWidget;
