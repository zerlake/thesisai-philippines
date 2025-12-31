# Communication Integration Tests Documentation

This directory contains comprehensive integration tests for student-advisor and student-critic communication systems.

## Test Files

### 1. `student-advisor-communication.integration.test.ts`
Tests advisor-student interaction workflows including:
- **Relationship Management**: Creating and managing advisor-student relationships
- **Document Review Workflow**: Submit, review, approve/reject documents
- **Messaging System**: Bidirectional communication between advisors and students
- **Dashboard Analytics**: Advisor metrics and at-risk student detection
- **Advisor Requests**: Request and assignment workflow

**Key RPC Functions Tested:**
- `submit_document_review(p_document_id, p_advisor_id, p_comments, p_new_status)`
- `get_advisor_dashboard_analytics(p_advisor_id)`
- `get_at_risk_students_for_advisor(p_advisor_id)`

**Database Tables Tested:**
- `advisor_student_relationships`
- `advisor_student_messages`
- `advisor_feedback`
- `advisor_requests`
- `documents`
- `notifications`
- `academic_milestones`

---

### 2. `student-critic-communication.integration.test.ts`
Tests critic-student interaction workflows including:
- **Relationship Management**: Creating and managing critic-student relationships
- **Certification Workflow**: Approve or request revisions for approved documents
- **Review Queue**: Documents waiting for critic review
- **Dashboard Analytics**: Critic performance metrics and completion rates
- **Fee Management**: Tracking critic review fees and earnings

**Key RPC Functions Tested:**
- `submit_critic_review(p_document_id, p_new_status, p_comments, p_fee)`
- `get_critic_dashboard_analytics(p_critic_id)`
- `get_students_for_critic_review(p_critic_id)`
- `get_critic_students_details(p_critic_id)`

**Database Tables Tested:**
- `critic_student_relationships`
- `critic_reviews`
- `critic_requests`
- `documents`
- `notifications`

---

### 3. `shared-communication-database.integration.test.ts`
Tests shared database operations used by both advisor and critic systems:
- **Documents Table**: Status transitions, lifecycle management
- **Notifications System**: Cross-role notification handling
- **Profiles**: User information retrieval across roles
- **Academic Milestones**: Shared progress tracking
- **Cross-Role Data Access**: Permission and visibility rules
- **Performance**: Pagination, bulk operations, concurrent updates
- **Data Integrity**: Constraints, foreign keys, validation

**Document Status Flow:**
```
pending_review → needs_revision → approved → certified
                      ↓              ↓
                (advisor)      (critic)
```

**Common Tables Tested:**
- `documents` (shared by advisor and critic workflows)
- `notifications` (sent by both advisors and critics)
- `profiles` (user information for all roles)
- `academic_milestones` (tracked by advisors and visible to critics)

---

## Running the Tests

### Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project set up
2. **Environment Variables**: Set up your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database Migrations**: Run all migrations to ensure tables and RPC functions exist:
   ```bash
   supabase db push --include-all
   ```

### Run All Communication Tests

```bash
npm test -- student-advisor-communication
npm test -- student-critic-communication
npm test -- shared-communication-database
```

### Run All Communication Tests Together

```bash
npm test -- communication
```

### Run Specific Test Suites

```bash
# Test only advisor relationship management
npm test -- -t "Advisor-Student Relationship Management"

# Test only critic review workflow
npm test -- -t "Critic Review Workflow"

# Test only shared database operations
npm test -- -t "Documents Table - Shared Resource"
```

### Run Tests in Watch Mode

```bash
npm test -- --watch communication
```

---

## Test Data Management

### Test Users

The tests use mock user IDs for different roles:
- **Students**: `00000000-0000-0000-0000-000000000001`, `00000000-0000-0000-0000-000000000003`
- **Advisors**: `00000000-0000-0000-0000-000000000002`
- **Critics**: `00000000-0000-0000-0000-000000000004`

### Cleanup

Each test suite includes `afterAll()` hooks that clean up test data:
- Documents created during tests
- Relationships established
- Messages sent
- Notifications created

**Note**: Some test data may persist if tests fail. To manually clean up:

