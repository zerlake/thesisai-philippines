-- Add preferred_expertise Column
-- Created: 2025-12-29
-- Purpose: Add missing column to advisor_requests

ALTER TABLE advisor_requests
ADD COLUMN IF NOT EXISTS preferred_expertise TEXT;
