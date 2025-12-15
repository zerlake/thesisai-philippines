# CI/CD Quick Reference

## Workflow Status
- **GitHub Actions:** https://github.com/zerlake/thesisai-philippines/actions
- **Badges:** Add to README for branch status

## Workflows at a Glance

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| CI Tests | push/PR | Unit & integration tests | ~10 min |
| Lint & Quality | push/PR | Code style & TypeScript | ~5 min |
| E2E Tests | push/PR/daily | Critical paths | ~15 min |
| Performance | push/daily | Lighthouse & bundle | ~20 min |
| PR Checks | PR events | Quality gates | ~15 min |
| Scheduled | Daily 4AM UTC | Comprehensive suite | ~45 min |
| Deploy | main push | Build & artifacts | ~20 min |

## Key Files

```
.github/workflows/
  ├── ci-tests.yml              # Main test suite
  ├── lint-code.yml             # Code quality
  ├── e2e-tests.yml             # Integration tests
  ├── performance-tests.yml     # Lighthouse & bundle
  ├── pr-checks.yml             # PR validation
  ├── scheduled-tests.yml       # Nightly/periodic
  └── deployment.yml            # Build & deploy

lighthouse-ci-config.json       # Lighthouse settings
CI_CD_SETUP_GUIDE.md           # Full documentation
CI_CD_QUICK_REFERENCE.md       # This file
```

## Common Commands

```bash
# Local testing (mimics CI)
pnpm test -- --run                    # All tests
pnpm test:coverage -- --run           # With coverage
pnpm lint                             # Linting
pnpm exec tsc --noEmit                # TypeScript
pnpm build                            # Build check

# Specific test suites
pnpm test:components -- --run
pnpm test:hooks -- --run
pnpm test:api -- --run
pnpm test:integration -- --run
pnpm test:sign-in -- --run
pnpm test:dashboard -- --run
```

## PR Checklist

Before pushing:
- [ ] Tests pass locally: `pnpm test -- --run`
- [ ] No linting errors: `pnpm lint`
- [ ] TypeScript clean: `pnpm exec tsc --noEmit`
- [ ] Build succeeds: `pnpm build`
- [ ] Commit message follows format: `feat: ...` or `fix: ...`

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance | ≥80% | — |
| Accessibility | ≥90% | — |
| Best Practices | ≥85% | — |
| SEO | ≥90% | — |
| FCP | <3s | — |
| LCP | <4s | — |
| CLS | <0.1 | — |
| TBT | <300ms | — |

## Commit Message Format

```
feat(scope): add new feature
fix(scope): resolve bug
docs: update documentation
style: formatting changes
refactor(scope): restructure code
perf(scope): improve performance
test: add tests
chore: maintenance tasks
ci: CI/CD configuration
```

## Workflow Triggers

### On Every Push
- `ci-tests.yml` (main/develop)
- `lint-code.yml` (on src changes)
- `performance-tests.yml` (on src changes)
- `deployment.yml` (main only)

### On Every PR
- `ci-tests.yml`
- `lint-code.yml`
- `e2e-tests.yml`
- `pr-checks.yml`

### On Schedule
- **Daily 4 AM UTC:** Full test suite, dependencies check
- **Every 6 hours:** Smoke tests

### Manual
- All workflows can be triggered via Actions tab

## Artifact Access

**Build artifacts:** GitHub Actions > [Workflow] > [Build job] > Artifacts
- `.next/` folder: Next.js build output
- Retained: 30 days

**Test coverage:** 
- Codecov dashboard
- PR comments with metrics
- Coverage report in artifacts

**Performance baselines:**
- Artifact: `performance-baseline-{run_number}`
- Retained: 90 days

## Monitoring

### Daily Health Checks
1. Visit Actions tab
2. Check latest runs on main
3. Review any failed jobs
4. Check created issues

### Performance Tracking
- Access Lighthouse reports in performance-tests job
- Monitor bundle size artifacts
- Track trends in build metrics

### Security
- Review Trivy scan results in deployment job
- Check dependency advisories
- Address high-severity issues immediately

## Troubleshooting

**Tests failing locally?**
```bash
pnpm install --frozen-lockfile
pnpm test -- --run
```

**Build failing?**
```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

**PR blocked by checks?**
- Check "Details" link on failing check
- Review workflow logs
- Fix locally and push again

**Timeout issues?**
- Check workflow duration
- Consider splitting tests
- Optimize test performance

## Resources

- [Full CI/CD Guide](./CI_CD_SETUP_GUIDE.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Docs](https://vitest.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Contact & Support

For CI/CD issues:
1. Check this quick reference
2. Read full CI_CD_SETUP_GUIDE.md
3. Review workflow logs
4. Ask in team channel
