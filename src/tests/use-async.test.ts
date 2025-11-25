// src/tests/use-async.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '@/hooks/use-async';
import { AppError, NetworkError } from '@/lib/errors'; // Assuming AppError and NetworkError exist

describe('useAsync', () => {
  // Test case 1: Initial state
  it('should return correct initial state', () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('data')));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.execute).toBe('function');
  });

  // Test case 2: Successful execution
  it('should handle successful async operation', async () => {
    const mockData = 'Success Data';
    const mockAsyncOperation = jest.fn(() => Promise.resolve(mockData));
    const { result } = renderHook(() => useAsync(mockAsyncOperation));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(mockData);
    expect(result.current.error).toBeUndefined();
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  // Test case 3: Error handling
  it('should handle async operation failure', async () => {
    const mockError = new NetworkError('Failed to fetch');
    const mockAsyncOperation = jest.fn(() => Promise.reject(mockError));
    const { result } = renderHook(() => useAsync(mockAsyncOperation));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  // Test case 4: Passing arguments to execute
  it('should pass arguments to the async function', async () => {
    const mockAsyncOperation = jest.fn((arg1, arg2) => Promise.resolve(`${arg1}-${arg2}`));
    const { result } = renderHook(() => useAsync(mockAsyncOperation));

    act(() => {
      result.current.execute('hello', 123);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockAsyncOperation).toHaveBeenCalledWith('hello', 123);
    expect(result.current.data).toBe('hello-123');
  });

  // Test case 5: Resetting state
  it('should reset state when execute is called again', async () => {
    const mockData1 = 'Data 1';
    const mockError2 = new AppError('CustomError', 'Error 2');
    const mockAsyncOperation1 = jest.fn(() => Promise.resolve(mockData1));
    const mockAsyncOperation2 = jest.fn(() => Promise.reject(mockError2));

    const { result, rerender } = renderHook(() => useAsync(mockAsyncOperation1));

    // First execution: success
    act(() => {
      result.current.execute();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(mockData1);
    expect(result.current.error).toBeUndefined();

    // Rerender with new async operation (simulating a change in prop or dependency)
    rerender(() => useAsync(mockAsyncOperation2));

    // Second execution: error
    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true); // Should reset and be loading
    expect(result.current.data).toBeUndefined(); // Data should be cleared
    expect(result.current.error).toBeUndefined(); // Error should be cleared

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError2);
  });

  // Test case 6: execute returns a promise
  it('execute should return a promise that resolves/rejects with the operation result', async () => {
    const mockData = 'Returned Data';
    const mockError = new Error('Execute Error');
    const successOperation = jest.fn(() => Promise.resolve(mockData));
    const failureOperation = jest.fn(() => Promise.reject(mockError));

    const { result: successResult } = renderHook(() => useAsync(successOperation));
    const { result: failureResult } = renderHook(() => useAsync(failureOperation));

    // Test success
    await expect(act(() => successResult.current.execute())).resolves.toBe(mockData);
    expect(successResult.current.data).toBe(mockData);

    // Test failure
    await expect(act(() => failureResult.current.execute())).rejects.toBe(mockError);
    expect(failureResult.current.error).toBe(mockError);
  });
});
