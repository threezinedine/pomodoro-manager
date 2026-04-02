import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
    it('renders children', () => {
        render(
            <Tooltip content="Hint">
                <button>Trigger</button>
            </Tooltip>,
        );
        expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    });

    it('does not show tooltip by default', () => {
        render(
            <Tooltip content="Hint">
                <button>Trigger</button>
            </Tooltip>,
        );
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip when mouse enters and delay elapses', async () => {
        render(
            <Tooltip content="Hint text" showDelay={100}>
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.mouseEnter(screen.getByRole('button'));
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        await new Promise((r) => setTimeout(r, 150));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByRole('tooltip')).toHaveTextContent('Hint text');
    });

    it('hides tooltip when mouse leaves', async () => {
        render(
            <Tooltip content="Hint text" showDelay={50}>
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.mouseEnter(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 80));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();

        fireEvent.mouseLeave(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 20));
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip on focus', async () => {
        render(
            <Tooltip content="Hint text" showDelay={50}>
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.focus(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 80));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on blur', async () => {
        render(
            <Tooltip content="Hint text" showDelay={50}>
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.focus(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 80));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();

        fireEvent.blur(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 20));
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('applies the bottom placement class', async () => {
        render(
            <Tooltip content="Hint" placement="bottom">
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.mouseEnter(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 300));
        expect((screen.getByRole('tooltip') as Element).className).toMatch(/_bottom_/);
    });

    it('renders ReactNode content', async () => {
        render(
            <Tooltip content={<strong>Bold hint</strong>} showDelay={0}>
                <button>Trigger</button>
            </Tooltip>,
        );

        fireEvent.mouseEnter(screen.getByRole('button'));
        await new Promise((r) => setTimeout(r, 20));
        expect(screen.getByText('Bold hint')).toBeInTheDocument();
        expect(screen.getByText('Bold hint')).toHaveProperty('tagName', 'STRONG');
    });
});
