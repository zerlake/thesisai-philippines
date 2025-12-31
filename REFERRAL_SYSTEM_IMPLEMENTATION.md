# ThesisAI Referral and Recruitment System

This document outlines the implementation of the ThesisAI referral and recruitment system with a 15% recruitment pool allocation.

## Overview

The ThesisAI referral system implements a 15% recruitment pool based on subscription revenue with the following allocation:
- **Year 1 Revenue**: ₱660,000
- **Recruitment Pool**: 15% (₱99,000/year, ₱8,250/month average)
- **Pool Split**:
  - 35% → Student referral bonuses (₱34,650)
  - 35% → Advisor recruitment incentives (₱34,650)
  - 30% → Critic recruitment incentives (₱29,700)

## Database Schema

The referral system extends the existing `profiles` table and adds the following new tables:

### Extended Profiles Table
- `referral_code`: Unique referral code for each user
- `referred_by`: Reference to the user who referred this user
- `role_type`: User role (student, advisor, critic, admin)
- `recruitment_tier`: Tier level based on referrals made
- `total_referrals`: Total number of successful referrals
- `total_earnings`: Total earnings from referrals
- `pending_payouts`: Amount of pending payouts

### Referral Events Table
- Tracks all referral activities (student subscriptions, advisor/critic recruitments)
- Includes status tracking (pending, approved, rejected, paid)
- Commission amounts and pool allocation tracking

### Recruitment Pool Table
- Tracks the recruitment pool allocation over time
- Monthly/yearly periods with revenue and allocation tracking
- Spent amounts tracking for each category

### Payouts Table
- Manages payout records for users
- Tracks payout status and methods
- Links to recruitment pool for accounting

### Referral Audits Table
- Tracks potential abuse and suspicious activities
- Quality scoring for referrals

## API Endpoints

### GET /api/referrals/code
- Returns the authenticated user's referral code

### GET /api/referrals/history
- Returns the authenticated user's referral history

### POST /api/referrals/validate
- Validates a referral code and returns referrer information

### GET /api/referrals/payouts
- Returns the authenticated user's payout history

### GET/PUT /api/admin/referrals
- Admin endpoint for managing referrals and viewing dashboard data

## Server Actions

### `getReferralCode()`
- Fetches the current user's referral code

### `getReferralHistory()`
- Fetches the current user's referral history

### `validateReferralCode(code)`
- Validates a referral code and returns referrer details

### `getUserPayouts()`
- Fetches the current user's payout history

### `processReferral(referrerId, referredId, eventType)`
- Processes a new referral event

### `updateReferralStatus(referralId, status)`
- Updates the status of a referral (admin only)

## TypeScript Types

The system includes comprehensive TypeScript types in `src/types/referral.ts`:
- `ReferralEvent`
- `ReferralHistoryItem`
- `Payout`
- `RecruitmentPool`
- `RecruitmentDashboardData`
- `ReferralCodeValidation`
- `ReferralStats`
- `ReferrerProfile`

## Utility Functions

The system includes utility functions in `src/utils/referral.ts`:
- `calculateReferralCommission()`: Calculates commission based on event type and tier
- `formatCurrency()`: Formats currency for Philippines (PHP)
- `isValidReferralCode()`: Validates referral code format
- `getReferralStatusText()`: Gets display text for referral status
- `getReferralStatusColor()`: Gets UI color for referral status
- `calculateReferralTier()`: Calculates user's referral tier
- `getTierName()`: Gets tier name for display
- `hasReachedDailyLimit()`: Checks if user has reached daily referral limit
- `calculatePotentialEarnings()`: Calculates potential earnings
- `generateReferralUrl()`: Generates referral sharing URL
- `canMakeReferral()`: Validates if user can make referrals
- `getReferralEventTypeDisplay()`: Gets display name for event type
- `calculateReferralQualityScore()`: Calculates quality score for referrals

## Context Provider

The `ReferralProvider` in `src/contexts/referral-context.tsx` manages referral state across the application and provides the `useReferral` hook for accessing referral data.

## Referral Page

The referral page at `/referrals` provides a comprehensive interface for users to:
- View their referral code
- See referral statistics
- Track referral history
- View payout information
- Share their referral code

## Guardrails and Anti-Abuse

The system includes several anti-abuse measures:
- Self-referral prevention
- Duplicate referral detection
- Daily referral limits (5 per day)
- Monthly payout caps (₱5,000)
- Quality scoring for referrals
- Suspicious activity monitoring
- Admin review queue

## Implementation Notes

1. The system uses Supabase Row Level Security (RLS) to control access to referral data
2. Database triggers automatically update user statistics and pool allocations
3. The system includes comprehensive validation at both database and application levels
4. All monetary values are stored as DECIMAL to prevent floating point errors
5. The system includes proper error handling and user feedback

## Setup Instructions

1. Run the migration: `supabase db push` (or apply the migration manually)
2. Ensure RLS policies are enabled for all referral-related tables
3. Update environment variables with proper Supabase configuration
4. The system will automatically generate referral codes for new users
5. Admin users can manage referral approvals through the admin interface

## Testing

The system includes server actions that can be tested directly, and API endpoints that follow standard Next.js patterns. All components are built with TypeScript for type safety.