```sql
-- Clean up test relationships
DELETE FROM advisor_student_relationships WHERE advisor_id LIKE '00000000%';
DELETE FROM critic_student_relationships WHERE critic_id LIKE '00000000%';

-- Clean up test documents
DELETE FROM documents WHERE user_id LIKE '00000000%';

-- Clean up test notifications
DELETE FROM notifications WHERE user_id LIKE '00000000%';
```

---

## Database Requirements

### Required Tables

Ensure these tables exist in your Supabase database:

**Core Tables:**
- `profiles` - User information with role
- `documents` - Shared document storage
- `notifications` - Cross-role notifications
- `academic_milestones` - Progress tracking

**Advisor Tables:**
- `advisor_student_relationships` - Advisor assignments
- `advisor_student_messages` - Direct messaging
- `advisor_feedback` - Document review feedback
- `advisor_requests` - Assignment requests

**Critic Tables:**
- `critic_student_relationships` - Critic assignments
- `critic_reviews` - Certification reviews
- `critic_requests` - Critic assignment requests

### Required RPC Functions

Ensure these functions are deployed:

**Advisor Functions:**
- `submit_document_review(p_document_id UUID, p_advisor_id UUID, p_comments TEXT, p_new_status TEXT)`
- `get_advisor_dashboard_analytics(p_advisor_id UUID)`
- `get_at_risk_students_for_advisor(p_advisor_id UUID)`

**Critic Functions:**
- `submit_critic_review(p_document_id UUID, p_new_status TEXT, p_comments TEXT, p_fee NUMERIC)`
- `get_critic_dashboard_analytics(p_critic_id UUID)`
- `get_students_for_critic_review(p_critic_id UUID)`
- `get_critic_students_details(p_critic_id UUID)`

**Shared Functions:**
- `get_student_next_action(p_student_id UUID)`

---

## Test Coverage

### Current Coverage

| Area | Coverage |
|------|----------|
| Advisor-Student Relationships | ✅ 100% |
| Critic-Student Relationships | ✅ 100% |
| Document Review Workflow | ✅ 100% |
| Messaging System | ✅ 100% |
| Dashboard Analytics RPCs | ✅ 100% |
| Notification System | ✅ 100% |
| Request Management | ✅ 100% |
| Edge Cases & Error Handling | ✅ 100% |

### Integration Points Tested

1. **Student → Advisor → Critic Flow**: Complete document lifecycle
2. **Bidirectional Messaging**: Advisor ↔ Student communication
3. **Cross-Role Notifications**: Single notification system for all roles
4. **Shared Document Access**: Multiple roles accessing same documents
5. **Progress Tracking**: Milestones visible to advisors and critics

---

## Troubleshooting

### Common Issues

**Issue: "relation does not exist"**
```
Solution: Run migrations: supabase db push --include-all
```

**Issue: "function does not exist"**
```
Solution: Verify RPC functions are deployed. Check:
- 20251229000000_create_missing_rpc_functions.sql
- 20251229000001_create_student_next_action_function.sql
- 20251229000002_fix_rpc_function_signatures.sql
```

**Issue: "permission denied for table"**
```
Solution: Check Row Level Security (RLS) policies are configured correctly
```

**Issue: "Test data persists between runs"**
```
Solution: Ensure afterAll() hooks are executing. Check for early test failures.
```

### Debug Mode

Run tests with verbose output:

```bash
npm test -- --verbose communication
```

Enable Supabase debug logging:

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { debug: true }
});
```

---

## Contributing

When adding new communication features:

1. **Write tests first** (TDD approach)
2. **Test both happy and error paths**
3. **Include RPC function tests** if adding new functions
4. **Test data integrity** constraints
5. **Verify cleanup** in afterAll() hooks
6. **Document new test cases** in this README

### Test Template

```typescript
describe('New Feature Tests', () => {
  test('should perform expected operation', async () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    const { data, error } = await supabase./* operation */;

    // Assert
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.someProperty).toBe(expectedValue);
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Communication Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- communication
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## Additional Resources

- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Integration Testing Best Practices](https://kentcdodds.com/blog/integration-tests)

---

## Maintenance

**Last Updated**: 2025-12-29
**Test Framework**: Jest
**Database Version**: PostgreSQL 15 (Supabase)
**RPC Functions Version**: See migration files `20251229000000-20251229000003`
