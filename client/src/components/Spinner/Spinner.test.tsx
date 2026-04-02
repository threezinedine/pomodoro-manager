import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
    it('renders with default size (md)', () => {
        const { container } = render(<Spinner />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies the sm size class', () => {
        const { container } = render(<Spinner size="sm" />);
        expect((container.firstChild as Element).className).toMatch(/_sm_/);
    });

    it('applies the lg size class', () => {
        const { container } = render(<Spinner size="lg" />);
        expect((container.firstChild as Element).className).toMatch(/_lg_/);
    });

    it('has role="status"', () => {
        render(<Spinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('uses the label prop as aria-label', () => {
        render(<Spinner label="Fetching data" />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching data');
    });

    it('uses "Loading" as default aria-label', () => {
        render(<Spinner />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    it('renders inline (span element)', () => {
        const { container } = render(<Spinner />);
        expect(container.firstChild).toHaveProperty('tagName', 'SPAN');
    });
});
