import type { Meta, StoryObj } from '@storybook/react';
import { BetPanel } from './BetPanel';

const meta: Meta<typeof BetPanel> = {
  title: 'Organisms/BetPanel',
  component: BetPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BetPanel>;

export const BettingPhase: Story = {
  args: {},
};

export const ActivePhase: Story = {
  args: {},
};

export const WithBetPlaced: Story = {
  args: {},
};
