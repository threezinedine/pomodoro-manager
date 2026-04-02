/**
 * Format seconds as "mm:ss"
 */
export const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Parse "mm:ss" string back to total seconds
 */
export const parseTimer = (value: string): number => {
    const parts = value.split(':');
    if (parts.length !== 2) return 0;
    const [m, s] = parts.map(Number);
    if (isNaN(m) || isNaN(s) || s < 0 || s >= 60 || m < 0) return 0;
    return m * 60 + s;
};

/**
 * Format a duration in seconds as a human-readable string, e.g. "1h 30m", "45m", "25s"
 */
export const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
};

/**
 * Convert minutes to seconds
 */
export const minutesToSeconds = (min: number): number => min * 60;

/**
 * Clamp seconds to a maximum (e.g. 99:59)
 */
export const clampTimer = (seconds: number, maxSeconds = 5999): number =>
    Math.max(0, Math.min(seconds, maxSeconds));
