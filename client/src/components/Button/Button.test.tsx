import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies the primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.firstChild).toHaveAttribute('data-variant', 'primary');
  });

  it('applies the correct variant class', () => {
    const { container: c1 } = render(<Button variant="secondary">Secondary</Button>);
    expect(c1.firstChild).toHaveAttribute('data-variant', 'secondary');

    const { container: c2 } = render(<Button variant="ghost">Ghost</Button>);
    expect(c2.firstChild).toHaveAttribute('data-variant', 'ghost');

    const { container: c3 } = render(<Button variant="danger">Danger</Button>);
    expect(c3.firstChild).toHaveAttribute('data-variant', 'danger');
  });

  it('applies the correct size class', () => {
    const { container: c1 } = render(<Button size="sm">Small</Button>);
    expect(c1.firstChild).toHaveAttribute('data-size', 'sm');

    const { container: c2 } = render(<Button size="lg">Large</Button>);
    expect(c2.firstChild).toHaveAttribute('data-size', 'lg');
  });

  it('applies fullWidth class when specified', () => {
    const { container } = render(<Button fullWidth>Wide</Button>);
    expect(container.firstChild).toHaveAttribute('data-fullwidth', 'true');
  });

  it('shows spinner and aria-busy when loading', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('disables the button when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders leftIcon when provided', () => {
    render(<Button leftIcon={<span data-testid="icon">★</span>}>Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders rightIcon when provided', () => {
    render(<Button rightIcon={<span data-testid="icon">★</span>}>Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
