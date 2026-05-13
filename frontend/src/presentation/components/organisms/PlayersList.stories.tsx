import type { Meta, StoryObj } from '@storybook/react';
import { PlayersList } from './PlayersList';

const meta: Meta<typeof PlayersList> = {
  title: 'Organisms/PlayersList',
  component: PlayersList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayersList>;

export const Default: Story = {
  args: {},
};
