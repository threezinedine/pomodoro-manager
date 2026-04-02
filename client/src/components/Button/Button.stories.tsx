import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
      description: "Visual style of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button",
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Variants ──────────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: "Variants",
  parameters: {
    docs: {
      description: {
        story:
          "Four visual variants: `primary` for the main action, `secondary` for alternatives, `ghost` for tertiary actions, and `danger` for destructive operations.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes",
  parameters: {
    docs: {
      description: {
        story:
          "Three sizes — `sm` for compact contexts, `md` as the default, and `lg` for prominent actions.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ─── States ────────────────────────────────────────────────────────────────────

export const States: Story = {
  name: "States",
  parameters: {
    docs: {
      description: {
        story:
          "Interactive states — `loading` shows a spinner and disables the button; `disabled` dims it and prevents all interaction.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button loading>Loading...</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

// ─── Layout ────────────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: "Full Width",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Stretches the button to fill its container width.",
      },
    },
  },
  args: {
    fullWidth: true,
    children: "Full Width",
  },
};

export const LightTheme: Story = {
  name: "Light Theme",
  parameters: {
    docs: {
      description: {
        story:
          "All four variants rendered on a light surface, demonstrating how the 3-D depth and gradients adapt to a bright background.",
      },
    },
  },
  render: () => (
    <div
      className="light"
      style={{
        backgroundColor: "#f0f2f8",
        minHeight: "200px",
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
          padding: "28px 32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
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
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>
    </div>
  ),
};
