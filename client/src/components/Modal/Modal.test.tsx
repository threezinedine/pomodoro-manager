import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { Modal } from './Modal';

const MockModal: React.FC<{
    open?: boolean;
    onClose?: () => void;
    title?: string;
    footer?: React.ReactNode;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    children?: React.ReactNode;
}> = ({
    open = true,
    onClose = vi.fn(),
    title = 'Test Modal',
    footer,
    closeOnBackdrop = true,
    closeOnEscape = true,
    children,
}) => (
    <Modal
        open={open}
        onClose={onClose}
        title={title}
        footer={footer}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
    >
        {children ?? 'Modal body content'}
    </Modal>
);

describe('Modal', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders nothing when open is false', () => {
        render(<MockModal open={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog with correct role and aria attributes when open', () => {
        render(<MockModal />);
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders title when provided', () => {
        render(<MockModal title="My Modal" />);
        expect(screen.getByText('My Modal')).toBeInTheDocument();
    });

    it('renders body content', () => {
        render(<MockModal>Custom body text</MockModal>);
        expect(screen.getByText('Custom body text')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
        render(<MockModal footer={<button>Action</button>} />);
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('renders close button with aria-label', () => {
        render(<MockModal />);
        expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<MockModal onClose={onClose} />);
        fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when backdrop is clicked and closeOnBackdrop is true', () => {
        const onClose = vi.fn();
        render(<MockModal onClose={onClose} closeOnBackdrop={true} />);
        fireEvent.click(screen.getByTestId('modal-backdrop'));
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('does NOT call onClose when backdrop is clicked and closeOnBackdrop is false', () => {
        const onClose = vi.fn();
        render(<MockModal onClose={onClose} closeOnBackdrop={false} />);
        fireEvent.click(screen.getByTestId('modal-backdrop'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape is pressed and closeOnEscape is true', () => {
        const onClose = vi.fn();
        render(<MockModal onClose={onClose} closeOnEscape={true} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('does NOT call onClose when Escape is pressed and closeOnEscape is false', () => {
        const onClose = vi.fn();
        render(<MockModal onClose={onClose} closeOnEscape={false} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('sets body overflow to hidden when open', () => {
        render(<MockModal open={true} />);
        expect(document.body.style.overflow).toBe('hidden');
    });
});
