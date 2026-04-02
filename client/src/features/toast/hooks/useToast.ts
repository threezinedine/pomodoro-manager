import { useCallback } from "react";
import { useToastStore } from "../stores/toastStore";
import type { ToastVariant } from "../../../components/Toast";

export const useToast = () => {
  const add = useToastStore((s) => s.add);
  const remove = useToastStore((s) => s.remove);
  const clear = useToastStore((s) => s.clear);

  const toast = useCallback(
    (variant: ToastVariant, message: string, autoDismiss = 4000) => {
      return add(variant, message, autoDismiss);
    },
    [add],
  );

  const dismiss = useCallback((id: string) => remove(id), [remove]);

  return {
    toast,
    dismiss,
    clear,
  };
};
