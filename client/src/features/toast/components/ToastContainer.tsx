import React from 'react';
import { useToastStore } from '../stores/toastStore';
import { Toast } from '../../../components/Toast';

const MAX_VISIBLE = 4;

interface ToastContainerProps {
    onRemove?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onRemove }) => {
    const { toasts, remove } = useToastStore();

    const visible = toasts.slice(-MAX_VISIBLE);

    if (visible.length === 0) return null;

    return (
        <div>
            {visible.map((toast) => (
                <Toast
                    key={toast.id}
                    variant={toast.variant}
                    message={toast.message}
                    autoDismiss={toast.autoDismiss}
                    onDismiss={() => {
                        remove(toast.id);
                        onRemove?.(toast.id);
                    }}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
