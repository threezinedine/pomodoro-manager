import React from 'react';
import styles from './Spinner.module.scss';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
    /** Size of the spinner */
    size?: SpinnerSize;
    /** Label text for screen readers */
    label?: string;
    /** Additional CSS class */
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    label = 'Loading',
    className = '',
}) => {
    const classes = [styles.spinner, styles[size], className].filter(Boolean).join(' ');

    return (
        <span
            className={classes}
            role="status"
            aria-label={label}
        />
    );
};

export default Spinner;
