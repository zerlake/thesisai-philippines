**Troubleshooting Narrative: Supabase Demo Login Issues**

**Problem Description:**
The primary issue is the inability to successfully log in demo users (Student, Advisor, Critic) via dedicated "Demo Login" buttons located within the Admin Dashboard of a Next.js application. The login process consistently fails with an an `AuthApiError: Invalid login credentials` error from the Supabase Auth API (`400 Bad Request` on `auth/v1/token?grant_type=password`).

**Context:**
*   **Application:** Next.js frontend.
*   **Authentication:** Supabase Auth.
*   **Demo User Provisioning:** A Supabase Edge Function named `ensure-demo-user` (and a temporary debug version `ensure-demo-user-debug-log-cors`) is responsible for creating/ensuring the existence of demo users (email: `demo-[role]@thesis.ai`, password: `password`) and their corresponding profiles in the `public.profiles` table. This function is invoked from the client-side `AdminDashboard` component.
*   **Login Flow:**
    1.  An authenticated Admin user clicks a "Demo Login" button in the `AdminDashboard`.
    2.  The client-side `handleDemoLogin` function first calls `supabase.auth.signOut()` to clear the current session.
    3.  It then invokes the `ensure-demo-user` (or debug) Edge Function to create/update the demo user and their profile.
    4.  Finally, it attempts to log in the newly ensured demo user using `supabase.auth.signInWithPassword({ email, password })`.
*   **Recent Changes:** The demo login buttons were recently moved from a public landing page to *inside* the authenticated Admin Dashboard. This change in context (calling the demo user provisioning/login from an already authenticated session) is suspected to be a contributing factor.

**Troubleshooting Steps Taken & Observations:**

1.  **Initial `403 Forbidden` from `identitytoolkit.googleapis.com`**:
    *   **Observation:** The first error encountered was a `403 Forbidden` from Firebase's `identitytoolkit.googleapis.com` during `signInWithCustomToken`. This was initially misdiagnosed as the primary login failure.
    *   **Resolution Attempt:** Debugging efforts focused on the `ensure-demo-user` Edge Function's CORS headers and internal logic.

2.  **Persistent CORS Issues (`x-client-info`, `apikey`)**:
    *   **Observation:** Repeated CORS errors (`Request header field x-client-info is not allowed...`, `Request header field apikey is not allowed...`) blocked the client from even reaching the `ensure-demo-user` Edge Function.
    *   **Resolution Attempt:** The `ALLOWED_HEADERS` array in `ensure-demo-user/index.ts` was explicitly updated to include `x-client-info` and `apikey`. Multiple redeployments were performed.
    *   **Current Status:** `curl` tests against the *debug* Edge Function (`ensure-demo-user-debug-log-cors`) confirm that its OPTIONS preflight *does* return the correct `Access-Control-Allow-Headers` including `x-client-info` and `apikey`. However, browser-initiated requests *still* report CORS errors, often pointing to the *original* `ensure-demo-user` function, suggesting aggressive client-side or platform-level caching.

3.  **`400 Bad Request: Invalid login credentials` from Supabase Auth**:
    *   **Observation:** When CORS issues were temporarily bypassed (or when the request successfully reached the Edge Function), the `supabase.auth.signInWithPassword` call consistently failed with "Invalid login credentials".
    *   **Resolution Attempt:**
        *   **Database Schema Check:** Verified `public.profiles` schema. Discovered `advisor_id` was missing from `profiles`, leading to `400 Bad Request` on REST queries. `dashboardService.ts` was updated to query `advisor_student_relationships` then `profiles`.
        *   **`email_confirm` flag:** Changed `email_confirm: true` to `false` in `ensure-demo-user` to test if email verification was the blocker. (This change was later reverted as it didn't resolve the issue).
        *   **Race Conditions:** Added 1-second delays after `createUser` and after `profiles` upsert in `ensure-demo-user` to mitigate potential race conditions where the user might not be fully propagated in Supabase Auth before login attempt. (These delays were later reverted as they didn't resolve the issue).
        *   **Client-side `signOut`**: Added `supabase.auth.signOut()` before `ensure-demo-user` invocation in `admin-dashboard.tsx` to ensure a clean authentication state.
    *   **Current Status:** Despite these changes, the "Invalid login credentials" error persists.

4.  **Lack of Edge Function `console.log` output in Supabase Dashboard Logs**:
    *   **Observation:** Even after deploying debug versions of the Edge Function with extensive `console.log` statements, the Supabase Dashboard logs for the Edge Function consistently return no entries for the function's internal `console.log` output. Only invocation summaries are visible.
    *   **Impact:** This severely hinders debugging, as we cannot see the runtime behavior of the `ensure-demo-user` function (e.g., if `createUser` or `upsert` are actually succeeding internally, or what exact `profileData` is being used).

**Why it's difficult to resolve:**

*   **Intermittent/Conflicting CORS Behavior**: The CORS errors are inconsistent (sometimes `x-client-info`, sometimes `apikey`, sometimes generic "No Access-Control-Allow-Origin"). The fact that `curl` shows correct CORS headers for the debug function, but the browser still fails, points to aggressive caching or platform-level interference with CORS headers that is beyond direct code control.
*   **Opaque Edge Function Logging**: The inability to view `console.log` output from within the Edge Function makes it impossible to verify the internal state and success/failure of critical operations like `supabaseAdmin.auth.admin.createUser` and `supabaseAdmin.from('profiles').upsert`. We are effectively debugging blind on the server-side logic.
*   **Supabase Auth Internal State**: The "Invalid login credentials" error, despite user creation attempts, suggests a deeper issue with how Supabase Auth is handling newly created users, especially in the context of admin-created accounts and the `email_confirm` flag. Without detailed Edge Function logs, it's hard to determine if the user is truly "login-ready" when `signInWithPassword` is called.
*   **Client-Side Caching**: Persistent client-side caching issues (even after aggressive clearing) are making it difficult to ensure the latest client code is interacting with the correct Edge Function endpoint.

**Request for External Expert:**

We require assistance in diagnosing the root cause of the "Invalid login credentials" error and the persistent CORS issues. Specifically, we need help with:

1.  **Verifying Supabase Edge Function Deployment & CORS Configuration**: How can we definitively ensure that the `ensure-demo-user` (and debug) Edge Functions are deployed with the exact `Access-Control-Allow-Headers` specified in the code, and that no platform-level overrides are occurring?
2.  **Accessing Comprehensive Edge Function Logs**: How can we gain access to the full `console.log` output from within the `ensure-demo-user` Edge Function to debug its runtime behavior?
3.  **Supabase Auth User Lifecycle**: What are the exact requirements for an admin-created user to be immediately "login-ready" via `signInWithPassword`? Are there specific Supabase Auth settings or RLS policies that might be interfering?
4.  **Debugging "Invalid login credentials"**: With full Edge Function logs, we can verify user creation. If creation is successful, what other factors could lead to `invalid_credentials` for an admin-created user?
