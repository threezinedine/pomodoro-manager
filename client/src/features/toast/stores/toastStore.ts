import { create } from "zustand";
import type { ToastVariant } from "@/components/Toast";

let nextId = 0;
const genId = () => `toast-${++nextId}`;

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  autoDismiss: number;
}

interface ToastState {
  toasts: ToastItem[];
  add: (variant: ToastVariant, message: string, autoDismiss?: number) => string;
  remove: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  add(variant, message, autoDismiss = 4000) {
    const id = genId();
    const toast: ToastItem = { id, variant, message, autoDismiss };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    return id;
  },

  remove(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clear() {
    set({ toasts: [] });
  },
}));
