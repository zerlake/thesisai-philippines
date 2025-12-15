# CI/CD Setup Guide - GitHub Actions

This guide documents the automated CI/CD pipeline set up for the Thesis AI project using GitHub Actions.

## Overview

The CI/CD pipeline consists of 6 main workflows:

1. **CI Tests** - Unit & integration tests on push/PR
2. **Lint & Code Quality** - ESLint, TypeScript, and dependency checks
3. **Performance Tests** - Lighthouse audits and bundle analysis
4. **E2E Tests** - End-to-end critical path testing
5. **PR Quality Checks** - Validation for pull requests
6. **Scheduled Tests** - Nightly and periodic maintenance tasks
7. **Build & Deploy** - Production build and deployment artifacts

## Workflows

### 1. CI Tests (`ci-tests.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **test** - Runs complete test suite with Node 18 and 20
  - ESLint checks
  - TypeScript validation
  - Unit tests
  - Component tests
  - Hook tests
  - API tests
  - Integration tests
  - Coverage report & Codecov upload

- **build** - Verifies production build succeeds
  - Builds Next.js project
  - Uploads build artifacts (.next folder)

**Configuration:**
```yaml
- Matrix testing: Node 18.x and 20.x
- Timeout: 30 minutes
- Artifacts retained for 7 days
```

**Access Results:**
- GitHub Actions > CI - Automated Tests
- Check individual job logs for details

---

### 2. Lint & Code Quality (`lint-code.yml`)

**Triggers:**
- Push to `main` or `develop` with changes to src/
- Pull requests to `main` or `develop` with changes to src/

**Jobs:**
- **lint** - Code style and TypeScript validation
  - ESLint check
  - TypeScript type checking
  - Unused imports detection

- **dependency-check** - Security and health checks
  - npm audit for vulnerabilities
  - Check for outdated packages

**Configuration:**
```yaml
- ESLint: Next.js configuration
- Errors marked as warnings (continue-on-error: true)
- Helps maintain code quality without blocking merges
```

**Troubleshooting:**
- ESLint failures: Fix issues with `pnpm lint`
- TypeScript failures: Check types with `pnpm exec tsc --noEmit`

---

### 3. Performance Tests (`performance-tests.yml`)

**Triggers:**
- Push to `main` or `develop`
- Daily schedule: 2 AM UTC
- Manual trigger via workflow dispatch

**Jobs:**
- **lighthouse** - Lighthouse CI audits
  - Runs on 3 URLs with 3 runs each
  - Generates HTML reports
  - Comments results on PRs
  
- **bundle-analysis** - Bundle size analysis
  - Analyzes build output
  - Identifies large chunks

**Performance Targets:**
```json
{
  "performance": 0.8,
  "accessibility": 0.9,
  "best-practices": 0.85,
  "seo": 0.9,
  "fcp": 3000,  // milliseconds
  "lcp": 4000,  // milliseconds
  "cls": 0.1,   // cumulative layout shift
  "tbt": 300    // total blocking time
}
```

**Access Results:**
- GitHub Actions > Performance Tests
- Check Lighthouse CI reports in job logs
- Bundle analysis uploaded as artifacts

---

### 4. E2E Tests (`e2e-tests.yml`)

**Triggers:**
- Push to `main` or `develop`
- Daily schedule: 3 AM UTC
- Pull requests to `main` or `develop`

**Jobs:**
- **integration-tests** - Complete integration test suite
  - Auth workflow tests
  - Thesis workflow tests
  - AI tools workflow tests
  
- **critical-path-tests** - User journey tests
  - Sign-in flow
  - Dashboard access
  - Editor component
  - Research questions generator

**Configuration:**
```yaml
- Test files: src/__tests__/integration/
- Timeout: 25 minutes
- Failed tests uploaded as artifacts
```

**Running Specific Tests Locally:**
```bash
# Auth workflow
pnpm test:integration-auth -- --run

# Critical paths
pnpm test:sign-in -- --run
pnpm test:dashboard -- --run
```

---

### 5. PR Quality Checks (`pr-checks.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- PR opened, synchronized, or reopened

**Jobs:**
- **validate-pr** - PR metadata validation
  - Title follows conventional commits
  - Checks commit messages
  - Detects large files

- **code-quality** - Changes quality check
  - Runs linter only on changed files
  - TypeScript validation
  - Runs affected tests

- **test-coverage** - Coverage reporting
  - Generates coverage report
  - Comments with coverage metrics
  - Uploads to Codecov

- **accessibility** - A11y checks
  - Placeholder for accessibility scanning tools

**Commit Message Format:**
```
<type>(<scope>): <subject>

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
perf: performance improvement
test: testing
chore: maintenance
ci: CI/CD changes
```

**Allowed Prefixes:** feat, fix, docs, style, refactor, perf, test, chore, ci

---

### 6. Scheduled Tests & Maintenance (`scheduled-tests.yml`)

**Triggers:**
- Daily at 4 AM UTC (nightly tests)
- Every 6 hours (smoke tests)
- Manual workflow dispatch

**Jobs:**
- **nightly-tests** - Comprehensive test suite
  - All test categories
  - Linting & TypeScript
  - Build verification
  - Coverage generation
  - Creates issue if fails

