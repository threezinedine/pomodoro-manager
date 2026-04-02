import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: null as unknown as React.ReactNode,
    content: "This is a tooltip",
    placement: "top" as const,
    showDelay: 200,
  },
  argTypes: {
    placement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Where the tooltip appears",
    },
    showDelay: {
      control: { type: "number", min: 0 },
      description: "Delay before showing (ms)",
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ─────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default",
  parameters: {
    docs: {
      description: {
        story:
          "Default tooltip appears above the trigger with a 200ms show delay. Dismissed immediately on mouse leave or blur.",
      },
    },
  },
  render: () => {
    return (
      <Tooltip content="Tooltip on hover" placement="top">
        <Button variant="secondary" size="sm">
          Hover me
        </Button>
      </Tooltip>
    );
  },
};

// ─── Placements ───────────────────────────────────────────────────────

export const Placements: Story = {
  name: "Placements",
  parameters: {
    docs: {
      description: {
        story:
          "All four placement variants — `top` (default), `bottom`, `left`, and `right`.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "32px",
        alignItems: "center",
        padding: "80px 40px",
      }}
    >
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="secondary" size="sm">
          Top
        </Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="secondary" size="sm">
          Bottom
        </Button>
      </Tooltip>
      <Tooltip content="Left tooltip" placement="left">
        <Button variant="secondary" size="sm">
          Left
        </Button>
      </Tooltip>
      <Tooltip content="Right tooltip" placement="right">
        <Button variant="secondary" size="sm">
          Right
        </Button>
      </Tooltip>
    </div>
  ),
};

// ─── Light Theme ──────────────────────────────────────────────────────

export const LightTheme: Story = {
  name: "Light Theme",
  parameters: {
    docs: {
      description: {
        story:
          "Tooltip rendered inside a light-themed container — the surface colour adapts automatically via CSS variables.",
      },
    },
  },
  render: () => (
    <div
      className="light"
      style={{
        background: "#f0f2f8",
        minHeight: "120px",
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
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#aaa",
            margin: "0 0 16px",
          }}
        >
          Light Theme
        </p>
        <Tooltip content="Session completed" placement="bottom">
          <Button variant="secondary" size="sm">
            Hover me
          </Button>
        </Tooltip>
      </div>
    </div>
  ),
};
