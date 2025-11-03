// Path: src/services/institutionRequests.ts

// Purpose: Fetch pending institution requests and include requester profile data.

// Assumes: src/integrations/supabase/client.ts exports a named `supabase`.

import { supabase } from "../integrations/supabase/client-with-error-handling";
type InstitutionRequest = {
  id: string;
  name: string | null;
  requested_by: string | null;
  status: string;
  created_at?: string;
  reviewed_at?: string | null;
  reviewer_notes?: string | null;
};
type Profile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};
export async function fetchPendingInstitutionRequestsWithProfiles(): Promise<
  Array<InstitutionRequest & { requester_profile: Profile | null }>
> {
  try {
    // 1) Fetch pending requests
    const { data: requests, error: reqError } = await supabase
      .from("institution_requests")
      .select("*")
      .eq("status", "pending");
    
    // Handle the case where the table doesn't exist
    if (reqError && (reqError as any).code === 'PGRST205') {
      console.warn("institution_requests table not found, returning empty array");
      return [];
    }
    
    // Handle network errors specifically
    if (reqError && reqError.message && (reqError.message.includes("Failed to fetch") || reqError.message.includes("NetworkError"))) {
      console.warn("Network error fetching institution requests:", reqError.message);
      return [];
    }
    
    if (reqError) {
      throw reqError;
    }
    
    if (!requests || requests.length === 0) {
      return [];
    }
    // 2) Collect unique requester ids
    const userIds = Array.from(
      new Set(requests.map((r) => r.requested_by).filter(Boolean) as string[]),
    );
    if (userIds.length === 0) {
      return requests.map((r) => ({ ...r, requester_profile: null }));
    }
    // 3) Fetch profiles for requesters
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);
    if (profError) {
      // Handle network errors specifically
      if (profError.message && (profError.message.includes("Failed to fetch") || profError.message.includes("NetworkError"))) {
        console.warn("Network error fetching profiles for institution requests:", profError.message);
        return requests.map((r) => ({ ...r, requester_profile: null }));
      }
      // Log and return requests without merged profiles if fetching profiles fails
      console.error(
        "Failed to fetch profiles for institution requests:",
        profError,
      );
      return requests.map((r) => ({ ...r, requester_profile: null }));
    }
    const profileById = (profiles || []).reduce<Record<string, Profile>>(
      (acc, p) => {
        if (p && p.id) acc[p.id] = p;
        return acc;
      },
      {},
    );
    return requests.map((req) => ({
      ...req,
      requester_profile: req.requested_by
        ? (profileById[req.requested_by] ?? null)
        : null,
    }));
  } catch (error: any) {
    // Check if it's a table not found error
    if (error?.code === 'PGRST205') {
      console.warn("institution_requests table not found, returning empty array");
      return [];
    }
    // Handle network errors specifically
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      console.warn("Network error in fetchPendingInstitutionRequestsWithProfiles:", error.message);
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}
