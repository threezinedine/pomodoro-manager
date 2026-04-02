import React from 'react';
import styles from './Badge.module.scss';

export type BadgeStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface BadgeProps {
  /** Task status — determines color and label. Defaults to PENDING. */
  status?: BadgeStatus;
  /** Optional custom label. Defaults to the status value. */
  label?: string;
  /** Optional extra classes */
  className?: string;
}

const DEFAULT_LABELS: Record<BadgeStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const Badge: React.FC<BadgeProps> = ({
  status = 'PENDING',
  label,
  className = '',
}) => {
  const displayLabel = label ?? DEFAULT_LABELS[status];

  const classes = [styles.badge, styles[status.toLowerCase()], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-status={status.toLowerCase()}>
      <span className={styles.dot} aria-hidden="true" data-testid="dot" />
      {displayLabel}
    </span>
  );
};

export default Badge;
