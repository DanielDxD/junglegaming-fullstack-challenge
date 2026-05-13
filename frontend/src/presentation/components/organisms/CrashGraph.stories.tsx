import type { Meta, StoryObj } from '@storybook/react';
import { CrashGraph } from './CrashGraph';

const meta: Meta<typeof CrashGraph> = {
  title: 'Organisms/CrashGraph',
  component: CrashGraph,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CrashGraph>;

export const Betting: Story = {
  args: {},
};

export const Active: Story = {
  args: {},
};

export const Crashed: Story = {
  args: {},
};
