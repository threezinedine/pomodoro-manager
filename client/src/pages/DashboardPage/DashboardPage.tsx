import React from 'react';
import { DashboardLayout } from '../../layout';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout
      sidebar={
        <div className={styles.sidebarPlaceholder}>
          <p className={styles.placeholderText}>
            Task panel — Timer, TaskList, and AddTaskForm coming soon.
          </p>
        </div>
      }
    >
      <div className={styles.main}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">📋</span>
          <h2 className={styles.placeholderTitle}>Calendar</h2>
          <p className={styles.placeholderText}>
            Calendar view coming soon — session history and task tracking will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
