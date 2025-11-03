import React from "react";

// Mock the Supabase client
const mockSupabase = {
  functions: {
    invoke: jest.fn((functionName: string) => {
      if (functionName === "pdf-analyzer") {
        return Promise.resolve({
          data: { text: "mocked PDF content" },
          error: null,
        });
      }
      return Promise.resolve({
        data: { success: true, parsedCitations: [] },
        error: null,
      });
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({
        data: { session: { access_token: "mock-token" } },
        error: null,
      }),
    ),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};

// Mock the session
const mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  user: {
    id: "mock-user-id",
    email: "mock@example.com",
  },
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
};

// Mock the profile
const mockProfile = {
  id: "mock-user-id",
  role: "user",
  user_preferences: {
    dashboard_widgets: {},
    notification_preferences: {},
  },
};

// Mock the AuthContext and useAuth hook
export const AuthContext = React.createContext(null);

export const useAuth = jest.fn(() => ({
  supabase: mockSupabase,
  session: mockSession,
  profile: mockProfile,
  refreshProfile: jest.fn(() => Promise.resolve()),
}));

// Mock AuthProvider to simply render children
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Export mockSupabase for direct access in tests
export { mockSupabase };
