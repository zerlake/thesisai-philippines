# Phase 5 Cleanup - Quick Execution Checklist

**Target**: Remove 25 unused Supabase functions & update docs  
**Time**: 1-2 hours  
**Status**: Ready to execute

---

## Functions to Delete (25 total)

### Batch 1: Generation Functions (8)
- [ ] `supabase/functions/generate-abstract/`
- [ ] `supabase/functions/generate-citation/`
- [ ] `supabase/functions/generate-citation-from-source/`
- [ ] `supabase/functions/generate-conclusion/`
- [ ] `supabase/functions/generate-defense-questions/`
- [ ] `supabase/functions/generate-feedback/`
- [ ] `supabase/functions/generate-flashcards/`
- [ ] `supabase/functions/generate-outline/`

### Batch 2: Presentation & Survey (4)
- [ ] `supabase/functions/generate-presentation/`
- [ ] `supabase/functions/generate-presentation-slides/`
- [ ] `supabase/functions/generate-survey-questions/`
- [ ] `supabase/functions/generate-titles/`

### Batch 3: Research & Analysis (6)
- [ ] `supabase/functions/check-originality/`
- [ ] `supabase/functions/check-internal-plagiarism/`
- [ ] `supabase/functions/interpret-results/`
- [ ] `supabase/functions/search-google-scholar/`
- [ ] `supabase/functions/search-web/`
- [ ] `supabase/functions/synthesize-literature/`

### Batch 4: Misc & Legacy (3)
- [ ] `supabase/functions/ensure-demo-user/`
- [ ] `supabase/functions/get-serpapi-status/`
- [ ] `supabase/functions/call-arxiv-mcp-server/`

### Batch 5: Legacy AI Functions (2)
- [ ] `supabase/functions/grammar-check/`
- [ ] `supabase/functions/paraphrase-text/`

### Batch 6: Data Processing (1)
- [ ] `supabase/functions/pdf-analyzer/`

---

## Pre-Cleanup Verification (15 min)

```bash
# Verify no usage in codebase
grep -r "generate-abstract" src/
grep -r "generate-citation[^-]" src/
grep -r "generate-conclusion" src/
grep -r "check-originality" src/
grep -r "synthesize-literature" src/
grep -r "grammar-check" src/
grep -r "paraphrase-text" src/
grep -r "pdf-analyzer" src/
```

Expected: All return empty (no matches)

- [ ] grep searches confirm no usage
- [ ] 25 functions verified as unused

---

## Documentation Updates

### File 1: PHASE_5_WORK_COMPLETE.md
- [ ] Add cleanup section to "What's Production-Ready"
- [ ] Update statistics (45+ → 23 functions)
- [ ] Note cleanup completion in summary

### File 2: PHASE_5_CLEANUP_EXECUTION.md (NEW)
- [ ] Create file documenting cleanup details
- [ ] List all 25 deleted functions with reasons
- [ ] Document post-cleanup metrics

### File 3: AGENTS.md
- [ ] Add cleanup command section to maintenance
- [ ] Document function inventory verification command

### File 4: PHASE_5_STATUS.txt
- [ ] Update progress: "Cleanup complete - 25 functions removed"
- [ ] Note Phase 5 progress: 45%+

### File 5: MCP_IMPLEMENTATION_FILES.md
- [ ] Update Supabase function inventory
- [ ] Note 23 active functions remaining

---

## Deletion Commands

```powershell
# Delete all 25 unused function directories
$functionsToDelete = @(
    'generate-abstract',
    'generate-citation',
    'generate-citation-from-source',
    'generate-conclusion',
    'generate-defense-questions',
    'generate-feedback',
    'generate-flashcards',
    'generate-outline',
    'generate-presentation',
    'generate-presentation-slides',
    'generate-survey-questions',
    'generate-titles',
    'check-originality',
    'check-internal-plagiarism',
    'interpret-results',
    'search-google-scholar',
    'search-web',
    'synthesize-literature',
    'ensure-demo-user',
    'get-serpapi-status',
    'call-arxiv-mcp-server',
    'grammar-check',
    'paraphrase-text',
    'pdf-analyzer'
)

foreach ($func in $functionsToDelete) {
    $path = "supabase/functions/$func"
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "✓ Deleted: $func"
    }
}
```

