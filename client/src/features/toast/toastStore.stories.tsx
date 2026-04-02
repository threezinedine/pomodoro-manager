import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useToast } from "./hooks/useToast";
import { ToastViewport } from "./components/ToastViewport";
import { Button } from "@/components/Button";

const meta = {
  title: "Features/Toast",
  component: ToastViewport,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "ToastViewport is a portal-mounted, fixed-position notification stack. It reads from the Zustand toast store and renders up to 4 toasts at a time.",
      },
    },
  },
} satisfies Meta<typeof ToastViewport>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Demo wrapper ──────────────────────────────────────────────────────────────

const ToastDemo: React.FC = () => {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <ToastViewport />
      <p
        style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}
      >
        Click any button to fire a toast notification.
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => toast("success", "Task saved successfully.")}
        >
          Success
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() =>
            toast("error", "Failed to save task. Please try again.")
          }
        >
          Error
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast("info", "Your session will end in 5 minutes.")}
        >
          Info
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            toast("warning", "Low battery — connect your charger.")
          }
        >
          Warning
        </Button>
      </div>
    </div>
  );
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default",
  render: () => <ToastDemo />,
};
