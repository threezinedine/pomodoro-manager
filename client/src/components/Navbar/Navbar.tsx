import React from 'react';
import styles from './Navbar.module.scss';

export interface NavbarProps {
    /** Content for the right side of the navbar (icons, buttons, etc.) */
    rightContent?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ rightContent }) => {
    return (
        <header className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <span className={styles.logoIcon} aria-hidden="true">
                    🍅
                </span>
                <h1 className={styles.title}>Pomodoro Manager</h1>
            </div>

            {rightContent && (
                <div className={styles.navbarRight}>{rightContent}</div>
            )}
        </header>
    );
};

export default Navbar;
