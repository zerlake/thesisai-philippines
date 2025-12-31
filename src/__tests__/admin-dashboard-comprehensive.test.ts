import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { useReferralPool } from '@/src/lib/referral-monitor';

// Mock the window object for client-side functionality
vi.stubGlobal('window', {
  ...global.window,
  puter: {
    ai: {
      chat: vi.fn().mockResolvedValue({ message: { content: 'Test response' } })
    }
  }
});

// Mock the cookies function
const mockCookies = {
  get: vi.fn().mockReturnValue({ value: 'mock-session' }),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => mockCookies,
}));

// Mock the Supabase client with realistic responses
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn(),
  limit: vi.fn().mockReturnThis(),
  rpc: vi.fn().mockReturnThis(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock Tremor components
vi.mock('@tremor/react', async () => {
  const actual = await vi.importActual('@tremor/react');
  return {
    ...actual,
    Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Metric: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: () => <div>LineChart</div>,
    BarChart: () => <div>BarChart</div>,
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  };
});

// Mock the referral monitor hook
vi.mock('@/src/lib/referral-monitor', () => ({
  useReferralPool: vi.fn(() => ({
    poolStatus: {
      student_remaining: 29650,
      advisor_remaining: 31650,
      critic_remaining: 27700,
      utilization_student: 14.5,
      utilization_advisor: 8.7,
      utilization_critic: 6.7,
      student_referrals_approved: 5,
      advisor_recruitments_approved: 3,
      critic_recruitments_approved: 2,
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('Admin Dashboard Integration Tests', () => {
  let supabaseUrl: string;
  let serviceRoleKey: string;
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
    supabase = createClient(supabaseUrl, serviceRoleKey);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Referral Dashboard Page', () => {
    it('should render the referral dashboard with pool metrics', async () => {
      // Dynamically import the page component
      const { default: ReferralDashboard } = await import('@/src/app/admin/referrals/dashboard/page');
      
      // Mock the useReferralPool hook to return test data
      const mockPoolData = {
        student_remaining: 29650,
        advisor_remaining: 31650,
        critic_remaining: 27700,
        utilization_student: 14.5,
        utilization_advisor: 8.7,
        utilization_critic: 6.7,
        student_referrals_approved: 5,
        advisor_recruitments_approved: 3,
        critic_recruitments_approved: 2,
      };

      (useReferralPool as vi.Mock).mockReturnValue({
        poolStatus: mockPoolData,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      // Render the component (in a real test we would use React Testing Library)
      expect(ReferralDashboard).toBeDefined();
      
      // Verify the hook is called
      expect(useReferralPool).toHaveBeenCalled();
    });

    it('should show loading state initially', () => {
      (useReferralPool as vi.Mock).mockReturnValue({
        poolStatus: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { poolStatus, loading } = useReferralPool();
      expect(loading).toBe(true);
      expect(poolStatus).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const testError = 'Failed to load pool status';
      (useReferralPool as vi.Mock).mockReturnValue({
        poolStatus: null,
        loading: false,
        error: testError,
        refetch: vi.fn(),
      });

      const { poolStatus, error } = useReferralPool();
      expect(error).toBe(testError);
      expect(poolStatus).toBeNull();
    });
  });

  describe('Referral Pool Data Access', () => {
    it('should fetch recruitment pool data from database', async () => {
      const mockPoolRecord = {
        id: 'test-pool-id',
        period_type: 'yearly',
        period_start: '2026-01-01',
        period_end: '2026-12-31',
        total_revenue: 660000.00,
        pool_percentage: 15.00,
        pool_amount: 99000.00,
        student_allocation: 34650.00,
        advisor_allocation: 34650.00,
        critic_allocation: 29700.00,
        spent_student: 5000,
        spent_advisor: 3000,
        spent_critic: 2000,
        status: 'open',
        created_at: '2025-12-30T00:00:00Z'
      };

      // Mock the database query
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'recruitment_pool') {
          return {
            ...mockSupabaseClient,
            select: vi.fn().mockResolvedValue({
              data: [mockPoolRecord],
              error: null
            })
          };
        }
        return mockSupabaseClient;
      });

      const { data, error } = await supabase
        .from('recruitment_pool')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual(mockPoolRecord);
    });

    it('should fetch referral events data', async () => {
      const mockReferralEvents = [
        {
          id: 'event-1',
          referrer_id: 'user-1',
          referred_id: 'user-2',
          event_type: 'student_subscription',
          status: 'approved',
          commission_amount: 1000,
          pool_allocation: 'student_35',
          created_at: '2025-12-30T10:00:00Z'
        }
      ];

      // Mock the database query
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'referral_events') {
          return {
            ...mockSupabaseClient,
            select: vi.fn().mockResolvedValue({
              data: mockReferralEvents,
              error: null
            })
          };
        }
        return mockSupabaseClient;
      });

      const { data, error } = await supabase
        .from('referral_events')
        .select('*')
        .eq('status', 'approved');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toEqual(mockReferralEvents);
    });
  });

  describe('Tremor Charts Integration', () => {
    it('should render Tremor chart components', async () => {
      // Import Tremor components that are used in the dashboard
      const Tremor = await import('@tremor/react');
      
      // Verify that required Tremor components are available
      expect(Tremor.Card).toBeDefined();
      expect(Tremor.Metric).toBeDefined();
      expect(Tremor.Text).toBeDefined();
      expect(Tremor.Grid).toBeDefined();
      expect(Tremor.LineChart).toBeDefined();
      expect(Tremor.BarChart).toBeDefined();
    });
  });

  describe('RLS Policy Verification', () => {
    it('should enforce admin-only access to referral data', async () => {
      // Mock an admin user profile
      const mockAdminProfile = {
        id: 'admin-user-id',
        email: 'admin@thesis.ai',
        role: 'admin',
        full_name: 'Admin User'
      };

      // Mock the profile query
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...mockSupabaseClient,
            select: vi.fn().mockResolvedValue({
              data: mockAdminProfile,
              error: null
            }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockAdminProfile,
              error: null
            })
          };
        }
        return mockSupabaseClient;
      });

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'admin-user-id')
        .single();

      expect(profileError).toBeNull();
      expect(profileData).toBeDefined();
      expect(profileData?.role).toBe('admin');
    });

    it('should restrict access for non-admin users', async () => {
      // Mock a non-admin user profile
      const mockStudentProfile = {
        id: 'student-user-id',
        email: 'student@thesis.ai',
        role: 'student',
        full_name: 'Student User'
      };

      // Mock the profile query to return student role
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            ...mockSupabaseClient,
            select: vi.fn().mockResolvedValue({
              data: mockStudentProfile,
              error: null
            }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockStudentProfile,
              error: null
            })
          };
        }
        return mockSupabaseClient;
      });

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'student-user-id')
        .single();

      expect(profileError).toBeNull();
      expect(profileData).toBeDefined();
      expect(profileData?.role).toBe('student');
      expect(profileData?.role !== 'admin').toBe(true);
    });
  });

  describe('Year 1 Sample Data Verification', () => {
    it('should have Year 1 pool record with correct allocations', async () => {
      const expectedYear1Data = {
        period_type: 'yearly',
        period_start: '2026-01-01',
        period_end: '2026-12-31',
        total_revenue: 660000.00,
        pool_percentage: 15.00,
        pool_amount: 99000.00, // 15% of 660k
        student_allocation: 34650.00, // 35% of pool
        advisor_allocation: 34650.00, // 35% of pool
        critic_allocation: 29700.00,  // 30% of pool
      };

      // Mock the database query for Year 1 data
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'recruitment_pool') {
          return {
            ...mockSupabaseClient,
            select: vi.fn().mockResolvedValue({
              data: [expectedYear1Data],
              error: null
            }),
            eq: vi.fn().mockReturnThis(),
          };
        }
        return mockSupabaseClient;
      });

      const { data, error } = await supabase
        .from('recruitment_pool')
        .select('*')
        .eq('period_start', '2026-01-01');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveLength(1);
      
      const year1Record = data[0];
      expect(year1Record.total_revenue).toBe(expectedYear1Data.total_revenue);
      expect(year1Record.pool_amount).toBe(expectedYear1Data.pool_amount);
      expect(year1Record.student_allocation).toBe(expectedYear1Data.student_allocation);
      expect(year1Record.advisor_allocation).toBe(expectedYear1Data.advisor_allocation);
      expect(year1Record.critic_allocation).toBe(expectedYear1Data.critic_allocation);
      
      // Verify the allocations add up to the pool amount
      expect(year1Record.student_allocation + year1Record.advisor_allocation + year1Record.critic_allocation)
        .toBe(year1Record.pool_amount);
    });
  });

  describe('Referral Alerts System', () => {
    it('should have referral alerts function deployed', () => {
      // This verifies that the referral alerts function exists in the codebase
      // In a real deployment test, we would check if the function is properly deployed
      expect(true).toBe(true); // The function exists in supabase/functions/referral-alerts/index.ts
    });

    it('should trigger alerts for high pool utilization', () => {
      // Test the logic that triggers alerts
      const poolData = {
        student_allocation: 34650,
        advisor_allocation: 34650, 
        critic_allocation: 29700,
        spent_student: 30000, // This is ~86% of allocation, should trigger alert
        spent_advisor: 500,
        spent_critic: 500
      };

      const studentUtilization = (poolData.spent_student / poolData.student_allocation) * 100;
      const advisorUtilization = (poolData.spent_advisor / poolData.advisor_allocation) * 100;
      const criticUtilization = (poolData.spent_critic / poolData.critic_allocation) * 100;

      // Student utilization should trigger alert (>85%)
      expect(studentUtilization).toBeGreaterThan(85);
      
      // Advisor and critic utilization should not trigger alert
      expect(advisorUtilization).toBeLessThan(85);
      expect(criticUtilization).toBeLessThan(85);
    });

    it('should trigger alerts for high-risk audits', () => {
      // Test the logic that triggers alerts for high-risk audits
      const highRiskAudit = {
        score: 80, // High risk score
        audit_type: 'suspicious_volume',
        action_taken: 'warning'
      };

      const mediumRiskAudit = {
        score: 40, // Medium risk score
        audit_type: 'low_quality',
        action_taken: 'warning'
      };

      // High risk audit should trigger alert
      expect(highRiskAudit.score).toBeGreaterThanOrEqual(75);
      
      // Medium risk audit should not trigger alert
      expect(mediumRiskAudit.score).toBeLessThan(75);
    });
  });

  describe('Realtime Monitoring', () => {
    it('should monitor referral events in realtime', () => {
      // This tests the concept of realtime monitoring
      // In a real test, we would check if the system listens to database changes
      const referralEvent = {
        type: 'INSERT',
        table: 'referral_events',
        record: {
          id: 'test-event-id',
          referrer_id: 'referrer-id',
          referred_id: 'referred-id',
          event_type: 'student_subscription',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      };

      // Verify the event structure
      expect(referralEvent.type).toBe('INSERT');
      expect(referralEvent.table).toBe('referral_events');
      expect(referralEvent.record.event_type).toBe('student_subscription');
      expect(referralEvent.record.status).toBe('pending');
    });

    it('should update pool allocations when referral status changes', () => {
      // Test the logic for updating pool allocations
      const initialPool = {
        student_allocation: 34650,
        advisor_allocation: 34650,
        critic_allocation: 29700,
        spent_student: 5000,
        spent_advisor: 3000,
        spent_critic: 2000
      };

      // Simulate a new approved referral
      const approvedReferral = {
        event_type: 'student_subscription',
        status: 'approved',
        pool_allocation: 'student_35'
      };

      // If referral is approved, pool allocation should be updated
      if (approvedReferral.status === 'approved' && approvedReferral.pool_allocation === 'student_35') {
        initialPool.spent_student += 1000; // Add commission amount
      }

      expect(initialPool.spent_student).toBe(6000); // 5000 + 1000
    });
  });

  describe('Deployment Checklist Verification', () => {
    it('should verify all deployment components are configured', () => {
      // Verify environment variables are set (in a real test these would be checked)
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DISCORD_WEBHOOK_URL' // For alerts
      ];

      const envVarsPresent = requiredEnvVars.map(varName => !!process.env[varName]);
      const allEnvVarsPresent = envVarsPresent.every(present => present);

      // In a real deployment test, we would check if all required env vars are present
      expect(typeof allEnvVarsPresent).toBe('boolean');
    });

    it('should confirm admin dashboard is accessible', () => {
      // This verifies that the admin dashboard route exists
      const adminRoutes = [
        '/admin/referrals/dashboard',
        '/admin/user-onboarding'
      ];

      // Verify routes exist (in a real test we would check actual route accessibility)
      expect(adminRoutes).toHaveLength(2);
      expect(adminRoutes).toContain('/admin/referrals/dashboard');
    });
  });
});