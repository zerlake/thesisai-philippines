# CI/CD Workflow Diagram

## Overall Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workflow                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Local Pre-flight Checks
                    (lint, tsc, test, build)
                              ↓
                    Git push origin branch
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions Automation Starts                    │
└─────────────────────────────────────────────────────────────────┘

┌─── PUSH TO DEVELOP/MAIN ────────────────────────────────┐
│                                                          │
│  ┌────────────────┐    ┌──────────────────┐             │
│  │  CI Tests      │    │  Lint & Quality  │             │
│  │  (10 min)      │    │  (5 min)         │             │
│  └────────────────┘    └──────────────────┘             │
│         ↓                      ↓                         │
│   • Unit Tests          • ESLint                        │
│   • Component Tests     • TypeScript                    │
│   • Hook Tests          • Dependencies                  │
│   • API Tests           • Security Audit                │
│   • Integration Tests                                   │
│   • Coverage Report                                     │
│                                                          │
│  ┌────────────────┐    ┌──────────────────┐             │
│  │  E2E Tests     │    │  Performance     │             │
│  │  (15 min)      │    │  Tests           │             │
│  └────────────────┘    │  (20 min)        │             │
│         ↓              └──────────────────┘             │
│   • Auth Flow                  ↓                        │
│   • Dashboard                • Lighthouse               │
│   • Editor                    • Bundle Size             │
│   • Core Features                                       │
│                                                          │
│  ┌────────────────────────────────────┐                │
│  │  Build & Deploy (MAIN ONLY)        │                │
│  │  (20 min)                          │                │
│  └────────────────────────────────────┘                │
│         ↓                                              │
│   • Build Next.js                                     │
│   • Security Scan (Trivy)                            │
│   • Store Artifacts                                   │
│                                                        │
└───────────────────────────────────────────────────────┘

┌─── PULL REQUEST ────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────┐                                  │
│  │  PR Checks       │                                  │
│  │  (15 min)        │                                  │
│  └──────────────────┘                                  │
│         ↓                                              │
│   • Title Validation                                  │
│   • Code Quality (changed files)                      │
│   • Coverage Report with Comment                      │
│   • Accessibility Checks                             │
│                                                       │
│  ┌──────────────────┐                                 │
│  │  All PR Jobs    │                                  │
│  │  PASS?          │                                  │
│  └──────────────────┘                                 │
│    ✓ YES      ✗ NO                                    │
│     │          │                                      │
│     ↓          ↓                                      │
│   Merge   Fix & Push Again                           │
│          (CI reruns)                                 │
│                                                      │
└────────────────────────────────────────────────────┘

┌─── SCHEDULED RUNS ──────────────────────────────────────┐
│                                                         │
│  Every 6 hours:     Daily at 4 AM UTC:               │
│  • Smoke Tests      • Full Test Suite                 │
│  • Quick Checks     • Dependency Check               │
│                     • Performance Baseline            │
│                     • Creates issues if needed        │
│                                                       │
└────────────────────────────────────────────────────────┘
```

## Parallel Execution Timeline

```
Typical PR/Push Event (Total ~30-45 minutes):

T=0min
├─ CI Tests [████████████ 10 min]
├─ Lint & Quality [██████ 5 min]
├─ E2E Tests [██████████████ 15 min]
├─ Performance Tests [████████████████ 20 min]
└─ PR Checks [██████████████ 15 min] (PR only)

Jobs run in parallel:
├─ Jobs 1-2: finish at ~10-15 min
├─ Jobs 3-4: finish at ~20 min
└─ Quality gate checks complete
```

## Detailed Workflow Breakdown

### 1. CI Tests Workflow

```
┌─ Test Job (Node 18.x & 20.x)
│  ├─ Checkout
│  ├─ Setup Node
│  ├─ Install deps
│  ├─ ESLint
│  ├─ TypeScript
│  ├─ Unit Tests
│  ├─ Component Tests
│  ├─ Hook Tests
│  ├─ API Tests
│  ├─ Integration Tests
│  ├─ Coverage Report
│  └─ Upload to Codecov
│
└─ Build Job
   ├─ Checkout
   ├─ Setup Node
   ├─ Install deps
   ├─ Build Next.js
   └─ Upload artifacts
```

### 2. Lint & Quality Workflow

```
┌─ Lint Job
│  ├─ ESLint check
│  ├─ TypeScript validation
│  └─ Unused imports check
│
└─ Dependency Check Job
   ├─ Audit (moderate level)
   └─ Check outdated
```

### 3. E2E Tests Workflow

```
┌─ Integration Tests
│  ├─ Auth workflow
│  ├─ Thesis workflow
│  └─ AI tools workflow
│
└─ Critical Path Tests
   ├─ Sign-in flow
   ├─ Dashboard
   ├─ Editor
   └─ Research questions
```

### 4. Performance Tests Workflow

```
┌─ Lighthouse Job
│  ├─ Collect metrics (3 runs)
│  ├─ Generate reports
│  └─ Comment on PR
│
└─ Bundle Analysis Job
   ├─ Build project
   └─ Analyze size
