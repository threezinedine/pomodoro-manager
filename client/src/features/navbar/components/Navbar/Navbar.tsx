import React from 'react';
import { Button } from '../../../../components/Button';
import { Navbar as NavbarComponent } from '../../../../components/Navbar';
import { isAuthenticated, useNavbarStore } from '../../stores/navbarStore';

const StatsIcon = () => (
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
);

const SettingsIcon = () => (
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
);

export const Navbar: React.FC = () => {
    const {
        isStatsOpen,
        isSettingsOpen,
        toggleStats,
        toggleSettings,
        logout,
    } = useNavbarStore();

    const hasToken = isAuthenticated();

    const rightContent = hasToken ? (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleStats}
                leftIcon={<StatsIcon />}
                aria-label={isStatsOpen ? 'Close stats panel' : 'Open stats panel'}
                aria-pressed={isStatsOpen}
                data-active={isStatsOpen || undefined}
            />
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleSettings}
                leftIcon={<SettingsIcon />}
                aria-label={isSettingsOpen ? 'Close settings' : 'Settings'}
                aria-pressed={isSettingsOpen}
                data-active={isSettingsOpen || undefined}
            />
            <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
            </Button>
        </>
    ) : null;

    return <NavbarComponent rightContent={rightContent} />;
};

export default Navbar;