import React from 'react';
import { Button } from '../../components/Button';
import styles from './Header.module.scss';

export interface HeaderProps {
  /** Called when the user clicks Sign Out */
  onLogout: () => void;
  /** Called when the user clicks the stats toggle */
  onToggleStats?: () => void;
  /** Called when the user clicks the settings button */
  onToggleSettings?: () => void;
  /** Whether the stats panel is currently open */
  isStatsOpen?: boolean;
  /** Whether the settings panel is currently open */
  isSettingsOpen?: boolean;
  /** Optional slot rendered between logo and the right group */
  extraActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  onToggleStats,
  onToggleSettings,
  isStatsOpen = false,
  isSettingsOpen = false,
  extraActions,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.logoIcon} aria-hidden="true">
          🍅
        </span>
        <h1 className={styles.title}>Pomodoro Manager</h1>
      </div>

      <div className={styles.headerRight}>
        {extraActions}
        {onToggleStats && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleStats}
            aria-label={isStatsOpen ? 'Close stats panel' : 'Open stats panel'}
            aria-pressed={isStatsOpen}
            data-active={isStatsOpen || undefined}
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
              width="18"
              height="18"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
        )}
        {onToggleSettings && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleSettings}
            aria-label={isSettingsOpen ? 'Close settings' : 'Settings'}
            aria-pressed={isSettingsOpen}
            data-active={isSettingsOpen || undefined}
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
              width="18"
              height="18"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Header;

