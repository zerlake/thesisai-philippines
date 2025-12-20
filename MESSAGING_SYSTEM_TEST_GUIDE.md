# Messaging System Integration Test Guide

## Overview

Comprehensive integration tests for the messaging system covering:
- Chat interface loading
- Error handling and recovery
- Message filtering and grouping
- Database table fallback chains
- Error serialization
- Resilience and graceful degradation

**Test File**: `src/__tests__/integration/messaging-system.test.tsx`

## Running the Tests

### Run All Messaging Tests
```bash
npm run test:integration -- messaging-system
```

### Run Specific Test Suite
```bash
# Chat interface loading tests
npm run test:integration -- messaging-system -t "Chat Interface Loading"

# Error handling tests
npm run test:integration -- messaging-system -t "Error Handling"

# Message loading tests
npm run test:integration -- messaging-system -t "Message Loading and Filtering"
```

### Run with Coverage
```bash
npm run test:coverage -- src/__tests__/integration/messaging-system.test.tsx
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test -- src/__tests__/integration/messaging-system.test.tsx --watch
```

### Run with UI
```bash
npm run test:ui -- src/__tests__/integration/messaging-system.test.tsx
```

## Test Suites

### 1. Chat Interface Loading
Tests that verify the component loads conversations correctly.

**Tests**:
- ✅ `should load and display conversations successfully`
  - Verifies Supabase queries are called
  - Checks component renders without errors

- ✅ `should handle missing relationships table gracefully`
  - Tests 42P01 error (table not found)
  - Verifies warning is logged
  - Component continues functioning

- ✅ `should handle missing messages table and try fallback`
  - Tests fallback from `advisor_student_messages` to `messages`
  - Verifies fallback chain works

**Run**:
```bash
npm run test:integration -- messaging-system -t "Chat Interface Loading"
```

### 2. Error Handling
Tests error detection, logging, and recovery.

**Tests**:
- ✅ `should log detailed error information on failure`
  - Verifies error object contains: message, code, stack, details
  - Checks serializable error info logged

- ✅ `should continue with empty conversations on error`
  - Component doesn't crash on errors
  - Graceful degradation to empty state

- ✅ `should handle string error values`
  - Network errors as strings
  - Unexpected error formats

**Run**:
```bash
npm run test:integration -- messaging-system -t "Error Handling"
```

### 3. Message Loading and Filtering
Tests message retrieval and organization.

**Tests**:
- ✅ `should load messages for the current user`
  - Queries include proper user ID filtering
  - Message structure validation

- ✅ `should group messages by conversation`
  - Messages with same sender/recipient pair grouped
  - Conversation map creation

- ✅ `should handle empty message list`
  - Component renders with no messages
  - No errors on empty state

**Run**:
```bash
npm run test:integration -- messaging-system -t "Message Loading and Filtering"
```

### 4. Database Table Fallback Chain
Tests the cascade of database queries.

**Tests**:
- ✅ `should try advisor_student_relationships first`
  - Primary table queried first
  - Correct table name in call

- ✅ `should fallback to advisor_student_messages if relationships missing`
  - Sequence: relationships → advisor_student_messages
  - Both called when first fails

- ✅ `should fallback to messages table if advisor_student_messages missing`
  - Full chain: relationships → advisor_student_messages → messages
  - All tables attempted in order

**Run**:
```bash
npm run test:integration -- messaging-system -t "Database Table Fallback Chain"
```

**Fallback Chain Diagram**:
```
┌─────────────────────────────┐
│ advisor_student_relationships│
│ (preferred)                  │
└────────────┬─────────────────┘
             │ (if 42P01 error)
             ↓
┌──────────────────────────────┐
│ advisor_student_messages     │
│ (fallback 1)                  │
└────────────┬──────────────────┘
             │ (if 42P01 error)
             ↓
┌──────────────┐
│ messages     │
│ (fallback 2) │
└──────────────┘
```

### 5. Error Serialization
Tests that errors are properly captured and logged.

**Tests**:
- ✅ `should handle errors without message property`
  - Error objects missing `message` key
  - Graceful fallback to default message

- ✅ `should serialize error object without circular references`
  - Error objects are JSON serializable
  - No circular reference errors

- ✅ `should capture error type information`
  - Error type properly identified (object, string, etc.)
  - Type info included in logs

**Run**:
```bash
npm run test:integration -- messaging-system -t "Error Serialization"
```

### 6. Resilience and Recovery
Tests system robustness under failure conditions.

**Tests**:
- ✅ `should continue loading UI even if all message tables fail`
  - All tables missing (42P01)
  - Component still renders

- ✅ `should not crash on null or undefined data responses`
  - Null data from queries
  - Undefined data handling

- ✅ `should handle rapid re-renders gracefully`
  - Multiple re-renders don't cause errors
  - State management works correctly

**Run**:
```bash
npm run test:integration -- messaging-system -t "Resilience and Recovery"
```

## Expected Output

