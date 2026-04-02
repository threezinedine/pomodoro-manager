import React from "react";
import { createPortal } from "react-dom";
import { useToastStore } from "../stores/toastStore";
import { Toast } from "../../../components/Toast";
import styles from "./ToastViewport.module.scss";

const MAX_VISIBLE = 4;

export const ToastViewport: React.FC = () => {
  const { toasts, remove } = useToastStore();

  const visible = toasts.slice(-MAX_VISIBLE);

  if (visible.length === 0) return null;

  return createPortal(
    <div
      className={styles.viewport}
      aria-live="polite"
      aria-label="Notifications"
    >
      {visible.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          message={toast.message}
          autoDismiss={toast.autoDismiss}
          onDismiss={() => remove(toast.id)}
        />
      ))}
    </div>,
    document.body,
  );
};

export default ToastViewport;
