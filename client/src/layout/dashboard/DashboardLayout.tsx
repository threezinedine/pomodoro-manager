import React from 'react';
import { Header } from '../Header';
import styles from './DashboardLayout.module.scss';

interface DashboardLayoutProps {
  /** Left sidebar content — typically TaskList, AddTaskForm, TimerWidget, etc. */
  sidebar: React.ReactNode;
  /** Main area content — typically CalendarView. */
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
}) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Task panel">
          {sidebar}
        </aside>
        <main className={styles.main} aria-label="Calendar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
