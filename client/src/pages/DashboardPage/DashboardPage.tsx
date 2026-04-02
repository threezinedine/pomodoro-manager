import React from 'react';
import { Button } from '../../components/Button';
import styles from './DashboardPage.module.scss';

const AUTH_KEY = 'auth_token';

export const DashboardPage: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/';
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logoIcon} aria-hidden="true">🍅</span>
          <h1 className={styles.title}>Pomodoro Manager</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">📋</span>
          <h2 className={styles.placeholderTitle}>Dashboard</h2>
          <p className={styles.placeholderText}>
            Dashboard components coming soon — calendar, timer, and task management will appear here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
