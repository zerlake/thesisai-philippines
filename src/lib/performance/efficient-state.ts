/**
 * Efficient State Management
 * Minimizes re-renders and optimizes memory usage
 */

import React from 'react';

/**
 * Shallow equality check for props/state
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => a[key] === b[key]);
}

/**
 * Deep equality check for complex objects
 */
export function deepEqual(a: any, b: any, depth: number = 0, maxDepth: number = 5): boolean {
  if (depth > maxDepth) return a === b;
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key =>
      deepEqual(a[key], b[key], depth + 1, maxDepth)
    );
  }

  return false;
}

/**
 * Custom hook to avoid re-renders when value hasn't changed
 */
export function useStableValue<T>(value: T, equals: (a: T, b: T) => boolean = shallowEqual): T {
  const ref = React.useRef<T>(value);
  const [, forceUpdate] = React.useState({});

  if (!equals(ref.current, value)) {
    ref.current = value;
    forceUpdate({});
  }

  return ref.current;
}

/**
 * Custom hook to memoize expensive calculations
 */
export function useMemoCompare<T>(
  factory: () => T,
  deps: React.DependencyList,
  equals: (a: T, b: T) => boolean = shallowEqual
): T {
  const ref = React.useRef<T>();
  const depsRef = React.useRef<React.DependencyList>(deps);

  // Check if dependencies changed
  const depsChanged = !deps || !depsRef.current || deps.length !== depsRef.current.length ||
    deps.some((dep, i) => !Object.is(dep, depsRef.current![i]));

  let result: T;

  if (depsChanged) {
    result = factory();
    if (ref.current === undefined || !equals(result, ref.current)) {
      ref.current = result;
    }
  } else {
    result = ref.current!;
  }

  depsRef.current = deps;
  return result;
}

/**
 * useCallback with stable reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = React.useRef(callback);

  React.useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  return React.useCallback(
    (...args) => ref.current(...args),
    deps
  ) as T;
}

/**
 * useRef with cleanup
 */
export function useRefWithCleanup<T>(
  initialValue: T,
  cleanup?: (value: T) => void
): [React.MutableRefObject<T>, (value: T) => void] {
  const ref = React.useRef<T>(initialValue);

  const setValue = React.useCallback((value: T) => {
    cleanup?.(ref.current);
    ref.current = value;
  }, [cleanup]);

  React.useEffect(() => {
    return () => {
      cleanup?.(ref.current);
    };
  }, [cleanup]);

  return [ref, setValue];
}

/**
 * Batched state updates
 */
export function useBatchedState<T extends object>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = React.useState<T>(initialState);
  const batchRef = React.useRef<Partial<T>>({});
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const updateBatch = React.useCallback((updates: Partial<T>) => {
    Object.assign(batchRef.current, updates);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 0);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, updateBatch];
}

/**
 * Lazy state initialization
 */
export function useLazyState<T>(
  initializer: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  return React.useState<T>(() => initializer());
}

/**
 * useSelector-like pattern for performance
 */
export function useSelector<T, U>(
  state: T,
  selector: (state: T) => U,
  equals: (a: U, b: U) => boolean = shallowEqual
): U {
  const selectedRef = React.useRef(selector(state));
  const [selected, setSelected] = React.useState<U>(selectedRef.current);

  const nextSelected = selector(state);

  if (!equals(selectedRef.current, nextSelected)) {
    selectedRef.current = nextSelected;
    setSelected(nextSelected);
  }

  return selected;
}

/**
 * Prevent unnecessary re-renders of children
 */
export const PureComponent = React.memo(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  (prev, next) => prev.children === next.children
);

/**
 * Context with optimization
 */
export function createOptimizedContext<T>(defaultValue: T) {
  const Context = React.createContext<T>(defaultValue);

  const Provider = ({ value, children }: { value: T; children: React.ReactNode }) => {
    // Use useMemo to prevent recreating context value on every render
    const memoizedValue = React.useMemo(() => value, [value]);

    return (
      <Context.Provider value={memoizedValue}>
        {children}
      </Context.Provider>
    );
  };

  const useContext = () => {
    const value = React.useContext(Context);
    if (value === undefined) {
      throw new Error('useContext must be used within Provider');
    }
    return value;
  };

  return { Provider, useContext, Context };
}

/**
 * Split context to separate data from dispatch
 */
export function createSplitContext<T, A>(
  initialState: T,
  reducer: (state: T, action: A) => T
) {
  const DataContext = React.createContext<T>(initialState);
  const DispatchContext = React.createContext<(action: A) => void>(() => {});

  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const memoizedState = React.useMemo(() => state, [state]);
    const memoizedDispatch = React.useCallback((action: A) => dispatch(action), []);

    return (
      <DataContext.Provider value={memoizedState}>
        <DispatchContext.Provider value={memoizedDispatch}>
          {children}
        </DispatchContext.Provider>
      </DataContext.Provider>
    );
  };

  return {
    DataProvider: Provider,
    useData: () => React.useContext(DataContext),
    useDispatch: () => React.useContext(DispatchContext),
    DataContext,
    DispatchContext
  };
}

/**
 * Prevent re-renders from context updates
 */
export function useContextSelector<T, U>(
  context: React.Context<T>,
  selector: (value: T) => U,
  equals: (a: U, b: U) => boolean = shallowEqual
): U {
  const value = React.useContext(context);
  const selectedRef = React.useRef(selector(value));
  const [selected, setSelected] = React.useState<U>(selectedRef.current);

  const nextSelected = selector(value);

  if (!equals(selectedRef.current, nextSelected)) {
    selectedRef.current = nextSelected;
    setSelected(nextSelected);
  }

  return selected;
}

/**
 * Batch async operations to reduce re-renders
 */
export function useBatchAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  options: {
    debounce?: number;
    throttle?: number;
  } = {}
) {
  const [state, setState] = React.useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
    loading: false,
    data: null,
    error: null
  });

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const execute = async () => {
      setState(s => ({ ...s, loading: true }));
      try {
        const data = await asyncFn();
        setState({ loading: false, data, error: null });
      } catch (error) {
        setState({ loading: false, data: null, error: error as Error });
      }
    };

    if (options.debounce) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(execute, options.debounce);
    } else if (options.throttle) {
      if (!timeoutRef.current) {
        execute();
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;
        }, options.throttle);
      }
    } else {
      execute();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);

  return state;
}
