import React, { useId } from 'react';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Currently selected value(s) */
  value?: string | string[];
  /** Change handler — receives the new value string (or string[] for multiple) */
  onChange?: (value: string | string[]) => void;
  /** Label text shown above the select */
  label?: string;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Error message — causes error styling */
  error?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Allow multiple selections (for tag selection) */
  multiple?: boolean;
  /** Additional CSS class */
  className?: string;
  /** HTML name attribute */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  disabled = false,
  multiple = false,
  className = '',
  name,
  required = false,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const isMulti = multiple;

  const currentValue = value !== undefined ? (Array.isArray(value) ? value : [value]) : [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange || disabled) return;

    if (isMulti) {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      onChange(selected);
    } else {
      onChange(e.target.value);
    }
  };

  const hasError = Boolean(error);

  const wrapperClasses = [
    styles.wrapper,
    hasError ? styles.hasError : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div className={styles.selectWrapper}>
        <select
          id={id}
          name={name}
          className={styles.select}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          multiple={isMulti}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          aria-required={required}
          data-error={hasError || undefined}
        >
          {!isMulti && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        {!isMulti && (
          <span className={styles.chevron} aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      {hasError && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}

      {/* Selected count for multiple select */}
      {isMulti && currentValue.length > 0 && (
        <span className={styles.selectedCount}>
          {currentValue.length} selected
        </span>
      )}
    </div>
  );
};

export default Select;
