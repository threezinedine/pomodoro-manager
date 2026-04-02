import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders PENDING status by default with default label', () => {
    render(<Badge status="PENDING" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'pending');
  });

  it('renders COMPLETED status with default label', () => {
    render(<Badge status="COMPLETED" />);
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'completed');
  });

  it('renders CANCELLED status with default label', () => {
    render(<Badge status="CANCELLED" />);
    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'cancelled');
  });

  it('uses custom label when provided', () => {
    render(<Badge status="PENDING" label="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });

  it('applies the correct status class', () => {
    const { container: pending } = render(<Badge status="PENDING" />);
    expect((pending.firstChild as Element)?.className).toContain('pending');

    const { container: completed } = render(<Badge status="COMPLETED" />);
    expect((completed.firstChild as Element)?.className).toContain('completed');

    const { container: cancelled } = render(<Badge status="CANCELLED" />);
    expect((cancelled.firstChild as Element)?.className).toContain('cancelled');
  });

  it('renders the dot element', () => {
    render(<Badge status="COMPLETED" />);
    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <Badge status="PENDING" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders no duplicate text for COMPLETED/CANCELLED default labels', () => {
    const { container } = render(<Badge status="COMPLETED" />);
    const spans = container.querySelectorAll('span');
    // label span + dot span = 2 spans
    expect(spans.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