```

### 5. PR Checks Workflow

```
┌─ PR Validation
│  ├─ Title format
│  ├─ Large files check
│  └─ Commit messages
│
├─ Code Quality
│  ├─ Lint changed files
│  ├─ TypeScript check
│  └─ Affected tests
│
├─ Coverage Report
│  ├─ Generate report
│  ├─ Upload to Codecov
│  └─ Comment metrics
│
└─ Accessibility
   └─ A11y checks (placeholder)
```

### 6. Scheduled Tests Workflow

```
Daily 4 AM UTC:
├─ Nightly Tests
│  ├─ Full test suite
│  ├─ Coverage report
│  ├─ Build check
│  └─ Create issue if fails
│
├─ Dependency Check
│  ├─ Outdated packages
│  ├─ Security audit
│  └─ Create issue if needed
│
├─ Performance Baseline
│  ├─ Build & analyze
│  └─ Store metrics
│
└─ Cleanup
   └─ Delete old runs

Every 6 hours:
└─ Smoke Tests
   ├─ Critical paths only
   └─ Quick checks
```

### 7. Deployment Workflow

```
(Triggered on main push or after CI success)

├─ Build Job
│  ├─ Checkout
│  ├─ Install deps
│  ├─ Run tests
│  ├─ Build project
│  ├─ Create build info
│  └─ Upload artifacts
│
├─ Security Scan Job
│  ├─ Trivy FS scan
│  ├─ Generate SARIF
│  └─ Upload to GitHub
│
└─ Quality Gate Job
   ├─ Download build
   ├─ Verify build info
   └─ Confirm readiness
```

## Decision Flow

```
                    Code Change
                        │
                        ↓
                 Local Pre-flight?
                   ✓ YES    ✗ NO
                    │        └──→ Fix locally
                    ↓
                Git Push
                    │
                    ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
    Branch?                    Push to main?
    │                              │
    ├─ Develop                     ├─ All workflows
    │  └─ CI, Lint, E2E            │  └─ Including Deploy
    │                              │
    ├─ Feature                     └─ Build artifacts
    │  └─ CI, Lint, E2E            created
    │
    └─ PR
       └─ All + PR Checks
          └─ Must pass to merge

        ┌──────────────────┐
        │ Tests Passing?   │
        └──────────────────┘
          ✓ YES      ✗ NO
           │          │
           ↓          ↓
         Ready    Review Logs
         to       Fix Issues
         Merge    Push again
                  (CI reruns)
```

## Status Indicators

```
Workflow Status:
✅ Success    - All jobs passed
⏳ Running    - Currently executing
❌ Failed     - One or more jobs failed
⏭️ Skipped    - Conditions not met
⚠️  Warning   - Jobs passed but with warnings
🔄 Retry     - Manual retry triggered
```

## Artifact Flow

```
Build Artifacts:
.next/ → Store (30 days) → Deploy or Archive

Test Artifacts:
coverage/ → Codecov → PR Comments

Performance:
lighthouse/ → Report → PR Comments
build-stats/ → Store (90 days) → Historical tracking

Security:
SARIF report → GitHub Security → Dashboard
```

## Integration Points

```
┌─────────────────────────────────────┐
│  GitHub Repository                  │
│  └─ Workflows (.github/workflows/)  │
│     └─ YAML files                   │
└─────────────────────────────────────┘
         ↓        ↓         ↓
    ┌────┴────┐  ┌─────┐  ┌──────┐
    ↓         ↓  ↓     ↓  ↓      ↓
  Codecov  Lighthouse Trivy GitHub  Artifacts
           CI           Scan Security Storage
                               Tab
```

## Continuous Workflow (After Initial Setup)

```
Day 1: ✅ First run successful
Day 2-7: ✅ Daily scheduled tests pass
Week 1: Monitor performance metrics
Week 2: Review and optimize if needed
Month 1: Stable operation, track trends
Quarter 1: Review and update targets
```

## Failure Recovery

```
If workflow fails:

1. Check GitHub Actions UI
   ↓
2. Review workflow logs
   ↓
3. Identify root cause
   ↓
4. ┌─ Is it code? → Fix code → Commit → Push
   │
   └─ Is it env? → Update config → Push
   
5. Workflow reruns automatically
   ↓
6. Monitor for success
```

## Performance Metrics

```
Target Execution Times:
├─ CI Tests: 10 min
├─ Lint: 5 min
├─ E2E Tests: 15 min
├─ Performance: 20 min
├─ PR Checks: 15 min
├─ Deploy: 20 min
└─ Total (parallel): 30-45 min

Success Rate Target: >95%
Build Success: >98%
Test Coverage: >80%
```

## Notifications & Alerts

```
Automatic Notifications:
├─ PR checks pass/fail → GitHub UI
├─ Build failure → Issue created
├─ Outdated deps → Issue created
├─ Performance degradation → Issue created
├─ Security issues → GitHub Security tab
└─ Coverage drop → PR comment

Manual Check:
├─ GitHub Actions > Workflows
├─ Individual workflow runs
└─ Artifact downloads
```

---

This diagram shows the complete CI/CD flow from local development through automated testing to deployment.
