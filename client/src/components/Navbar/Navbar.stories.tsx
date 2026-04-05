import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { Navbar } from './Navbar';

const meta = {
    title: 'Components/Navbar',
    component: Navbar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default',
    render: (args) => (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <Navbar {...args} />
        </div>
    ),
};

export const LightTheme: Story = {
    name: 'Light Theme',
    render: (args) => (
        <div className="light" style={{ background: '#f0f2f8', minHeight: '100vh' }}>
            <Navbar {...args} />
        </div>
    ),
};

export const WithRightContent: Story = {
    name: 'With Right Content',
    render: () => (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <Navbar
                rightContent={
                    <>
                        <Button variant="ghost" size="sm">Stats</Button>
                        <Button variant="ghost" size="sm">Settings</Button>
                        <Button variant="ghost" size="sm">Sign Out</Button>
                    </>
                }
            />
        </div>
    ),
};