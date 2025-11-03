# Research: AI Gateway and Architecture

**Date**: 2025-10-18
**Spec**: [spec.md](./spec.md)

## 1. AI Feature Implementation

### Decision

All AI-powered features (e.g., outline generation, grammar check, paraphrasing) will be implemented via an internal abstraction layer, referred to as the "AI Gateway." This gateway will be a dedicated server-side module within the Next.js application, responsible for managing all interactions with external, third-party Large Language Model (LLM) providers.

### Rationale

This approach was chosen for several key reasons:

- **Provider Agnosticism**: An abstraction layer prevents vendor lock-in. If a better or more cost-effective LLM provider emerges, we can switch or add providers by updating the gateway's internal logic without refactoring every feature that uses AI.
- **Centralized Logic & Security**: API keys, prompting strategies, and request/response parsing are managed in one place. This improves security by keeping secrets on the server side and simplifies prompt engineering and maintenance.
- **Cost Management & Caching**: The gateway can implement centralized caching strategies to reduce redundant API calls and monitor token usage across the entire application, providing a single point for cost control.
- **Simplified Feature Development**: Frontend and feature developers do not need to know the specifics of the external LLM APIs. They will interact with a simplified, consistent internal API provided by the gateway.

### Alternatives Considered

- **Direct Frontend-to-API Calls**: This was rejected due to the significant security risk of exposing API keys on the client side and the difficulty of managing costs and prompt consistency across many components.
- **Self-Hosted Models**: Rejected for now due to the high operational overhead, infrastructure costs, and complexity of maintaining and scaling our own models. The gateway approach allows us to reconsider this in the future without a major architectural overhaul.

## 2. Supabase for Multi-Tenancy

### Decision

We will leverage Supabase's built-in **Row-Level Security (RLS)** to enforce data isolation between users, advisors, and critics. All database queries will be made through the Supabase client, which respects RLS policies based on the authenticated user's ID and role.

### Rationale

- **Proven Security Model**: RLS is a robust, standard PostgreSQL feature that is well-integrated into the Supabase ecosystem.
- **Simplified Backend Code**: By enforcing security at the database level, our application code can be simpler and less prone to data leakage bugs. We don't need to manually add `WHERE user_id = ...` clauses to every query.
- **Scalability**: RLS is highly performant and scales well with the number of users.

### Implementation Notes

- A default-deny policy will be implemented on all tables containing user data.
- Specific `POLICY` statements will be created for each table to allow `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations based on the user's role (`student`, `advisor`, `critic`, `admin`) and their relationship to the data (e.g., a user can only see their own documents; an advisor can only see documents of their assigned students).
