import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const TASK_TYPE_OPTIONS = [
  { value: "pomodoro", label: "Pomodoro" },
  { value: "office", label: "Office" },
  { value: "meeting", label: "Meeting" },
  { value: "focus", label: "Focus" },
  { value: "other", label: "Other" },
];

const TAG_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "dev", label: "Development" },
  { value: "design", label: "Design" },
  { value: "bug", label: "Bug" },
  { value: "review", label: "Code Review" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Single select ───────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default",
  args: {
    label: "Task Type",
    options: TASK_TYPE_OPTIONS,
    placeholder: "Choose a type",
  },
  render: (_args) => (
    <div style={{ maxWidth: "320px" }}>
      <Select
        options={TASK_TYPE_OPTIONS}
        label="Task Type"
        placeholder="Choose a type"
      />
    </div>
  ),
};

// ─── With value ─────────────────────────────────────────────────────────────────

export const WithValue: Story = {
  name: "With Value",
  args: {
    label: "Task Type",
    options: TASK_TYPE_OPTIONS,
    value: "pomodoro",
  },
  render: (_args) => (
    <div style={{ maxWidth: "320px" }}>
      <Select
        options={TASK_TYPE_OPTIONS}
        label="Task Type"
        value="pomodoro"
      />
    </div>
  ),
};

// ─── With error ─────────────────────────────────────────────────────────────────

export const WithError: Story = {
  name: "With Error",
  args: {
    label: "Task Type",
    options: TASK_TYPE_OPTIONS,
    error: "Please select a task type",
  },
  render: (_args) => (
    <div style={{ maxWidth: "320px" }}>
      <Select
        options={TASK_TYPE_OPTIONS}
        label="Task Type"
        error="Please select a task type"
      />
    </div>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  name: "Disabled",
  args: {
    label: "Task Type",
    options: TASK_TYPE_OPTIONS,
    disabled: true,
  },
  render: (_args) => (
    <div style={{ maxWidth: "320px" }}>
      <Select
        options={TASK_TYPE_OPTIONS}
        label="Task Type"
        disabled
      />
    </div>
  ),
};

// ─── Multiple (tag selection) ────────────────────────────────────────────────────

export const Multiple: Story = {
  name: "Multiple (Tag Selection)",
  args: {
    label: "Tags",
    options: TAG_OPTIONS,
    multiple: true,
    value: [],
  },
  render: (_args) => (
    <div style={{ maxWidth: "360px" }}>
      <Select
        options={TAG_OPTIONS}
        label="Tags"
        multiple
        placeholder="Select tags"
      />
    </div>
  ),
};

// ─── Multiple with selected values ───────────────────────────────────────────────

export const MultipleWithValues: Story = {
  name: "Multiple with Values",
  args: {
    label: "Tags",
    options: TAG_OPTIONS,
    multiple: true,
    value: ["urgent", "dev"],
  },
  render: (_args) => (
    <div style={{ maxWidth: "360px" }}>
      <Select
        options={TAG_OPTIONS}
        label="Tags"
        multiple
        value={["urgent", "dev"]}
      />
    </div>
  ),
};

// ─── Light theme ───────────────────────────────────────────────────────────────

export const LightTheme: Story = {
  name: "Light Theme",
  args: {
    label: "Task Type",
    options: TASK_TYPE_OPTIONS,
  },
  render: (_args) => (
    <div
      className="light"
      style={{
        backgroundColor: "#f0f2f8",
        padding: "32px",
        borderRadius: "12px",
        maxWidth: "360px",
      }}
    >
      <Select
        options={TASK_TYPE_OPTIONS}
        label="Task Type"
        placeholder="Choose a type"
      />
    </div>
  ),
};