- **smoke-tests** - Quick health check
  - Critical path tests only
  - Lightweight build
  - Every 6 hours

- **dependency-update** - Package health
  - Checks for outdated packages
  - Security audit
  - Creates issue for updates needed

- **performance-baseline** - Tracks performance
  - Build size monitoring
  - Artifact storage for 90 days

- **cleanup** - Maintenance
  - Deletes old workflow runs (>30 days)

---

### 7. Build & Deploy (`deployment.yml`)

**Triggers:**
- Push to `main` branch
- After successful CI/Lint workflows

**Jobs:**
- **build** - Production build
  - Runs tests
  - Builds Next.js
  - Creates build metadata
  - Stores artifacts for 30 days

- **security-scan** - Trivy vulnerability scan
  - File system scan
  - Generates SARIF report
  - Uploads to GitHub Security

- **quality-gate** - Final checks
  - Verifies build artifacts
  - Confirms readiness for deployment

---

## Local Testing

### Run Tests Locally

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run specific test suite
pnpm test:components -- --run
pnpm test:hooks -- --run
pnpm test:api -- --run
pnpm test:integration -- --run

# Watch mode
pnpm test:watch:components

# Coverage report
pnpm test:coverage

# Lint check
pnpm lint

# TypeScript check
pnpm exec tsc --noEmit

# Build
pnpm build
```

### Test Coverage

Coverage reports are generated and uploaded to Codecov. Access via:
- GitHub repo settings > Code coverage
- PR comments with coverage metrics
- Codecov dashboard

---

## GitHub Secrets & Configuration

### Required Secrets

No required secrets for basic CI/CD. Optional for enhanced features:

```
CODECOV_TOKEN          # For Codecov integration
LIGHTHOUSE_CI_TOKEN    # For Lighthouse CI
```

### Setup Secrets

1. Go to Repository Settings > Secrets and Variables > Actions
2. Click "New repository secret"
3. Add secret name and value
4. Workflows will automatically use them

---

## Troubleshooting

### Test Failures

1. **Check logs:** GitHub Actions > [Workflow] > [Job]
2. **Run locally first:**
   ```bash
   pnpm test -- --run
   ```
3. **Check dependencies:**
   ```bash
   pnpm install --frozen-lockfile
   ```

### Build Failures

1. Check TypeScript errors:
   ```bash
   pnpm exec tsc --noEmit
   ```
2. Check linting:
   ```bash
   pnpm lint
   ```
3. Verify build locally:
   ```bash
   pnpm build
   ```

### Timeout Issues

- Increase timeout in workflow file (max 360 minutes)
- Optimize test performance
- Run tests in parallel (already configured)

### Artifact Not Found

- Check retention days (default 7 days)
- Verify artifact name matches between upload/download
- Check workflow logs for upload success

---

## Best Practices

### 1. Commit Messages
Use conventional commit format for clear changelog generation:
```
feat(auth): add OAuth integration
fix(dashboard): resolve crash on load
docs: update README
```

### 2. PR Guidelines
- Keep PRs focused and small
- Write descriptive PR titles
- Reference related issues
- Add test coverage for new code

### 3. Test Coverage
Aim for:
- Components: >80% coverage
- Utilities: >90% coverage
- API routes: >85% coverage
- Overall: >80% coverage

### 4. Performance
- Monitor bundle size (target: <250KB gzipped)
- Keep Lighthouse scores above thresholds
- Profile slow tests
- Optimize images and assets

### 5. Dependencies
- Review dependency updates regularly
- Keep dependencies up-to-date
- Monitor security advisories
- Use `pnpm audit` before releases

---

## Monitoring & Maintenance

### View Workflow Status
1. GitHub repo > Actions tab
2. Filter by branch or workflow
3. Click workflow for details

### Performance Metrics
- **Build time:** ~10-15 minutes for full suite
- **Test duration:** ~5-10 minutes
- **Artifact size:** .next folder ~100-150MB

### Health Checks
- Monitor scheduled test results
- Review created issues for failures
- Check security scan results
- Track performance baselines

---

## Integration with Development

### Before Committing
```bash
# Local pre-commit checks
pnpm lint
pnpm exec tsc --noEmit
pnpm test -- --run
pnpm build
```

### After Pushing
1. GitHub Actions automatically runs CI
2. Check workflow status in PR
3. All checks must pass before merge
4. Maintainers can review build artifacts

### For Releases
1. Ensure all tests pass on main
2. Check security scan results
3. Review performance metrics
4. Create release with version tag
5. Deploy from successful build

---

## Advanced Configuration

### Custom Environment Variables
Add to workflow or repository settings:
```yaml
env:
  NODE_ENV: production
  CUSTOM_VAR: value
```

### Matrix Strategy
Modify for different Node versions or environments:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    os: [ubuntu-latest, windows-latest]
```

### Conditional Steps
Run specific steps based on conditions:
```yaml
if: github.event_name == 'pull_request'
if: failure()
if: success()
```

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Build Optimization](https://nextjs.org/docs/advanced-features/production-builds)

---

## Support & Questions

For issues or questions about the CI/CD setup:
1. Check this guide first
2. Review workflow logs in GitHub Actions
3. Check test output locally
4. Consult team documentation
