# Test Commands Cheat Sheet

## 📊 One-Page Test Command Reference

### 🚀 Start Here

```bash
# Run all tests
pnpm test

# Run with visual interface
pnpm test:ui

# Run with coverage report
pnpm test:coverage
```

---

## 🧪 Test by Category

```bash
pnpm test:components      # All feature & UI components (13 tests)
pnpm test:hooks           # All custom hooks (3 tests)
pnpm test:api             # All API endpoints (2 tests)
pnpm test:integration     # All workflows (3 tests)
pnpm test:all-categories  # All organized tests (21 tests)
```

---

## 🎯 Component Tests

| Command | Component | File |
|---------|-----------|------|
| `pnpm test:editor` | Editor | `editor.test.tsx` |
| `pnpm test:sign-in` | Sign In Form | `sign-in-form.test.tsx` |
| `pnpm test:dashboard` | Student Dashboard | `student-dashboard.test.tsx` |
| `pnpm test:research-questions` | Research Generator | `research-question-generator.test.tsx` |
| `pnpm test:outline` | Outline Builder | `outline-builder.test.tsx` |
| `pnpm test:grammar` | Grammar Checker | `grammar-checker.test.tsx` |
| `pnpm test:notifications` | Notification Bell | `notification-bell.test.tsx` |
| `pnpm test:papers` | Paper Search Bar | `paper-search-bar.test.tsx` |
| `pnpm test:theme` | Theme Toggle | `theme-toggle.test.tsx` |
| `pnpm test:bibliography` | Bibliography Generator | `bibliography-generator.test.tsx` |
| `pnpm test:button` | Button (UI) | `button.test.tsx` |
| `pnpm test:input` | Input (UI) | `input.test.tsx` |
| `pnpm test:card` | Card (UI) | `card.test.tsx` |

---

## 🪝 Hook Tests

```bash
pnpm test:use-auth      # Authentication hook
pnpm test:use-theme     # Theme context hook
pnpm test:use-debounce  # Debounce utility hook
```

---

## 🔌 API Tests

```bash
pnpm test:api-thesis    # Thesis CRUD operations
pnpm test:api-papers    # Paper search & retrieval
```

---

## 🔗 Integration Tests

```bash
pnpm test:integration-auth      # Authentication workflow
pnpm test:integration-thesis    # Thesis creation workflow
pnpm test:integration-ai        # AI tools workflow
```

---

## 👀 Watch Mode (Auto-run on changes)

```bash
pnpm test:watch:components    # Watch component tests
pnpm test:watch:hooks         # Watch hook tests
pnpm test:watch:api           # Watch API tests
pnpm test:watch:integration   # Watch integration tests
```

---

## 🏃 Batch Testing with Runner Script

```bash
node scripts/run-tests.js COMPONENT_TESTS      # Run all component tests
node scripts/run-tests.js HOOK_TESTS           # Run all hook tests
node scripts/run-tests.js API_TESTS            # Run all API tests
node scripts/run-tests.js INTEGRATION_TESTS    # Run all integration tests
```

---

## 📈 Coverage Reports

```bash
# Full coverage
pnpm test:coverage

# Category-specific coverage
pnpm test:coverage -- src/__tests__/components
pnpm test:coverage -- src/__tests__/hooks
pnpm test:coverage -- src/__tests__/api
pnpm test:coverage -- src/__tests__/integration
```

---

## ⚡ Advanced Commands

```bash
# Run specific test file
pnpm exec vitest run src/__tests__/components/editor.test.tsx

# Run tests matching pattern
pnpm exec vitest run -t "Editor"

# Run failed tests only
pnpm exec vitest --last-failed

# Debug mode
pnpm exec vitest --inspect-brk src/__tests__/components/editor.test.tsx

# JSON reporter
pnpm exec vitest run --reporter=json src/__tests__/components > results.json

# Verbose output
pnpm exec vitest run --reporter=verbose src/__tests__/components
```

---

## 📋 Test Coverage Map

### Components (13)
- **Feature Components** (10): editor, sign-in, dashboard, research-questions, outline, grammar, notifications, papers, theme, bibliography
- **UI Components** (3): button, input, card

### Hooks (3)
- useAuth, useTheme, useDebounce

### API (2)
- thesis, papers

### Integration (3)
- auth-workflow, thesis-creation-workflow, ai-tools-workflow

---

## 🎯 Common Use Cases

### Daily Development
```bash
# Start watch mode for components you're working on
pnpm test:watch:components
```

### Before Commit
```bash
# Run all tests to ensure nothing broke
pnpm test:all-categories
```

### Code Review
```bash
# Check coverage before review
pnpm test:coverage
```

### Specific Feature Testing
```bash
# Test editor component only
pnpm test:editor

# Test all auth-related code
pnpm test:integration-auth
```

### Continuous Integration
```bash
# Run all tests and report
pnpm test && pnpm test:coverage
```

---

## 💡 Tips & Tricks

### Test a single feature
```bash
# Just test the grammar checker
pnpm test:grammar
```

### Keep tests running
```bash
# Watch mode - reruns on file changes
pnpm test:watch:components
```

### Check what tests you have
```bash
# See all test files
ls -la src/__tests__/components/
ls -la src/__tests__/hooks/
ls -la src/__tests__/api/
ls -la src/__tests__/integration/
```

### Run tests silently
```bash
# No output except summary
pnpm exec vitest run --reporter=tap src/__tests__/components
```

---

## 📊 Test Statistics

| Category | Tests | Commands |
|----------|-------|----------|
| Components | 13 | 13 |
| Hooks | 3 | 3 |
| API | 2 | 2 |
| Integration | 3 | 3 |
| **Total** | **21** | **49+** |

---

## 🔗 Related Files

- Full Documentation: `TEST_COMMANDS_REFERENCE.md`
- Quick Text Reference: `TEST_QUICK_REFERENCE.txt`
- Session Summary: `TEST_FILES_CREATED_SESSION.md`
- Test Runner Script: `scripts/run-tests.js`

---

## ⌨️ Keyboard Shortcuts (in Vitest UI)

| Key | Action |
|-----|--------|
| `a` | Run all tests |
| `f` | Filter tests |
| `p` | Show only failed |
| `t` | Show only failed tests |
| `q` | Quit |
| `Space` | Toggle details |

---

## 🚨 Troubleshooting

**Tests not found?**
```bash
# Make sure you're in the right directory
cd c:/Users/Projects/thesis-ai-fresh
pnpm test
```

**Module errors?**
```bash
# Reinstall dependencies
pnpm install
```

**Timeout errors?**
```bash
# Increase timeout
pnpm exec vitest run --testTimeout=10000 src/__tests__/integration
```

**Want to debug?**
```bash
# Run in debug mode
node --inspect-brk ./node_modules/vitest/vitest.mjs run src/__tests__/components/editor.test.tsx
```

---

## 📝 Example Workflows

### Testing Editor Component Development
```bash
# Start watch mode
pnpm test:watch:components

# Make changes to editor component
# Tests will auto-run and show results

# When satisfied, run full suite
pnpm test:all-categories
```

### Pre-Deployment Testing
```bash
# Run all tests
pnpm test

# Generate coverage
pnpm test:coverage

# Check results in coverage/ directory
```

### Testing a New Feature
```bash
# Create test file in appropriate category
# Example: src/__tests__/components/new-feature.test.tsx

# Run just that test
pnpm exec vitest run src/__tests__/components/new-feature.test.tsx

# Run watch mode while developing
pnpm test:watch:components
```

---

**Last Updated:** 2025-12-16
**Total Commands:** 49+
**Total Test Files:** 31
