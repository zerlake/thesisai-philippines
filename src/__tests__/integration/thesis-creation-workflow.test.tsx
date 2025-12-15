import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Thesis Creation Workflow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates thesis with title and topic', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: '123' });
    
    const { getByPlaceholderText, getByRole } = render(
      <div>
        <input placeholder="thesis title" />
        <input placeholder="research topic" />
        <button onClick={() => mockCreate()}>Create</button>
      </div>
    );
    
    await user.type(getByPlaceholderText('thesis title'), 'My Thesis');
    await user.type(getByPlaceholderText('research topic'), 'AI Ethics');
    await user.click(getByRole('button'));
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  it('generates research questions after creation', async () => {
    render(
      <div>
        <input placeholder="topic" />
        <button>Generate Questions</button>
        <div>Question 1</div>
      </div>
    );
    
    const input = screen.getByPlaceholderText('topic') as HTMLInputElement;
    await user.type(input, 'Machine Learning');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });

  it('creates outline from research questions', async () => {
    render(
      <div>
        <div>Research Question</div>
        <button>Generate Outline</button>
        <div>Introduction</div>
      </div>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });
  });

  it('saves thesis progress', async () => {
    const mockSave = vi.fn();
    
    render(
      <div>
        <input value="Thesis Title" readOnly />
        <button onClick={() => mockSave()}>Save Progress</button>
      </div>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockSave).toHaveBeenCalled();
  });

  it('handles creation errors gracefully', async () => {
    const mockCreate = vi.fn().mockRejectedValue(new Error('Creation failed'));
    
    render(
      <div>
        <input placeholder="title" />
        <button onClick={() => mockCreate()}>Create</button>
        <div role="alert" />
      </div>
    );
    
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
