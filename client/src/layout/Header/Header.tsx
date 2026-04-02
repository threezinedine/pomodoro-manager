import React, { useCallback } from 'react';
import { Button } from '../../components/Button';
import styles from './Header.module.scss';

const AUTH_KEY = 'auth_token';

interface HeaderProps {
  /** Optional slot for a stats panel toggle button rendered in header right */
  statsToggle?: React.ReactNode;
  /** Optional slot for additional actions in header right */
  extraActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  statsToggle,
  extraActions,
}) => {
  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/';
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.logoIcon} aria-hidden="true">
          🍅
        </span>
        <h1 className={styles.title}>Pomodoro Manager</h1>
      </div>

      <div className={styles.headerRight}>
        {statsToggle}
        {extraActions}
        <button
          className={styles.settingsButton}
          aria-label="Settings"
          title="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Header;
