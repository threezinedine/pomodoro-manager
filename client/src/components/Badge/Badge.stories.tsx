import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Status variants ────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: "Variants",
  args: { status: "PENDING" },
  parameters: {
    docs: {
      description: {
        story:
          "Three task-status variants: `PENDING` (amber), `COMPLETED` (green), and `CANCELLED` (red). Each renders a coloured dot alongside the label.",
      },
    },
  },
  render: (_args) => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Badge status="PENDING" />
      <Badge status="COMPLETED" />
      <Badge status="CANCELLED" />
    </div>
  ),
};

// ─── Custom labels ─────────────────────────────────────────────────────────────

export const CustomLabels: Story = {
  name: "Custom Labels",
  args: { status: "PENDING" },
  parameters: {
    docs: {
      description: {
        story:
          "Override the default label text via the `label` prop without changing the colour variant.",
      },
    },
  },
  render: (_args) => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Badge status="PENDING" label="In Progress" />
      <Badge status="COMPLETED" label="Done" />
      <Badge status="CANCELLED" label="Skipped" />
    </div>
  ),
};

// ─── Light theme ───────────────────────────────────────────────────────────────

export const LightTheme: Story = {
  name: "Light Theme",
  args: { status: "PENDING" },
  parameters: {
    docs: {
      description: {
        story:
          "Badge colours render correctly on a light surface — amber, green, and red variants adapt to bright backgrounds.",
      },
    },
  },
  render: (_args) => (
    <div
      className="light"
      style={{
        backgroundColor: "#f0f2f8",
        minHeight: "160px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Badge status="PENDING" />
        <Badge status="COMPLETED" />
        <Badge status="CANCELLED" />
      </div>
    </div>
  ),
};
