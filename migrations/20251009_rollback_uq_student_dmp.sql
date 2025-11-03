-- Rollback Migration: Remove composite unique index uq_student_dmp and restore single-column uniqueness on student_id (if desired)
-- Date: 2025-10-09
-- WARNING: Rolling back may fail if existing data violates the single-column uniqueness constraint.
-- Review data before applying.

-- 1) Drop the composite unique index if it exists
DROP INDEX IF EXISTS public.uq_student_dmp;

-- 2) (Optional) Recreate single-column unique constraint on student_id
--    Only enable if you are certain no student has multiple DMPs.
--    If you want to re-enable, uncomment the following block.

-- ALTER TABLE IF EXISTS public.data_management_plans
--   ADD CONSTRAINT data_management_plans_student_id_key UNIQUE (student_id);

-- Note: If you prefer to keep no single-column uniqueness, leave the above commented out.
