/**
 * Research Calendar Widget
 * View research schedule and deadlines
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface CalendarWidgetProps {
  settings?: WidgetSettings;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  settings = {}
}) => {
  const { eventTypes = ['deadline', 'milestone', 'meeting'], showWeekends = true } = settings as any;

  const upcomingEvents = [
    { id: 1, type: 'deadline', title: 'Paper Submission', date: '2024-02-15' },
    { id: 2, type: 'milestone', title: 'Research Complete', date: '2024-02-20' },
    { id: 3, type: 'meeting', title: 'Team Sync', date: '2024-01-25' }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline': return '#d32f2f';
      case 'milestone': return '#4caf50';
      case 'meeting': return '#2196f3';
      default: return '#999';
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <h3>Upcoming Events</h3>
        </div>

        <div className={styles.eventsList}>
          {upcomingEvents.map((event) => (
            <div key={event.id} className={styles.event}>
              <div
                className={styles.eventDot}
                style={{ backgroundColor: getEventColor(event.type) }}
              />
              <div className={styles.eventContent}>
                <div className={styles.eventTitle}>{event.title}</div>
                <div className={styles.eventDate}>{event.date}</div>
              </div>
              <div className={styles.eventType}>{event.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
