/**
 * Recent Papers Widget
 * Quick access to most recent papers
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface RecentPapersWidgetProps {
  settings?: WidgetSettings;
}

export const RecentPapersWidget: React.FC<RecentPapersWidgetProps> = ({
  settings = {}
}) => {
  const { count = 5, sortBy = 'date', showPreview = true } = settings as any;

  const recentPapers = [
    { id: 1, title: 'ML in Education', authors: 'Smith et al.', date: '2024-01-15' },
    { id: 2, title: 'AI Ethics Framework', authors: 'Johnson & Lee', date: '2024-01-10' },
    { id: 3, title: 'Climate Modeling', authors: 'Brown et al.', date: '2024-01-05' }
  ].slice(0, count);

  return (
    <div className={styles.widget}>
      <div className={styles.list}>
        {recentPapers.map((paper) => (
          <div key={paper.id} className={styles.listItem}>
            <div className={styles.itemTitle}>{paper.title}</div>
            <div className={styles.itemMeta}>{paper.authors}</div>
            <div className={styles.itemDate}>{paper.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPapersWidget;
