import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta = {
    title: "Components/Toast",
    component: Toast,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
    args: {
        onDismiss: () => {},
    },
    argTypes: {
        variant: {
            control: "select",
            options: ["success", "error", "info", "warning"],
            description: "Visual type — determines colour and icon",
        },
        autoDismiss: {
            control: { type: "number", min: 0 },
            description: "Auto-dismiss delay in ms. 0 = no auto-dismiss",
        },
    },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
    name: "Variants",
    parameters: {
        docs: {
            description: {
                story: "Four visual types — `success` for confirmations, `error` for failures, `info` for neutral information, and `warning` for cautionary messages.",
            },
        },
    },
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Toast variant="success" message="Task saved successfully." onDismiss={() => {}} />
            <Toast variant="error" message="Failed to save task. Please try again." onDismiss={() => {}} />
            <Toast variant="info" message="Your session will end in 5 minutes." onDismiss={() => {}} />
            <Toast variant="warning" message="Low battery — connect your charger." onDismiss={() => {}} />
        </div>
    ),
};

// ─── Long message ─────────────────────────────────────────────────────────────

export const LongMessage: Story = {
    name: "Long Message",
    parameters: {
        docs: {
            description: {
                story: "Message text wraps naturally and the toast maintains its width. Long words are broken with `word-break: break-word`.",
            },
        },
    },
    render: () => (
        <Toast
            variant="info"
            message="This is a very long notification message that demonstrates how the toast handles wrapping content gracefully without breaking the layout."
            onDismiss={() => {}}
        />
    ),
};

// ─── Light Theme ───────────────────────────────────────────────────────────────

export const LightTheme: Story = {
    name: "Light Theme",
    parameters: {
        docs: {
            description: {
                story: "All four variants rendered on a light surface — demonstrates how translucent tinted backgrounds and the close button adapt to a bright background.",
            },
        },
    },
    render: () => (
        <div
            className="light"
            style={{
                background: "#f0f2f8",
                minHeight: "280px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
            }}
        >
            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                    maxWidth: "480px",
                }}
            >
                <p
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#aaa",
                        margin: 0,
                    }}
                >
                    Light Theme
                </p>
                <Toast variant="success" message="Task saved successfully." onDismiss={() => {}} />
                <Toast variant="error" message="Failed to save task. Please try again." onDismiss={() => {}} />
                <Toast variant="info" message="Your session will end in 5 minutes." onDismiss={() => {}} />
                <Toast variant="warning" message="Low battery — connect your charger." onDismiss={() => {}} />
            </div>
        </div>
    ),
};
