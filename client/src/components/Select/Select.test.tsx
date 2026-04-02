import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const OPTIONS = [
  { value: 'pomodoro', label: 'Pomodoro' },
  { value: 'office', label: 'Office' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'focus', label: 'Focus', disabled: true },
];

describe('Select', () => {
  it('renders label when provided', () => {
    render(<Select options={OPTIONS} label="Task Type" />);
    expect(screen.getByText('Task Type')).toBeInTheDocument();
  });

  it('renders placeholder option when no value is selected', () => {
    render(<Select options={OPTIONS} placeholder="Choose a type" />);
    expect(screen.getByText('Choose a type')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={OPTIONS} />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(OPTIONS.length + 1); // +1 for placeholder
  });

  it('marks a disabled option as disabled', () => {
    render(<Select options={OPTIONS} />);
    const options = screen.getAllByRole('option');
    const disabled = options.find((o) => o.textContent === 'Focus');
    expect(disabled).toHaveAttribute('disabled');
  });

  it('applies the correct selected state', () => {
    render(<Select options={OPTIONS} value="office" />);
    const opts = screen.getAllByRole('option') as HTMLOptionElement[];
    const selected = opts.find((o) => o.selected);
    expect(selected?.textContent).toBe('Office');
  });

  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(
      <Select options={OPTIONS} value="" onChange={onChange} />,
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'meeting' } });
    expect(onChange).toHaveBeenCalledWith('meeting');
  });

  it('guards onChange when disabled — does not call the handler', () => {
    const onChange = vi.fn();
    render(
      <Select options={OPTIONS} disabled onChange={onChange} />,
    );
    const select = screen.getByRole('combobox');
    // fireEvent.change bypasses browser enforcement; component should guard internally
    fireEvent.change(select, { target: { value: 'pomodoro' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select options={OPTIONS} error="This field is required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders error message', () => {
    render(<Select options={OPTIONS} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('links error message with aria-describedby', () => {
    render(<Select options={OPTIONS} error="Required" />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-describedby');
  });

  it('sets the required attribute on the select', () => {
    render(<Select options={OPTIONS} required />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <Select options={OPTIONS} className="my-custom-class" />,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders multiple select with size attribute', () => {
    render(<Select options={OPTIONS} multiple />);
    const select = screen.getByRole('listbox');
    expect(select).toHaveAttribute('multiple');
  });

  it('renders selected count for multiple select with values', () => {
    render(
      <Select
        options={OPTIONS}
        multiple
        value={['pomodoro', 'office']}
      />,
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('does not render selected count for single select', () => {
    render(<Select options={OPTIONS} value="pomodoro" />);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('renders required asterisk when required', () => {
    render(<Select options={OPTIONS} label="Label" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not render required asterisk when not required', () => {
    render(<Select options={OPTIONS} label="Label" />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});
