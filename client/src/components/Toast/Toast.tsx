import React, { useEffect } from 'react';
import styles from './Toast.module.scss';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    /** Visual type — determines colour and icon */
    variant?: ToastVariant;
    /** Message content */
    message?: React.ReactNode;
    /** Callback when the toast is dismissed (×  button or auto-dismiss) */
    onDismiss?: () => void;
    /** Auto-dismiss delay in ms. 0 or undefined = no auto-dismiss */
    autoDismiss?: number;
    /** Additional CSS class */
    className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const WarningIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2L14.5 13H1.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6V9M8 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const icons: Record<ToastVariant, React.FC> = {
    success: CheckIcon,
    error: ErrorIcon,
    info: InfoIcon,
    warning: WarningIcon,
};

const labels: Record<ToastVariant, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
    warning: 'Warning',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const Toast: React.FC<ToastProps> = ({
    variant = 'info',
    message,
    onDismiss,
    autoDismiss,
    className = '',
}) => {
    useEffect(() => {
        if (!autoDismiss || autoDismiss <= 0) return;
        const timer = setTimeout(() => onDismiss?.(), autoDismiss);
        return () => clearTimeout(timer);
    }, [autoDismiss, onDismiss]);

    if (!message) return null;

    const Icon = icons[variant];

    const classes = [
        styles.toast,
        styles[variant],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            role="alert"
            aria-live="polite"
            aria-label={labels[variant]}
        >
            <span className={styles.icon}>
                <Icon />
            </span>
            <span className={styles.message}>{message}</span>
            {onDismiss && (
                <button
                    type="button"
                    className={styles.dismiss}
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    );
};

export default Toast;
