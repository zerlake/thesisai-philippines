# Run Tests Guide - Complete Instructions

## 🎯 Overview

This guide shows you how to run all 31 test files organized into **49+ pnpm commands**.

---

## ⚡ Quick Start (Copy & Paste Ready)

```bash
# Run all tests
pnpm test

# Or with visual UI
pnpm test:ui

# Or with coverage
pnpm test:coverage
```

---

## 📁 Test Organization

```
Tests Created: 31 files across 4 categories

✓ 13 Component Tests      (src/__tests__/components/)
✓ 3 Hook Tests            (src/__tests__/hooks/)
✓ 2 API Tests             (src/__tests__/api/)
✓ 3 Integration Tests     (src/__tests__/integration/)
```

---

## 🎯 Category Commands (Run Everything in a Category)

### Components (13 Tests)
```bash
pnpm test:components
```
Includes: editor, sign-in, dashboard, research-questions, outline, grammar, notifications, papers, theme, bibliography, button, input, card

### Hooks (3 Tests)
```bash
pnpm test:hooks
```
Includes: useAuth, useTheme, useDebounce

### API (2 Tests)
```bash
pnpm test:api
```
Includes: thesis, papers

### Integration (3 Tests)
```bash
pnpm test:integration
```
Includes: auth-workflow, thesis-creation-workflow, ai-tools-workflow

### All Categories Together
```bash
pnpm test:all-categories
```
Runs 21 organized tests from all categories

---

## 🧩 Individual Component Commands (13)

### Feature Components

```bash
pnpm test:editor                    # Editor component
pnpm test:sign-in                   # Sign in form
pnpm test:dashboard                 # Student dashboard
pnpm test:research-questions        # Research question generator
pnpm test:outline                   # Outline builder
pnpm test:grammar                   # Grammar checker
pnpm test:notifications             # Notification bell
pnpm test:papers                    # Paper search bar
pnpm test:theme                     # Theme toggle
pnpm test:bibliography               # Bibliography generator
```

### UI Base Components

```bash
pnpm test:button                    # Button component
pnpm test:input                     # Input component
pnpm test:card                      # Card component
```

---

## 🪝 Individual Hook Commands (3)

```bash
pnpm test:use-auth                  # useAuth hook
pnpm test:use-theme                 # useTheme hook
pnpm test:use-debounce              # useDebounce hook
```

---

## 🔌 Individual API Commands (2)

```bash
pnpm test:api-thesis                # Thesis API
pnpm test:api-papers                # Papers API
```

---

## 🔗 Individual Integration Commands (3)

```bash
pnpm test:integration-auth          # Authentication workflow
pnpm test:integration-thesis        # Thesis creation workflow
pnpm test:integration-ai            # AI tools workflow
```

---

## 👀 Watch Mode Commands (4)

Perfect for development - reruns tests when files change:

```bash
pnpm test:watch:components          # Watch components
pnpm test:watch:hooks               # Watch hooks
pnpm test:watch:api                 # Watch API
pnpm test:watch:integration         # Watch integration
```

---

## 🏃 Batch Test Runner Script

Run entire categories with a batch script:

```bash
# Run all component tests with summary
node scripts/run-tests.js COMPONENT_TESTS

# Run all hook tests
node scripts/run-tests.js HOOK_TESTS

# Run all API tests
node scripts/run-tests.js API_TESTS

# Run all integration tests
node scripts/run-tests.js INTEGRATION_TESTS
```

---

## 📊 All 49+ Commands Summary

### Basic (3)
- `pnpm test` - All tests
- `pnpm test:ui` - With visual UI
- `pnpm test:coverage` - With coverage report

### Categories (6)
- `pnpm test:components`
- `pnpm test:hooks`
- `pnpm test:api`
- `pnpm test:integration`
- `pnpm test:personalization`
- `pnpm test:all-categories`

### Components (13)
- `pnpm test:editor`
- `pnpm test:sign-in`
- `pnpm test:dashboard`
- `pnpm test:research-questions`
- `pnpm test:outline`
- `pnpm test:grammar`
- `pnpm test:notifications`
- `pnpm test:papers`
- `pnpm test:theme`
- `pnpm test:bibliography`
- `pnpm test:button`
- `pnpm test:input`
- `pnpm test:card`

### Hooks (3)
- `pnpm test:use-auth`
- `pnpm test:use-theme`
- `pnpm test:use-debounce`

### API (2)
- `pnpm test:api-thesis`
- `pnpm test:api-papers`

### Integration (3)
- `pnpm test:integration-auth`
- `pnpm test:integration-thesis`
- `pnpm test:integration-ai`

### Watch Mode (4)
- `pnpm test:watch:components`
- `pnpm test:watch:hooks`
- `pnpm test:watch:api`
- `pnpm test:watch:integration`

### Batch Runner (4)
- `node scripts/run-tests.js COMPONENT_TESTS`
- `node scripts/run-tests.js HOOK_TESTS`
- `node scripts/run-tests.js API_TESTS`
- `node scripts/run-tests.js INTEGRATION_TESTS`

---

## 🔥 Common Workflows

### Workflow 1: Quick Test During Development
```bash
# Terminal 1: Watch your component tests
pnpm test:watch:components

# Make changes, tests run automatically
```

### Workflow 2: Test Before Commit
```bash
# Run all tests to ensure nothing broke
pnpm test:all-categories
```

