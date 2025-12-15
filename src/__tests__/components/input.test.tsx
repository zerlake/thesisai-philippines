import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('accepts text input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    await user.type(input, 'test input');
    
    expect(input.value).toBe('test input');
  });

  it('handles change events', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'a');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('supports disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeDisabled();
  });

  it('handles focus events', async () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    
    expect(handleFocus).toHaveBeenCalled();
  });

  it('handles blur events', async () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalled();
  });

  it('accepts type prop', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(input.type).toBe('email');
  });

  it('works with value prop', async () => {
    render(<Input value="controlled value" readOnly />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(input.value).toBe('controlled value');
  });

  it('clears value on change', async () => {
    const { rerender } = render(<Input value="initial" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
    
    rerender(<Input value="" onChange={() => {}} />);
    expect(input.value).toBe('');
  });
});
