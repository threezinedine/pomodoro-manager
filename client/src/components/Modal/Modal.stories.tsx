import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button";

const meta = {
    title: "Components/Modal",
    component: Modal,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
    args: {
        open: false,
        onClose: () => {},
    },
    argTypes: {
        closeOnBackdrop: { control: "boolean" },
        closeOnEscape: { control: "boolean" },
    },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ModalDemo: React.FC<{
    label?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
}> = ({ label = "Open Modal", closeOnBackdrop = true, closeOnEscape = true }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="primary" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeOnBackdrop={closeOnBackdrop}
                closeOnEscape={closeOnEscape}
                title="Modal Title"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary">Confirm</Button>
                    </>
                }
            >
                This is the modal body content. It supports scrolling for longer content.
            </Modal>
        </>
    );
};

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
    name: "Default",
    parameters: {
        docs: {
            description: {
                story: "Default modal — closes on backdrop click and on Escape key press.",
            },
        },
    },
    render: () => <ModalDemo />,
};

// ─── States ────────────────────────────────────────────────────────────────────

export const States: Story = {
    name: "States",
    parameters: {
        docs: {
            description: {
                story: "Behaviour variants — `closeOnBackdrop` prevents closing by clicking the backdrop; `closeOnEscape` prevents closing via the Escape key.",
            },
        },
    },
    render: () => (
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <ModalDemo label="Closes on backdrop" closeOnBackdrop={true} />
            <ModalDemo label="No backdrop close" closeOnBackdrop={false} />
        </div>
    ),
};

// ─── Form modal ─────────────────────────────────────────────────────────────────

export const FormModal: Story = {
    name: "Form Modal",
    parameters: {
        docs: {
            description: {
                story: "Demonstrates a typical form inside the modal body — input fields, label, and footer actions.",
            },
        },
    },
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button variant="secondary" onClick={() => setOpen(true)}>
                    Add New Task
                </Button>
                <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Add New Task"
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary">Save Task</Button>
                        </>
                    }
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    marginBottom: "6px",
                                }}
                            >
                                Task Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Morning standup"
                                style={{
                                    width: "100%",
                                    padding: "9px 12px",
                                    background: "var(--bg-base)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "var(--text-secondary)",
                                    marginBottom: "6px",
                                }}
                            >
                                Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Optional notes..."
                                style={{
                                    width: "100%",
                                    padding: "9px 12px",
                                    background: "var(--bg-base)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    color: "var(--text-primary)",
                                    fontSize: "14px",
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    </div>
                </Modal>
            </>
        );
    },
};
