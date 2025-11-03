# Tasks: AI-Powered Academic Document Creation

**Feature**: [AI-Powered Academic Document Creation and Management](./spec.md)

This document outlines the development tasks required to implement the feature. Tasks are ordered by dependency.

## Task List

### Phase 1: Backend Setup (Database)

*These tasks set up the core database schema in Supabase. The table creation tasks can be run in parallel.*

- **T001: [P] Create Supabase migration for `profiles` table.**
  - **File**: `supabase/migrations/<timestamp>_create_profiles_table.sql`
  - **Details**: Create the SQL script to define the `profiles` table as specified in `data-model.md`. Ensure it is linked to `auth.users`.

- **T002: [P] Create Supabase migration for `documents` table.**
  - **File**: `supabase/migrations/<timestamp>_create_documents_table.sql`
  - **Details**: Create the SQL script to define the `documents` table as specified in `data-model.md`.

- **T003: [P] Create Supabase migration for `advisor_student_relationships` table.**
  - **File**: `supabase/migrations/<timestamp>_create_relationships_table.sql`
  - **Details**: Create the SQL script to define the `advisor_student_relationships` linking table.

- **T004: [P] Create Supabase migration for `payout_requests` table.**
  - **File**: `supabase/migrations/<timestamp>_create_payouts_table.sql`
  - **Details**: Create the SQL script to define the `payout_requests` table.

- **T005: Apply database migrations.**
  - **Details**: Use the Supabase CLI to apply all the newly created migration scripts to the local and remote database.
  - **Depends on**: T001, T002, T003, T004

- **T006: Implement Row-Level Security (RLS) policy for `documents`.**
  - **File**: `supabase/migrations/<timestamp>_add_documents_rls.sql`
  - **Details**: Write the SQL `POLICY` to ensure users can only access their own documents, and advisors can access documents of their assigned students.
  - **Depends on**: T005

- **T007: Implement Row-Level Security (RLS) policy for `profiles`.**
  - **File**: `supabase/migrations/<timestamp>_add_profiles_rls.sql`
  - **Details**: Write the SQL `POLICY` to ensure users can only view and edit their own profile information.
  - **Depends on**: T005

### Phase 2: API Development (AI Gateway)

*These tasks focus on building the internal API for handling AI-powered features.*

- **T008: [P] Create failing contract test for the AI Gateway.**
  - **File**: `src/tests/contract/ai-gateway.test.ts`
  - **Details**: Based on `contracts/ai-gateway.v1.json`, write a test that makes a POST request to `/api/ai/generate` and asserts the expected response shape. This test must fail initially.

- **T009: Create AI Gateway API route file.**
  - **File**: `src/app/api/ai/generate/route.ts`
  - **Details**: Create the Next.js API route file and add boilerplate code to accept POST requests.
  - **Depends on**: T008

- **T010: Implement request validation in AI Gateway.**
  - **File**: `src/app/api/ai/generate/route.ts`
  - **Details**: Add logic to validate the incoming request body against the schema defined in the contract (e.g., using Zod).

- **T011: Implement third-party LLM client.**
  - **File**: `src/services/llm-client.ts`
  - **Details**: Create a service/client to handle the actual API call to the external LLM provider (e.g., OpenAI). It should take a prompt and return the result.

- **T012: Implement core logic in AI Gateway.**
  - **File**: `src/app/api/ai/generate/route.ts`
  - **Details**: Connect the API route to the `llm-client`. It should receive the request, call the client, and return the response. Make the contract test from T008 pass.
  - **Depends on**: T010, T011

### Phase 3: Feature Implementation (Title Generator)

*These tasks implement a sample end-to-end feature using the backend and API created in previous phases.*

- **T013: [P] Create failing integration test for Title Generator.**
  - **File**: `src/tests/integration/title-generator.test.tsx`
  - **Details**: Write a React Testing Library test that renders the Title Generator page, simulates user input, and checks for the appearance of an AI-generated title. The test should mock the API call.

- **T014: Create Title Generator UI component.**
  - **File**: `src/components/title-generator.tsx`
  - **Details**: Build the React component with a text area for input and a button to trigger generation, as described in the spec.

- **T015: Create the Title Generator page.**
  - **File**: `src/app/(app)/title-generator/page.tsx`
  - **Details**: Create the page and embed the `title-generator` component.
  - **Depends on**: T014

- **T016: Connect Title Generator UI to AI Gateway.**
  - **File**: `src/components/title-generator.tsx`
  - **Details**: Implement the client-side logic to call the `/api/ai/generate` endpoint when the user clicks the button and display the result.
  - **Depends on**: T012, T015

- **T017: Make Title Generator integration test pass.**
  - **File**: `src/tests/integration/title-generator.test.tsx`
  - **Details**: Ensure the test from T013 now passes with the full implementation.
  - **Depends on**: T016

### Phase 4: Polish

- **T018: [P] Add unit tests for AI Gateway service logic.**
  - **File**: `src/services/llm-client.test.ts`
  - **Details**: Write unit tests for any complex logic within the `llm-client`, such as prompt construction or error handling.

- **T019: [P] Add documentation for the AI Gateway.**
  - **File**: `docs/api/ai-gateway.md`
  - **Details**: Write a short document explaining how to use the internal AI Gateway for other developers.

## Parallel Execution Guide

The following tasks are independent and can be worked on simultaneously.

**Group 1: Database Migrations**
- `T001`, `T002`, `T003`, `T004`

**Group 2: Initial Tests**
- `T008`, `T013`

**Group 3: Polish**
- `T018`, `T019`
