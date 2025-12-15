# Paper Search Source Capabilities

## Summary & Description Field Availability

| Source | Abstract | Summary | TL;DR | Notes |
|--------|----------|---------|-------|-------|
| **ArXiv** | ✅ Yes | ✅ `summary` field | ❌ No | Full abstract available in response |
| **Semantic Scholar** | ✅ Yes | ✅ `abstract` field | ✅ `tldr.text` (when available) | Most complete metadata; includes TL;DR summaries |
| **OpenAlex** | ⚠️ Partial | ✅ `abstract_inverted_index` | ❌ No | Provides inverted index (word positions only) |
| **CrossRef** | ❌ No | ❌ Not provided | ❌ No | Metadata-only API; no abstracts |

## Field Mapping in Code

### Source Fields → Paper Schema

**ArXiv**
```typescript
abstract: entry.summary
```
- Full textual abstract available
- Maps directly to `Paper.abstract`

**Semantic Scholar**
```typescript
abstract: paper.abstract
s2Tldr: paper.tldr?.text  // Optional TL;DR summary
```
- Has both full abstract and short TL;DR
- TL;DR stored separately in `s2FieldsOfStudy` and `s2Tldr`

**OpenAlex**
```typescript
abstract: work.abstract_inverted_index 
  ? Object.keys(work.abstract_inverted_index).join(' ') 
  : undefined
```
- Provides `abstract_inverted_index`: a map of words → position indices
- Reconstructed as word list (not full text) when available
- Often incomplete/unavailable

**CrossRef**
```typescript
abstract: undefined
```
- Does not provide abstract data
- Metadata-only (DOI, authors, year, venue, URL)

## Fallback Display Logic

Papers without native abstracts fall back to:
```typescript
paper.abstract || paper.s2Tldr || paper.generatedSummary
```

1. **Full abstract** (if available from any source)
2. **Semantic Scholar TL;DR** (if available)
3. **Generated summary** (created from metadata when abstract missing)

## Implications for UI

- **Papers from CrossRef alone**: Will show no abstract unless merged with Semantic Scholar
- **Mixed source papers**: Use best available summary (priority: abstract > TL;DR > generated)
- **Deduplication benefit**: Merging CrossRef + Semantic Scholar results provides abstracts for papers otherwise lacking them

## Example Scenarios

### Scenario 1: Paper found in all sources
- ArXiv + CrossRef + OpenAlex + Semantic Scholar
- → Display: ArXiv abstract (full text, preferred)

### Scenario 2: Paper found in CrossRef + Semantic Scholar
- CrossRef has metadata only
- Semantic Scholar provides abstract + TL;DR
- → Display: Semantic Scholar abstract

### Scenario 3: Paper found in OpenAlex only
- Has inverted index abstract (incomplete word list)
- → Display: Word list or generated summary if available

### Scenario 4: Paper found in CrossRef only
- No abstract available from any source
- → Display: Generated summary from title/venue/authors
