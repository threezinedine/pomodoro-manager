import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
    describe('rendering', () => {
        it('renders the app logo and title', () => {
            render(<Navbar />);
            expect(screen.getByText('🍅')).toBeInTheDocument();
            expect(screen.getByText('Pomodoro Manager')).toBeInTheDocument();
        });

        it('renders with no right content when rightContent is not provided', () => {
            const { container } = render(<Navbar />);
            expect(container.querySelector('[class*="navbarRight"]')).toBeNull();
        });

        it('renders right content when rightContent is provided', () => {
            render(<Navbar rightContent={<button data-testid="action">Action</button>} />);
            expect(screen.getByTestId('action')).toBeInTheDocument();
        });
    });
});
