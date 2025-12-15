# Puter AI Global Implementation Guide

## Overview
This document outlines the complete implementation of Puter AI across all AI tool calls in the ThesisAI application, creating a unified AI interface that replaces direct Supabase function calls and OpenRouter API calls.

## Architecture

```
┌─────────────────────────────────────────┐
│     React Components / Pages             │
│   (All AI tool integrations)             │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Unified AI Wrapper (puter-ai-facade) │
│   - Tool routing                         │
│   - Error handling                       │
│   - Fallback management                  │
│   - Caching                              │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼────────┐  ┌────▼──────────┐
│ Puter AI SDK   │  │ OpenRouter API │
│ (Primary)      │  │ (Fallback)     │
└────────────────┘  └───────────────┘
```

## Implementation Plan

### Phase 1: Create Unified AI Facade (puter-ai-facade.ts)
- Wraps both Puter and OpenRouter
- Single entry point for all AI calls
- Automatic fallback switching

### Phase 2: Update React Components
- Replace direct `usePuterTool` calls with facade
- Update error handling
- Add loading states

### Phase 3: Update Supabase Functions
- Route through facade where applicable
- Update server-side calls

### Phase 4: Testing & Validation
- Run test suite
- Verify all tool calls work
- Check performance

## Files to Create/Modify

### New Files
1. `src/lib/puter-ai-facade.ts` - Unified wrapper
2. `src/hooks/useAITool.ts` - Simplified React hook

### Modified Files
1. `src/lib/puter-ai-integration.ts` - Add facade support
2. `src/hooks/usePuterTool.ts` - Keep for backward compatibility
3. Component files (50+ files calling AI tools)
4. Supabase function files (30+ functions)

## Global AI Tool Registry

### Text Generation & Analysis
- `generate-outline` - Structure planning
- `generate-topic-ideas` - Topic suggestions
- `generate-research-questions` - Question generation
- `generate-abstract` - Abstract writing
- `generate-conclusion` - Conclusion writing
- `generate-introduction` - Introduction writing
- `generate-methodology` - Methodology writing
- `improve-writing` - Writing enhancement
- `check-grammar` - Grammar checking
- `paraphrase-text` - Text paraphrasing
- `summarize-text` - Text summarization

### Research & Analysis
- `search-web` - Web search
- `search-google-scholar` - Academic search
- `analyze-document` - Document analysis
- `analyze-research-gaps` - Gap identification
- `check-plagiarism` - Plagiarism detection
- `check-originality` - Originality checking

### Content Creation
- `generate-flashcards` - Study materials
- `generate-defense-questions` - Defense prep
- `generate-presentation-slides` - Slide creation
- `generate-feedback` - Contextual feedback

## Configuration

### Environment Variables (Already set)
```
NEXT_PUBLIC_OPENROUTER_API_KEY=<key>
OPENROUTER_API_KEY=<key>
SUPABASE_URL=<url>
SUPABASE_SERVICE_ROLE_KEY=<key>
PUTER_API_KEY=<key> (if needed)
```

### Runtime Configuration
```typescript
const config = {
  primaryProvider: 'puter',        // 'puter' or 'openrouter'
  fallbackProvider: 'openrouter',
  timeout: 30000,
  retries: 3,
  cacheTTL: 3600000,              // 1 hour
  enableMetrics: true
};
```

## Implementation Details

### 1. Unified Facade Pattern
```typescript
// Single interface for all AI calls
const result = await aiService.call(
  'generate-outline',
  { topic: 'ML', level: 'thesis' },
  { timeout: 60000 }
);
```

### 2. Automatic Provider Selection
- Primary: Puter AI (via Supabase functions)
- Fallback: OpenRouter API (direct)
- Both support fallback responses

### 3. Enhanced Error Recovery
- Retry with exponential backoff
- Automatic provider switching
- Graceful degradation
- User-friendly error messages

### 4. Performance Optimization
- Multi-level caching
- Request deduplication
- Batch processing support
- Performance metrics

## Components to Update (Priority Order)

### HIGH PRIORITY (AI-critical paths)
1. `editor.tsx` - Main editor with AI tools
2. `student-dashboard.tsx` - Dashboard tools
3. `research-gap-identifier.tsx` - Gap analysis
4. `outline-generator.tsx` - Outline creation
5. `grammar-checker.tsx` - Grammar checking

### MEDIUM PRIORITY (Feature components)
6. `improve-writing-panel.tsx` - Writing enhancement
7. `bibliography-generator.tsx` - Bibliography
8. `citation-manager.tsx` - Citations
9. `document-analyzer.tsx` - Analysis
10. `presentation-generator.tsx` - Slides

### LOW PRIORITY (Utility components)
11. Other analytical components
12. Report generators
13. Feedback systems

## Testing Strategy

### Unit Tests
- Test facade with mock providers
- Verify fallback logic
- Check error handling

### Integration Tests
- Test with real Puter API
- Test with real OpenRouter API
- Test provider switching
- Test caching

### E2E Tests
- Full user workflows
- Component integration
- Performance validation

## Migration Checklist

- [ ] Create `puter-ai-facade.ts`
- [ ] Create `useAITool.ts` hook
- [ ] Update 5 HIGH priority components
- [ ] Test high priority features
- [ ] Update 10 MEDIUM priority components
- [ ] Test medium priority features
- [ ] Update remaining components
- [ ] Run full test suite
- [ ] Performance validation
- [ ] Documentation update
- [ ] Deploy and monitor

## Success Metrics

- ✅ All AI calls go through unified facade
- ✅ Fallback to OpenRouter when Puter unavailable
- ✅ <100ms cached response times
- ✅ <10s API response times
- ✅ 99% success rate with retries
- ✅ Zero TypeScript errors
- ✅ All tests passing

## Support & Troubleshooting

### Common Issues

**"Tool not found"**
→ Check function name in tool registry

**"Timeout after 30s"**
→ Increase timeout in options: `{ timeout: 60000 }`

**"Provider unavailable"**
→ Automatic fallback to OpenRouter

**"Supabase not initialized"**
→ Ensure useAuth() is available

## Documentation

- `PUTER_QUICK_REFERENCE.md` - Quick start
- `PUTER_INTEGRATION_README.md` - Full guide
- `PUTER_AI_INTEGRATION_GUIDE.md` - Technical guide
- `PUTER_IMPLEMENTATION_COMPLETE.md` - Implementation details

## Timeline

- **Phase 1**: 2-3 hours (facade creation)
- **Phase 2**: 4-6 hours (component updates)
- **Phase 3**: 2-3 hours (supabase updates)
- **Phase 4**: 2-3 hours (testing & validation)
- **Total**: 10-15 hours for full implementation

## Next Steps

1. Review this document
2. Create `puter-ai-facade.ts`
3. Create `useAITool.ts` hook
4. Update priority components
5. Run test suite
6. Deploy and monitor

---

**Status**: Ready for Implementation
**Version**: 1.0.0
**Date**: November 21, 2025