- [ ] Run deletion command (or manually delete via Git)
- [ ] Verify all 25 directories deleted
- [ ] Confirm 23 active function directories remain

---

## Code Verification (15 min)

```bash
# Rebuild project
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Verify no new errors
```

- [ ] Build succeeds
- [ ] All tests pass
- [ ] No lint errors
- [ ] No TypeScript errors

---

## Functions to Keep (23 - VERIFY INTACT)

- [ ] advisor-invite-student
- [ ] align-questions-with-literature
- [ ] analyze-research-gaps
- [ ] coinbase-webhook
- [ ] create-coinbase-charge
- [ ] generate-hypotheses (ACTIVE)
- [ ] generate-research-questions (ACTIVE)
- [ ] generate-topic-ideas (ACTIVE)
- [ ] generate-topic-ideas-enterprise (ACTIVE)
- [ ] manage-advisor-assignment
- [ ] manage-advisor-request
- [ ] manage-critic-request
- [ ] manage-institution-request
- [ ] manage-payout-request
- [ ] puter-ai-wrapper
- [ ] request-payout
- [ ] run-statistical-analysis
- [ ] send-reminder-notification
- [ ] transfer-credit
- [ ] update-user-role
- [ ] check-plagiarism
- [ ] _shared (if needed by others)
- [ ] (add any others found)

---

## Final Testing (15 min)

```typescript
// Test 1: Verify puter-ai-wrapper still works
const { data, error } = await supabase.functions.invoke('puter-ai-wrapper', {
  body: { tool: 'test', input: 'test' }
});
// Should: Work without errors

// Test 2: Verify analyze-research-gaps still works
const { data, error } = await supabase.functions.invoke('analyze-research-gaps', {
  body: { papers: [] }
});
// Should: Work without errors
```

- [ ] Test 1: puter-ai-wrapper functions
- [ ] Test 2: analyze-research-gaps functions
- [ ] Confirm no runtime errors

---

## Documentation Finalization

- [ ] All 5 documentation files updated
- [ ] Cross-references checked for consistency
- [ ] No broken links or references
- [ ] Summary added to main status files

---

## Git Commit

```bash
git add -A
git commit -m "Phase 5 cleanup: Remove 25 unused Supabase functions

- Deleted grammar-check, paraphrase-text (superseded by Puter AI)
- Deleted generate-* functions (never invoked)
- Deleted search-* and check-* functions (unused)
- Updated documentation with cleanup notes
- Verified 23 active functions remain intact
- Reduced technical debt: 45+ → 23 active functions

Phase 5 now 45%+ complete with production-ready foundation."
```

- [ ] Review changes before commit
- [ ] Commit message clear and documented
- [ ] Push to repository

---

## Post-Cleanup Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Supabase Functions | 45+ | 23 | -22 (-49%) |
| Active Functions | 23 | 23 | 0 (all kept) |
| Unused Functions | 22 | 0 | -22 (removed) |
| Code Debt | High | Low | Reduced |
| Phase 5 Complete | 42% | 45%+ | +3% |

---

## Sign-Off Checklist

- [ ] All 25 functions deleted successfully
- [ ] All 23 active functions verified intact
- [ ] All 5 documentation files updated
- [ ] Build passes: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] Lint passes: `pnpm lint`
- [ ] Quick function tests successful
- [ ] Git commit clean and documented
- [ ] Ready for deployment

---

## Time Tracking

| Task | Time | Status |
|------|------|--------|
| Verification | 15 min | ⏱️ |
| Deletion | 30 min | ⏱️ |
| Documentation | 30 min | ⏱️ |
| Build/Test/Lint | 15 min | ⏱️ |
| Git Commit | 10 min | ⏱️ |
| **Total** | **100 min** | **1h 40m** |

---

## Next Steps After Cleanup

1. **Session 9**: UI Components & Integration (3-4 hours)
   - Error boundary components
   - Loading skeleton UI
   - Dashboard page integration
   - Widget examples

2. **Session 10**: Testing & Polish (2-3 hours)
   - Integration tests
   - Performance monitoring
   - Production deployment

3. **Phase 5 Complete**: 60%+ coverage

---

**Status**: Ready to execute  
**Duration**: 1-2 hours  
**Difficulty**: Low (mostly file deletion + docs)  
**Risk**: Very low (no breaking changes)

---

Generated: November 28, 2025  
Ready for immediate execution
