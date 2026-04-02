import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders nothing when message is empty', () => {
        const { container } = render(<Toast message="" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when message is undefined', () => {
        const { container } = render(<Toast />);
        expect(container.firstChild).toBeNull();
    });

    it('renders message content', () => {
        render(<Toast message="Hello world" />);
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders with default variant (info)', () => {
        const { container } = render(<Toast message="Test" />);
        expect((container.firstChild as Element).className).toMatch(/_info_/);
    });

    it('applies the success variant class', () => {
        const { container } = render(<Toast variant="success" message="Done" />);
        expect((container.firstChild as Element).className).toMatch(/_success_/);
    });

    it('applies the error variant class', () => {
        const { container } = render(<Toast variant="error" message="Failed" />);
        expect((container.firstChild as Element).className).toMatch(/_error_/);
    });

    it('applies the warning variant class', () => {
        const { container } = render(<Toast variant="warning" message="Watch out" />);
        expect((container.firstChild as Element).className).toMatch(/_warning_/);
    });

    it('has alert role', () => {
        render(<Toast message="Alert!" />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders dismiss button when onDismiss is provided', () => {
        render(<Toast message="Test" onDismiss={vi.fn()} />);
        expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
    });

    it('does NOT render dismiss button when onDismiss is not provided', () => {
        render(<Toast message="Test" />);
        expect(screen.queryByRole('button', { name: /dismiss notification/i })).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
        const onDismiss = vi.fn();
        render(<Toast message="Test" onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
        expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('calls onDismiss after autoDismiss milliseconds', () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        render(<Toast message="Test" onDismiss={onDismiss} autoDismiss={3000} />);

        expect(onDismiss).not.toHaveBeenCalled();
        vi.advanceTimersByTime(3000);
        expect(onDismiss).toHaveBeenCalledOnce();
        vi.useRealTimers();
    });

    it('does NOT auto-dismiss when autoDismiss is 0', () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        render(<Toast message="Test" onDismiss={onDismiss} autoDismiss={0} />);

        vi.advanceTimersByTime(10000);
        expect(onDismiss).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('does NOT auto-dismiss when autoDismiss is undefined', () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        render(<Toast message="Test" onDismiss={onDismiss} />);

        vi.advanceTimersByTime(10000);
        expect(onDismiss).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('cancels auto-dismiss timer on unmount', () => {
        vi.useFakeTimers();
        const onDismiss = vi.fn();
        const { unmount } = render(<Toast message="Test" onDismiss={onDismiss} autoDismiss={5000} />);

        unmount();
        vi.advanceTimersByTime(5000);
        expect(onDismiss).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('renders ReactNode message', () => {
        render(
            <Toast
                message={<strong>Bold text</strong>}
            />
        );
        expect(screen.getByText('Bold text')).toBeInTheDocument();
        expect(screen.getByText('Bold text')).toHaveProperty('tagName', 'STRONG');
    });
});
