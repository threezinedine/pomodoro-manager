/**
 * Format a Date object as "Mon, Jan 1"
 */
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a Date object as "Jan 1, 2026"
 */
export const formatDateLong = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Check if two dates are the same calendar day (YYYY-MM-DD)
 */
export const isSameDay = (a: Date, b: Date): boolean => {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

/**
 * Return the start of the given date's day (00:00:00)
 */
export const startOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
