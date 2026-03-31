import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Full width — stretches to container width */
  fullWidth?: boolean;
  /** Shows a loading spinner and disables interaction */
  loading?: boolean;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      data-variant={variant}
      data-size={size}
      data-fullwidth={fullWidth || undefined}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true" data-testid="spinner" />
      )}
      {leftIcon && !loading && (
        <span className={styles.iconLeft} aria-hidden="true">{leftIcon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {rightIcon && !loading && (
        <span className={styles.iconRight} aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
