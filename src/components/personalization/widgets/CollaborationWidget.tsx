/**
 * Collaboration Widget
 * Quick access to collaboration tools and teammates
 */

'use client';

import React from 'react';
import { WidgetSettings } from '@/lib/personalization/widget-registry';
import styles from '../styles/widgets.module.css';

interface CollaborationWidgetProps {
  settings?: WidgetSettings;
}

export const CollaborationWidget: React.FC<CollaborationWidgetProps> = ({
  settings = {}
}) => {
  const { showMembers = true, maxMembers = 5 } = settings as any;

  const teammates = [
    { id: 1, name: 'Alice Smith', role: 'Lead Researcher' },
    { id: 2, name: 'Bob Johnson', role: 'Data Analyst' },
    { id: 3, name: 'Carol White', role: 'Editor' }
  ].slice(0, maxMembers);

  return (
    <div className={styles.widget}>
      <div className={styles.collaboration}>
        <div className={styles.collaborationHeader}>
          <h3>Teammates</h3>
          <span className={styles.badge}>{teammates.length}</span>
        </div>

        {showMembers && (
          <div className={styles.membersList}>
            {teammates.map((member) => (
              <div key={member.id} className={styles.member}>
                <div className={styles.avatar}>{member.name[0]}</div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{member.name}</div>
                  <div className={styles.memberRole}>{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className={styles.actionBtn}>+ Invite</button>
      </div>
    </div>
  );
};

export default CollaborationWidget;
