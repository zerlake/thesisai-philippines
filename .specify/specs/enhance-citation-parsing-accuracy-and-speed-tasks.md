# Tasks: Enhance citation parsing accuracy and speed

**Input**: Design documents from `C:\Users\Projects\thesis-ai\.specify\specs\`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure for web application (backend/frontend)
- [ ] T002 Initialize TypeScript project with Next.js, React, Tailwind CSS dependencies
- [ ] T003 [P] Configure linting and formatting tools (ESLint, Prettier)
- [ ] T004 Research testing framework for Next.js/React

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T005 [P] Integration test: Document upload and successful citation parsing
- [ ] T006 [P] Integration test: Large PDF upload and parsing speed
- [ ] T007 [P] Integration test: Imperfectly formatted references and error flagging
- [ ] T008 [P] Integration test: Handling corrupted/non-standard PDF metadata
- [ ] T009 [P] Integration test: Dynamic citation format changes
- [ ] T010 [P] Integration test: Partial parsing failure recovery
- [ ] T011 [P] Integration test: Citation parsing accuracy (FR-001)
- [ ] T012 [P] Integration test: Parsing speed for 100-page documents (FR-002)
- [ ] T013 [P] Integration test: APA, IEEE, MLA format support (FR-003)
- [ ] T014 [P] Integration test: Ambiguous/unrecognized citation flagging (FR-004)
- [ ] T015 [P] Integration test: Citation database dynamic updates (FR-005)
- [ ] T016 [P] Integration test: No parsing for handwritten notes/images (FR-006)
- [ ] T017 [P] Integration test: Unique citation identifier assignment (FR-007)
- [ ] T018 [P] Integration test: Encrypted storage and strict access for data (FR-008)
- [ ] T019 [P] Integration test: Retry mechanisms for DB integration failures (FR-009)
- [ ] T020 [P] Integration test: User interface for manual review of flagged citations (FR-010)

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T021 [P] Backend: Implement Citation entity model (PostgreSQL via Supabase)
- [ ] T022 [P] Backend: Implement Document entity model (PostgreSQL via Supabase)
- [ ] T023 [P] Backend: Implement ReferencePDF entity model (PostgreSQL via Supabase)
- [ ] T024 Backend: Develop core citation parsing service (FR-001, FR-002, FR-003)
- [ ] T025 Backend: Implement citation flagging logic (FR-004)
- [ ] T026 Backend: Implement unique citation identifier assignment (FR-007)
- [ ] T027 Backend: Implement retry mechanism for citation database integration (FR-009)
- [ ] T028 Backend: Implement secure storage and access controls for data (FR-008)
- [ ] T029 Frontend: Develop document upload component
- [ ] T030 Frontend: Develop citation display component
- [ ] T031 Frontend: Develop user interface for manual review of flagged citations (FR-010)

## Phase 3.4: Integration
- [ ] T032 Backend: Integrate citation parsing service with document upload
- [ ] T033 Backend: Integrate citation parsing service with citation database (FR-005)
- [ ] T034 Frontend: Integrate document upload with backend parsing service
- [ ] T035 Frontend: Integrate citation display with parsed data
- [ ] T036 Frontend: Integrate manual review UI with backend flagging system

## Phase 3.5: Polish
- [ ] T037 [P] Unit tests for citation parsing logic
- [ ] T038 [P] Unit tests for data models
- [ ] T039 Performance optimization for large PDF parsing
- [ ] T040 Update documentation for citation parsing feature

## Dependencies
- T001-T004 before T005-T020
- T005-T020 (all tests) before T021-T031 (core implementation)
- T021-T023 (models) before T024-T028 (services)
- T024-T028 (backend services) before T029-T031 (frontend components)
- T021-T031 (core implementation) before T032-T036 (integration)
- T032-T036 (integration) before T037-T040 (polish)

## Parallel Example
```
# Launch T005-T020 together (all integration tests):
Task: "Integration test: Document upload and successful citation parsing"
Task: "Integration test: Large PDF upload and parsing speed"
# ... (all other integration tests)

# Launch T021-T023 together (model implementations):
Task: "Backend: Implement Citation entity model (PostgreSQL via Supabase)"
Task: "Backend: Implement Document entity model (PostgreSQL via Supabase)"
Task: "Backend: Implement ReferencePDF entity model (PostgreSQL via Supabase)"

# Launch T037-T038 together (unit tests):
Task: "Unit tests for citation parsing logic"
Task: "Unit tests for data models"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
