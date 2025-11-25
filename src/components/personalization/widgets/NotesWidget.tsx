/**
 * Notes Snapshot Widget
 * Quick snapshot of recent notes
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface NotesWidgetProps {
  settings?: WidgetSettings;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({
  settings = {}
}) => {
  const { count = 5, sortBy = 'updated', groupBy = 'topic' } = settings as any;

  const notes = [
    { id: 1, title: 'ML Paper Notes', content: 'Key insights from recent ML paper...', updated: '2 hours ago' },
    { id: 2, title: 'Research Ideas', content: 'Potential research directions...', updated: '1 day ago' },
    { id: 3, title: 'Literature Review', content: 'Summary of related work...', updated: '3 days ago' }
  ].slice(0, count);

  return (
    <div className={styles.widget}>
      <div className={styles.notesContainer}>
        <div className={styles.notesHeader}>
          <h3>Recent Notes</h3>
        </div>

        <div className={styles.notesList}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteItem}>
              <div className={styles.noteTitle}>{note.title}</div>
              <div className={styles.noteContent}>{note.content}</div>
              <div className={styles.noteTime}>{note.updated}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesWidget;