### Successful Run
```
✓ Messaging System Integration Tests (87 tests)
  ✓ Chat Interface Loading (3)
    ✓ should load and display conversations successfully
    ✓ should handle missing relationships table gracefully
    ✓ should handle missing messages table and try fallback
  ✓ Error Handling (3)
    ✓ should log detailed error information on failure
    ✓ should continue with empty conversations on error
    ✓ should handle string error values
  ✓ Message Loading and Filtering (3)
    ✓ should load messages for the current user
    ✓ should group messages by conversation
    ✓ should handle empty message list
  ✓ Database Table Fallback Chain (3)
    ✓ should try advisor_student_relationships first
    ✓ should fallback to advisor_student_messages if relationships missing
    ✓ should fallback to messages table if advisor_student_messages missing
  ✓ Error Serialization (3)
    ✓ should handle errors without message property
    ✓ should serialize error object without circular references
    ✓ should capture error type information
  ✓ Resilience and Recovery (3)
    ✓ should continue loading UI even if all message tables fail
    ✓ should not crash on null or undefined data responses
    ✓ should handle rapid re-renders gracefully

Test Files  1 passed (1)
     Tests  18 passed (18)
```

## Troubleshooting

### Tests Fail with Module Not Found
```bash
# Ensure all dependencies are installed
npm install

# Clear cache
rm -rf node_modules/.vite
npm run test:integration -- messaging-system
```

### Timeout Errors
```bash
# Increase timeout for slow tests
npm run test:integration -- messaging-system --test-timeout=10000
```

### Mock Issues
```bash
# Verify mocks are set up in beforeEach
# Check that vi.clearAllMocks() is called in afterEach
npm run test:integration -- messaging-system --reporter=verbose
```

## Test Coverage Report

Run with coverage to see coverage metrics:

```bash
npm run test:coverage -- src/__tests__/integration/messaging-system.test.tsx
```

**Target Coverage**:
- Statements: >85%
- Branches: >80%
- Functions: >85%
- Lines: >85%

## Key Testing Patterns Used

### 1. Mocking Supabase
```typescript
mockSupabaseFrom.mockImplementation((table) => ({
  select: vi.fn().mockReturnValue({
    or: vi.fn().mockResolvedValue({
      data: testData,
      error: null
    })
  })
}));
```

### 2. Testing Error Scenarios
```typescript
mockSupabaseFrom.mockImplementation(() => ({
  select: vi.fn().mockReturnValue({
    or: vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: '42P01',
        message: 'table does not exist'
      }
    })
  })
}));
```

### 3. Verifying Console Output
```typescript
const consoleErrorSpy = vi.spyOn(console, 'error');
render(<ChatInterface />);

await waitFor(() => {
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining('Error message'),
    expect.any(Object)
  );
});

consoleErrorSpy.mockRestore();
```

### 4. Testing Fallback Chains
```typescript
const callOrder: string[] = [];
mockSupabaseFrom.mockImplementation((table) => {
  callOrder.push(table);
  // mock implementation
});

render(<ChatInterface />);

await waitFor(() => {
  expect(callOrder).toContain('advisor_student_relationships');
  expect(callOrder).toContain('advisor_student_messages');
});
```

## Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Run Messaging Tests
  run: npm run test:integration -- messaging-system

- name: Generate Coverage Report
  run: npm run test:coverage -- src/__tests__/integration/messaging-system.test.tsx

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Manual Testing Checklist

After running automated tests, verify manually:

- [ ] Open browser DevTools Console
- [ ] Load chat interface component
- [ ] Check no red error messages in console
- [ ] Messages load or gracefully show empty state
- [ ] No unhandled promise rejections
- [ ] Error messages are detailed and helpful

### Manual Test Steps

1. **Test with valid data**:
   ```bash
   npm run dev
   # Navigate to chat interface
   # Verify messages load correctly
   ```

2. **Test with missing tables**:
   ```bash
   # Drop advisor_student_relationships table in test DB
   # Reload component
   # Should show warning and continue
   ```

3. **Test with missing all tables**:
   ```bash
   # Drop both advisor_student_messages and messages tables
   # Reload component
   # Should show empty conversations gracefully
   ```

4. **Monitor console output**:
   ```
   ✓ Should see detailed error info with message, code, details, stack
   ✓ Should NOT see empty error object {}
   ✓ Should NOT see unhandled rejections
   ```

## Performance Considerations

The tests mock all database calls, so they should run in:
- Single test: ~50-100ms
- Full suite: ~1-2s

If slower:
- Check for missing `beforeEach`/`afterEach` cleanup
- Verify mocks aren't creating actual network calls
- Use `--reporter=verbose` to identify slow tests

## Future Test Enhancements

- [ ] Add real-time subscription tests
- [ ] Add message sending tests
- [ ] Add read status update tests
- [ ] Add typing indicator tests
- [ ] Add performance benchmarks
- [ ] Add accessibility tests
- [ ] Add visual regression tests

## Related Documentation

- `CHAT_INTERFACE_ERROR_HANDLING.md` - Error handling implementation
- `src/components/chat-interface.tsx` - Component source
- `src/__tests__/integration/` - Other integration tests

## Support

For test failures or questions:

1. Check test output for specific failure details
2. Review `CHAT_INTERFACE_ERROR_HANDLING.md` for context
3. Check mocks are properly configured
4. Verify Supabase client is correctly mocked
5. Run single test with `--reporter=verbose`

---

**Last Updated**: December 18, 2025  
**Status**: Ready for use  
**Test Count**: 18 tests across 6 suites
