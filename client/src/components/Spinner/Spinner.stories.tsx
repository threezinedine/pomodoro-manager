import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";

const meta = {
    title: "Components/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "Size of the spinner",
        },
    },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
    name: "Sizes",
    parameters: {
        docs: {
            description: {
                story: "Three sizes — `sm` for compact inline contexts, `md` as the default, and `lg` for prominent loading states.",
            },
        },
    },
    render: () => (
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
        </div>
    ),
};

// ─── Sizes light theme ─────────────────────────────────────────────────────────

export const LightTheme: Story = {
    name: "Light Theme",
    parameters: {
        docs: {
            description: {
                story: "Spinner rendered on a light surface — the accent colour adapts via the CSS variable.",
            },
        },
    },
    render: () => (
        <div
            className="light"
            style={{
                background: "#f0f2f8",
                minHeight: "100px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
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
                    alignItems: "center",
                    gap: "20px",
                    width: "100%",
                    maxWidth: "320px",
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
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                </div>
            </div>
        </div>
    ),
};
