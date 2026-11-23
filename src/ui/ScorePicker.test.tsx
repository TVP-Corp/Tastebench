import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScorePicker } from './ScorePicker';

const btn = (n: string) => screen.getByRole('radio', { name: n });

describe('ScorePicker', () => {
  it('shows - and disables decimals when empty', () => {
    render(<ScorePicker label="Taste" value={undefined} onChange={() => {}} />);
    expect(screen.getByTestId('score-value')).toHaveTextContent('-');
    for (let d = 0; d <= 9; d++) expect(btn(`.${d}`)).toBeDisabled();
  });
  it('picks whole and decimal', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ScorePicker label="Taste" value={undefined} onChange={onChange} />);
    await userEvent.click(btn('7'));
    expect(onChange).toHaveBeenLastCalledWith(70);
    rerender(<ScorePicker label="Taste" value={70} onChange={onChange} />);
    await userEvent.click(btn('.3'));
    expect(onChange).toHaveBeenLastCalledWith(73);
  });
  it('does not clear on clicking selected whole', async () => {
    const onChange = vi.fn();
    render(<ScorePicker label="Taste" value={70} onChange={onChange} />);
    await userEvent.click(btn('7'));
    expect(onChange).not.toHaveBeenCalledWith(undefined);
  });
  it('11 keeps only .0', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ScorePicker label="Taste" value={75} onChange={onChange} />);
    await userEvent.click(btn('11'));
    expect(onChange).toHaveBeenLastCalledWith(110);
    rerender(<ScorePicker label="Taste" value={110} onChange={onChange} />);
    expect(btn('.1')).toBeDisabled();
    expect(btn('.9')).toBeDisabled();
    expect(btn('.0')).toBeEnabled();
  });
  it('skip', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ScorePicker label="Taste" value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onChange).toHaveBeenLastCalledWith('skip');
    rerender(<ScorePicker label="Taste" value="skip" onChange={onChange} />);
    expect(screen.getByTestId('score-value')).toHaveTextContent('Skipped');
    expect(screen.queryAllByRole('radio', { checked: true })).toHaveLength(0);
  });
});