### Workflow 3: Test Specific Feature
```bash
# Test only the grammar checker
pnpm test:grammar

# Or test an entire category
pnpm test:hooks
```

### Workflow 4: Full Pre-Deployment Check
```bash
# Run all tests
pnpm test

# Generate coverage report
pnpm test:coverage

# Check results in coverage/ directory
```

### Workflow 5: Test New Component
```bash
# Create your test file, then run it
pnpm test:editor  # or your component name
```

---

## 📈 Running Tests with Coverage

### Full Coverage
```bash
pnpm test:coverage
```

### Category Coverage
```bash
pnpm test:coverage -- src/__tests__/components
pnpm test:coverage -- src/__tests__/hooks
pnpm test:coverage -- src/__tests__/api
pnpm test:coverage -- src/__tests__/integration
```

### Individual File Coverage
```bash
pnpm exec vitest run --coverage src/__tests__/components/editor.test.tsx
```

---

## 🛠️ Advanced Options

### Run Single Test File
```bash
pnpm exec vitest run src/__tests__/components/editor.test.tsx
```

### Run Tests Matching Pattern
```bash
pnpm exec vitest run -t "Editor"
```

### Run Failed Tests Only
```bash
pnpm exec vitest --last-failed
```

### Debug Mode
```bash
pnpm exec vitest --inspect-brk src/__tests__/components/editor.test.tsx
```

### JSON Report
```bash
pnpm exec vitest run --reporter=json src/__tests__/components > results.json
```

### Verbose Output
```bash
pnpm exec vitest run --reporter=verbose src/__tests__/components
```

---

## 📋 Test File Locations

```
src/__tests__/
├── components/                           (13 test files)
│   ├── editor.test.tsx
│   ├── sign-in-form.test.tsx
│   ├── student-dashboard.test.tsx
│   ├── research-question-generator.test.tsx
│   ├── outline-builder.test.tsx
│   ├── grammar-checker.test.tsx
│   ├── notification-bell.test.tsx
│   ├── paper-search-bar.test.tsx
│   ├── theme-toggle.test.tsx
│   ├── bibliography-generator.test.tsx
│   ├── button.test.tsx
│   ├── input.test.tsx
│   └── card.test.tsx
│
├── hooks/                                (3 test files)
│   ├── useAuth.test.ts
│   ├── useTheme.test.ts
│   └── useDebounce.test.ts
│
├── api/                                  (2 test files)
│   ├── thesis.test.ts
│   └── papers.test.ts
│
└── integration/                          (3 test files)
    ├── auth-workflow.test.tsx
    ├── thesis-creation-workflow.test.tsx
    └── ai-tools-workflow.test.ts
```

---

## ✅ Verification Checklist

After running tests:

- [ ] All component tests passing
- [ ] All hook tests passing
- [ ] All API tests passing
- [ ] All integration tests passing
- [ ] Coverage report generated
- [ ] No console errors

---

## 🚨 Troubleshooting

### Problem: Tests not found
```bash
# Solution: Make sure you're in the right directory
cd c:/Users/Projects/thesis-ai-fresh
pnpm test
```

### Problem: Module not found errors
```bash
# Solution: Reinstall dependencies
pnpm install
```

### Problem: Tests timing out
```bash
# Solution: Increase timeout
pnpm exec vitest run --testTimeout=10000 src/__tests__/integration
```

### Problem: Want to see output
```bash
# Solution: Use verbose reporter
pnpm exec vitest run --reporter=verbose
```

---

## 📚 Documentation Files

For more information, see these files:

- **TEST_COMMANDS_REFERENCE.md** - Detailed command documentation
- **TEST_QUICK_REFERENCE.txt** - One-page text reference
- **TEST_COMMANDS_CHEATSHEET.md** - Quick reference with examples
- **TEST_FILES_CREATED_SESSION.md** - Complete session summary
- **RUN_TESTS_GUIDE.md** - This file
- **scripts/run-tests.js** - Batch test runner script

---

## 🎓 Quick Command Lookup

| Need | Command |
|------|---------|
| Run all tests | `pnpm test` |
| Visual UI | `pnpm test:ui` |
| Coverage | `pnpm test:coverage` |
| Test components | `pnpm test:components` |
| Test hooks | `pnpm test:hooks` |
| Test APIs | `pnpm test:api` |
| Test workflows | `pnpm test:integration` |
| Watch mode | `pnpm test:watch:components` |
| Specific test | `pnpm test:editor` |
| All tests organized | `pnpm test:all-categories` |

---

## 🎯 Example: Testing a Single Component

```bash
# Test the editor component
pnpm test:editor

# Output shows:
# ✓ renders editor container
# ✓ handles text input
# ✓ renders save button
# ✓ renders formatting toolbar
```

---

## 🎯 Example: Full Test Suite Run

```bash
# Run everything
pnpm test

# Or organized by category
pnpm test:all-categories

# With coverage
pnpm test:coverage
```

---

## Summary

You now have:

✅ **31 test files** across 4 categories
✅ **49+ pnpm commands** to run tests
✅ **Multiple ways to organize** test execution
✅ **Watch mode** for development
✅ **Batch runner** for automation
✅ **Coverage reports** for metrics

**Start testing:** `pnpm test`

---

**Created:** 2025-12-16  
**Tests:** 31 files  
**Commands:** 49+  
**Categories:** 4
