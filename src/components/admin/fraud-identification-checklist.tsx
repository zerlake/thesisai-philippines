"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { getFraudUsersMock, getMockDataEnabled } from "@/lib/mock-referral-data";
import {
  ShieldAlert,
  User,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  Users,
  Shield,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface FraudProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalRiskScore: number;
  riskLevel: string;
  totalReferrals: number;
  totalEarnings: number;
  detectedFrauds: string[];
  lastActivity: string;
}

interface FraudChecklistItem {
  id: string;
  name: string;
  description: string;
  detected: boolean;
  evidence: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt?: string;
  details?: string;
}

interface FraudUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  risk_score: number;
  risk_level: string;
  total_referrals: number;
  detected_at: string;
}

interface FraudChecklistProps {
  userId?: string; // Optional - if provided, will load specific user's fraud checklist
}

export function FraudIdentificationChecklist({ userId }: FraudChecklistProps) {
  const { supabase } = useAuth();
  const [fraudProfile, setFraudProfile] = useState<FraudProfile | null>(null);
  const [checklistItems, setChecklistItems] = useState<FraudChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(userId || null);
  const [fraudUsers, setFraudUsers] = useState<FraudUser[]>([]);

  // Load fraud checklist data
  useEffect(() => {
    const loadFraudData = async () => {
      setIsLoading(true);
      try {
        // Load all flagged fraud users for the dropdown
        let fraudUsersData = null;
        let fraudUsersError = null;

        if (getMockDataEnabled()) {
          // Use mock data when enabled
          const mockFraudUsers = getFraudUsersMock().map(item => ({
            id: item.user_id,
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            risk_score: item.risk_score,
            risk_level: item.risk_level,
            total_referrals: item.total_referrals,
            detected_at: item.created_at
          }));

          setFraudUsers(mockFraudUsers);

          // If no specific user was provided and we have fraud users, select the first one
          if (!userId && !selectedUser && mockFraudUsers.length > 0) {
            setSelectedUser(mockFraudUsers[0].id);
          }
        } else {
          // Only run the query if mock data is not enabled
          const result = await supabase
            .from('referral_risk_assessment')
            .select(`
              user_id,
              risk_score,
              risk_level,
              created_at,
              profiles!inner (
                first_name,
                last_name,
                email,
                total_referrals
              )
            `)
            .gt('risk_score', 50) // Only high risk users
            .order('risk_score', { ascending: false })
            .limit(50); // Limit to top 50 high-risk users

          fraudUsersData = result.data;
          fraudUsersError = result.error;

          if (fraudUsersError) {
            // Check if the error is related to table not existing
            const errorMessage = fraudUsersError?.message || String(fraudUsersError);
            if (errorMessage.includes('referral_risk_assessment') && (errorMessage.includes('not exist') || errorMessage.includes('schema cache'))) {
              // For schema cache errors, just log minimally
              console.debug("Using mock data - referral_risk_assessment table not found in schema cache");
            } else {
              // Only log the error if it's not a "table doesn't exist" error
              console.error("Error fetching fraud users:", errorMessage);
            }

            // Use mock data when real data fails
            const mockFraudUsers = getFraudUsersMock().map(item => ({
              id: item.user_id,
              first_name: item.first_name,
              last_name: item.last_name,
              email: item.email,
              risk_score: item.risk_score,
              risk_level: item.risk_level,
              total_referrals: item.total_referrals,
              detected_at: item.created_at
            }));

            setFraudUsers(mockFraudUsers);

            // If no specific user was provided and we have fraud users, select the first one
            if (!userId && !selectedUser && mockFraudUsers.length > 0) {
              setSelectedUser(mockFraudUsers[0].id);
            }
          } else {
            // Transform the data to match our FraudUser interface
            const transformedFraudUsers = (fraudUsersData || []).map(item => ({
              id: item.user_id,
              first_name: item.profiles?.first_name || '',
              last_name: item.profiles?.last_name || '',
              email: item.profiles?.email || '',
              risk_score: item.risk_score || 0,
              risk_level: item.risk_level || 'low',
              total_referrals: item.profiles?.total_referrals || 0,
              detected_at: item.created_at
            }));

            setFraudUsers(transformedFraudUsers);

            // If no specific user was provided and we have fraud users, select the first one
            if (!userId && !selectedUser && transformedFraudUsers.length > 0) {
              setSelectedUser(transformedFraudUsers[0].id);
            }
          }
        }

        // If a specific user is selected, load their fraud profile
        if (selectedUser) {
          // Load specific user's profile
          let profileData = null;
          let profileError = null;

          if (getMockDataEnabled()) {
            // Use mock data for profile based on selected user
            const mockProfiles = {
              'fraud-user-001': {
                id: 'fraud-user-001',
                first_name: 'James',
                last_name: 'Smith',
                email: 'james.smith@example.com',
                total_referrals: 12,
                total_earnings: 1800
              },
              'fraud-user-002': {
                id: 'fraud-user-002',
                first_name: 'Emily',
                last_name: 'Johnson',
                email: 'emily.j@example.com',
                total_referrals: 25,
                total_earnings: 3750
              },
              'fraud-user-003': {
                id: 'fraud-user-003',
                first_name: 'Michael',
                last_name: 'Brown',
                email: 'michael.b@example.com',
                total_referrals: 8,
                total_earnings: 1200
              },
              'fraud-user-004': {
                id: 'fraud-user-004',
                first_name: 'Sarah',
                last_name: 'Davis',
                email: 'sarah.d@example.com',
                total_referrals: 5,
                total_earnings: 750
              },
              'fraud-user-005': {
                id: 'fraud-user-005',
                first_name: 'Robert',
                last_name: 'Wilson',
                email: 'robert.w@example.com',
                total_referrals: 30,
                total_earnings: 4500
              }
            };

            profileData = mockProfiles[selectedUser] || {
              id: selectedUser,
              first_name: 'Test',
              last_name: 'User',
              email: 'test@example.com',
              total_referrals: 0,
              total_earnings: 0
            };
          } else {
            const profileResult = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email, total_referrals, total_earnings')
              .eq('id', selectedUser)
              .single();

            profileData = profileResult.data;
            profileError = profileResult.error;
          }

          if (profileError) {
            console.error("Error fetching profile data:", profileError?.message || profileError);
            throw profileError;
          }

          // Load risk assessments for this user
          let riskData = [];
          let riskError = null;

          if (getMockDataEnabled()) {
            // Use mock data for risk assessments
            const mockRiskAssessments = [
              {
                id: 'mock-risk-1',
                risk_score: 85,
                risk_level: 'high',
                flags: ['self_referral', 'duplicate_ip'],
                status: 'reviewing',
                created_at: '2025-12-25T10:30:00Z',
                ip_address: '192.168.1.100',
                device_fingerprint: 'device-fp-123',
                detection_method: 'automated',
                confidence_score: 0.92,
                related_risks: ['risk-2', 'risk-3'],
                auto_action_taken: 'hold_payout',
                auto_action_at: '2025-12-25T10:35:00Z',
                referral_event_id: 'ref-001'
              },
              {
                id: 'mock-risk-2',
                risk_score: 78,
                risk_level: 'high',
                flags: ['suspicious_volume', 'same_device'],
                status: 'detected',
                created_at: '2025-12-26T14:45:00Z',
                ip_address: '192.168.1.101',
                device_fingerprint: 'device-fp-124',
                detection_method: 'automated',
                confidence_score: 0.85,
                related_risks: ['risk-1'],
                auto_action_taken: 'flag_for_review',
                auto_action_at: null,
                referral_event_id: 'ref-002'
              },
              {
                id: 'mock-risk-3',
                risk_score: 70,
                risk_level: 'medium',
                flags: ['unusual_pattern', 'multiple_attempts'],
                status: 'detected',
                created_at: '2025-12-27T09:15:00Z',
                ip_address: '192.168.1.102',
                device_fingerprint: 'device-fp-125',
                detection_method: 'automated',
                confidence_score: 0.75,
                related_risks: [],
                auto_action_taken: null,
                auto_action_at: null,
                referral_event_id: 'ref-003'
              }
            ];
            riskData = mockRiskAssessments.filter(item => item.referral_event_id);
          } else {
            const riskResult = await supabase
              .from('referral_risk_assessment')
              .select(`
                id,
                risk_score,
                risk_level,
                flags,
                status,
                created_at,
                ip_address,
                device_fingerprint,
                detection_method,
                confidence_score,
                related_risks,
                auto_action_taken,
                auto_action_at,
                referral_event_id
              `)
              .eq('user_id', selectedUser)
              .order('created_at', { ascending: false });

            riskData = riskResult.data || [];
            riskError = riskResult.error;
          }

          if (riskError) {
            console.error("Error fetching risk assessment data:", riskError?.message || riskError);
            throw riskError;
          }

          // Get referral event details for the risk assessments
          const referralEventIds = riskData.map(item => item.referral_event_id);
          let referralEvents = [];

          if (referralEventIds.length > 0) {
            if (getMockDataEnabled()) {
              // Use mock data for referral events
              const mockEvents = [
                {
                  id: 'ref-001',
                  event_type: 'student_subscription',
                  commission_amount: 150,
                  created_at: '2025-12-25T10:00:00Z'
                },
                {
                  id: 'ref-002',
                  event_type: 'advisor_recruitment',
                  commission_amount: 200,
                  created_at: '2025-12-26T14:00:00Z'
                },
                {
                  id: 'ref-003',
                  event_type: 'student_subscription',
                  commission_amount: 150,
                  created_at: '2025-12-27T09:00:00Z'
                }
              ];
              referralEvents = mockEvents.filter(event => referralEventIds.includes(event.id));
            } else {
              const eventsResult = await supabase
                .from('referral_events')
                .select('id, event_type, commission_amount, created_at')
                .in('id', referralEventIds);

              const { data: eventsData, error: eventsError } = eventsResult;

              if (eventsError) {
                console.error("Error fetching referral events:", eventsError?.message || eventsError);
                throw eventsError;
              } else {
                referralEvents = eventsData || [];
              }
            }
          }

          // Calculate profile
          const totalRiskScore = riskData.reduce((sum, item) => sum + (item.risk_score || 0), 0);
          const highestRiskLevel = riskData.length > 0 
            ? riskData.reduce((max, item) => 
                (item.risk_score || 0) > (max.risk_score || 0) ? item : max
              ).risk_level || 'low'
            : 'low';

          const fraudProfileData: FraudProfile = {
            userId: profileData.id,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || '',
            totalRiskScore,
            riskLevel: highestRiskLevel,
            totalReferrals: profileData.total_referrals || 0,
            totalEarnings: profileData.total_earnings || 0,
            detectedFrauds: riskData.flatMap(item => item.flags || []),
            lastActivity: riskData.length > 0 
              ? riskData[0].created_at 
              : profileData.created_at
          };

          setFraudProfile(fraudProfileData);

          // Generate checklist items based on detected frauds
          const checklistItemsData: FraudChecklistItem[] = [
            {
              id: 'self_referral',
              name: 'Self Referral',
              description: 'User referring themselves to earn commissions',
              detected: riskData.some(item => item.flags?.includes('self_referral')),
              evidence: riskData
                .filter(item => item.flags?.includes('self_referral'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - ${event?.event_type || 'Unknown'}`;
                }),
              severity: 'critical',
              detectedAt: riskData.find(item => item.flags?.includes('self_referral'))?.created_at,
              details: 'User created referral for their own account'
            },
            {
              id: 'duplicate_ip',
              name: 'Duplicate IP Addresses',
              description: 'Multiple referrals from the same IP address',
              detected: riskData.some(item => item.flags?.includes('duplicate_ip')),
              evidence: riskData
                .filter(item => item.flags?.includes('duplicate_ip'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - IP: ${item.ip_address}`;
                }),
              severity: 'high',
              detectedAt: riskData.find(item => item.flags?.includes('duplicate_ip'))?.created_at,
              details: 'Multiple accounts created from same IP address'
            },
            {
              id: 'suspicious_volume',
              name: 'Suspicious Volume',
              description: 'Unusually high number of referrals in short time',
              detected: riskData.some(item => item.flags?.includes('suspicious_volume')),
              evidence: riskData
                .filter(item => item.flags?.includes('suspicious_volume'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - ${event?.event_type || 'Unknown'}`;
                }),
              severity: 'high',
              detectedAt: riskData.find(item => item.flags?.includes('suspicious_volume'))?.created_at,
              details: 'More than 5 referrals per day detected'
            },
            {
              id: 'low_quality_user',
              name: 'Low Quality User',
              description: 'Referring users with poor quality profiles',
              detected: riskData.some(item => item.flags?.includes('low_quality_user')),
              evidence: riskData
                .filter(item => item.flags?.includes('low_quality_user'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Quality score: ${item.confidence_score}`;
                }),
              severity: 'medium',
              detectedAt: riskData.find(item => item.flags?.includes('low_quality_user'))?.created_at,
              details: 'Referrals from low-quality accounts'
            },
            {
              id: 'same_device',
              name: 'Same Device Usage',
              description: 'Multiple accounts accessed from same device',
              detected: riskData.some(item => item.flags?.includes('same_device')),
              evidence: riskData
                .filter(item => item.flags?.includes('same_device'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Device: ${item.device_fingerprint}`;
                }),
              severity: 'high',
              detectedAt: riskData.find(item => item.flags?.includes('same_device'))?.created_at,
              details: 'Multiple accounts from same device fingerprint'
            },
            {
              id: 'short_timeframe',
              name: 'Short Timeframe',
              description: 'Referral made shortly after account creation',
              detected: riskData.some(item => item.flags?.includes('short_timeframe')),
              evidence: riskData
                .filter(item => item.flags?.includes('short_timeframe'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - ${event?.created_at || item.created_at}`;
                }),
              severity: 'medium',
              detectedAt: riskData.find(item => item.flags?.includes('short_timeframe'))?.created_at,
              details: 'Referral made within 1 hour of account creation'
            },
            {
              id: 'unusual_pattern',
              name: 'Unusual Patterns',
              description: 'Abnormal referral behavior patterns',
              detected: riskData.some(item => item.flags?.includes('unusual_pattern')),
              evidence: riskData
                .filter(item => item.flags?.includes('unusual_pattern'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Pattern: ${item.detection_method}`;
                }),
              severity: 'medium',
              detectedAt: riskData.find(item => item.flags?.includes('unusual_pattern'))?.created_at,
              details: 'Detected unusual behavioral patterns'
            },
            {
              id: 'payment_fraud',
              name: 'Payment Fraud',
              description: 'Suspicious payment-related activities',
              detected: riskData.some(item => item.flags?.includes('payment_fraud')),
              evidence: riskData
                .filter(item => item.flags?.includes('payment_fraud'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Amount: ₱${event?.commission_amount || '0.00'}`;
                }),
              severity: 'critical',
              detectedAt: riskData.find(item => item.flags?.includes('payment_fraud'))?.created_at,
              details: 'Payment-related fraud detected'
            },
            {
              id: 'account_age',
              name: 'New Account Fraud',
              description: 'Referrals from very new accounts',
              detected: riskData.some(item => item.flags?.includes('account_age')),
              evidence: riskData
                .filter(item => item.flags?.includes('account_age'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Account age: <7 days`;
                }),
              severity: 'medium',
              detectedAt: riskData.find(item => item.flags?.includes('account_age'))?.created_at,
              details: 'Referrals from accounts less than 7 days old'
            },
            {
              id: 'multiple_attempts',
              name: 'Multiple Attempts',
              description: 'Repeated referral attempts',
              detected: riskData.some(item => item.flags?.includes('multiple_attempts')),
              evidence: riskData
                .filter(item => item.flags?.includes('multiple_attempts'))
                .map(item => {
                  const event = referralEvents.find(e => e.id === item.referral_event_id);
                  return `Referral ${item.referral_event_id} - Attempt #${item.related_risks?.length || 1}`;
                }),
              severity: 'low',
              detectedAt: riskData.find(item => item.flags?.includes('multiple_attempts'))?.created_at,
              details: 'Multiple referral attempts detected'
            }
          ];

          setChecklistItems(checklistItemsData);
        }
      } catch (error: any) {
        console.error("Error loading fraud data:", error?.message || error);
        toast.error(`Failed to load fraud identification data: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadFraudData();
  }, [supabase, selectedUser, userId]);

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Get risk level badge
  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive" className="text-white">CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-red-500 text-white">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="outline">LOW</Badge>;
      default:
        return <Badge variant="outline">{level.toUpperCase()}</Badge>;
    }
  };

  // Filter checklist items based on search
  const filteredItems = checklistItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Fraud Identification Checklist
          </CardTitle>
          <CardDescription>Loading fraud identification data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded animate-pulse">
                <div className="h-5 w-5 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Fraud Identification Checklist
            </CardTitle>
            <CardDescription>
              Comprehensive fraud detection checklist for user accounts
            </CardDescription>
          </div>
          
          {/* User Selection Dropdown */}
          <div className="w-full sm:w-64">
            <label className="text-sm font-medium mb-1 block">Select User to Review</label>
            <Select value={selectedUser || undefined} onValueChange={(value) => setSelectedUser(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to review" />
                <ChevronDown className="w-4 h-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                {fraudUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {user.first_name?.charAt(0)}
                          {user.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="ml-auto text-xs">
                        Risk: {user.risk_score} ({user.risk_level})
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* User Profile Info */}
        {fraudProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-muted rounded">
              <div className="text-sm text-muted-foreground">User</div>
              <div className="font-medium">{fraudProfile.firstName} {fraudProfile.lastName}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-sm text-muted-foreground">Risk Level</div>
              <div>{getRiskLevelBadge(fraudProfile.riskLevel)}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-sm text-muted-foreground">Total Score</div>
              <div className="font-medium">{fraudProfile.totalRiskScore}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-sm text-muted-foreground">Referrals</div>
              <div className="font-medium">{fraudProfile.totalReferrals}</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fraud types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No fraud indicators detected for this user.</p>
              <p className="text-sm">All fraud checks passed successfully.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-lg ${
                  item.detected 
                    ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' 
                    : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.detected}
                    disabled
                    className={`mt-0.5 ${
                      item.detected 
                        ? 'border-red-500 bg-red-500 data-[state=checked]:bg-red-500' 
                        : 'border-green-500 bg-green-500 data-[state=checked]:bg-green-500'
                    }`}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        {item.detected && (
                          <Badge variant="destructive" className="bg-red-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            DETECTED
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    
                    {item.details && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Details:</span> {item.details}
                      </p>
                    )}
                    
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Evidence:</div>
                        <div className="space-y-1">
                          {item.evidence.slice(0, 3).map((evidence, idx) => (
                            <div key={idx} className="text-xs bg-muted p-2 rounded">
                              {evidence}
                            </div>
                          ))}
                          {item.evidence.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{item.evidence.length - 3} more evidence items...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.detectedAt && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Detected: {new Date(item.detectedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {checklistItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {checklistItems.filter(item => item.detected).length}
                </div>
                <div className="text-sm text-red-600">Frauds Detected</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {checklistItems.filter(item => !item.detected).length}
                </div>
                <div className="text-sm text-green-600">Clean Checks</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {checklistItems.filter(item => item.severity === 'high' || item.severity === 'critical').filter(item => item.detected).length}
                </div>
                <div className="text-sm text-yellow-600">High Risk</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {checklistItems.length}
                </div>
                <div className="text-sm text-blue-600">Total Checks</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}