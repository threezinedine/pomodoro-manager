import React from 'react';
import { Header } from '../Header';
import styles from './DashboardLayout.module.scss';

interface DashboardLayoutProps {
  /** Left sidebar content — typically TaskList, AddTaskForm, TimerWidget, etc. */
  sidebar: React.ReactNode;
  /** Main area content — typically CalendarView. */
  children: React.ReactNode;
  /**
   * Optional custom header to render instead of the default Header.
   * When provided, the default Header is not rendered.
   * Use this to pass a stateful Navbar component.
   */
  header?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
  header,
}) => {
  return (
    <div className={styles.layout}>
      {header ?? <Header onLogout={() => {}} />}
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
