import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ProgressSegments } from './ProgressSegments';

it('selects a segment with accessible name', async () => {
  const onSelect = vi.fn();
  render(<ProgressSegments states={['complete', 'started', 'complete', 'empty']} current={1} onSelect={onSelect} />);
  await userEvent.click(screen.getByRole('button', { name: 'Entry 3, complete' }));
  expect(onSelect).toHaveBeenCalledWith(2);
  expect(screen.getByRole('button', { name: 'Entry 4, empty' })).toBeInTheDocument();
});
