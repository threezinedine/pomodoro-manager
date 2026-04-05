import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";

const meta = {
  title: "Features/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  render: () => (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />
    </div>
  ),
};

export const LightTheme: Story = {
  name: "Light Theme",
  render: () => (
    <div
      className="light"
      style={{
        background: "#f0f2f8",
        minHeight: "100vh",
      }}
    >
      <Navbar />
    </div>
  ),
};
