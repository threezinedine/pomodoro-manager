import React, { useState, useRef } from 'react';
import styles from './Tooltip.module.scss';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    /** Content that triggers the tooltip */
    children: React.ReactNode;
    /** Tooltip text */
    content: React.ReactNode;
    /** Where the tooltip appears relative to the trigger */
    placement?: TooltipPlacement;
    /** Delay before showing (ms) */
    showDelay?: number;
    /** Additional CSS class on the trigger wrapper */
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    placement = 'top',
    showDelay = 200,
    className = '',
}) => {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
        timerRef.current = setTimeout(() => setVisible(true), showDelay);
    };

    const hide = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setVisible(false);
    };

    return (
        <span
            className={[styles.wrapper, className].filter(Boolean).join(' ')}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {visible && (
                <span
                    className={[styles.tooltip, styles[placement]].join(' ')}
                    role="tooltip"
                >
                    {content}
                </span>
            )}
        </span>
    );
};

export default Tooltip;
