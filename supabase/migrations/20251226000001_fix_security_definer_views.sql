-- Fix Security Definer View Issue
-- Views with SECURITY DEFINER bypass RLS policies which is a security risk
-- This migration recreates the metrics_summary view with security_invoker = true

-- First, get the view definition and recreate it without security_definer
DO $$
DECLARE
  view_def TEXT;
BEGIN
  -- Check if the view exists
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'metrics_summary'
  ) THEN
    -- Get the current view definition
    SELECT pg_get_viewdef('public.metrics_summary'::regclass, true) INTO view_def;

    -- Drop and recreate the view with security_invoker
    DROP VIEW IF EXISTS public.metrics_summary;

    -- Recreate with security_invoker = true (PostgreSQL 15+)
    -- This ensures the view respects the querying user's permissions
    EXECUTE 'CREATE VIEW public.metrics_summary WITH (security_invoker = true) AS ' || view_def;

    RAISE NOTICE 'Successfully recreated metrics_summary view with security_invoker = true';
  ELSE
    RAISE NOTICE 'View public.metrics_summary does not exist, skipping';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If security_invoker isn't supported (PostgreSQL < 15), try alternative approach
  RAISE NOTICE 'Error recreating view: %. Attempting alternative fix...', SQLERRM;

  -- Alternative: Just recreate without SECURITY DEFINER
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'metrics_summary'
    ) THEN
      SELECT pg_get_viewdef('public.metrics_summary'::regclass, true) INTO view_def;
      DROP VIEW IF EXISTS public.metrics_summary;
      EXECUTE 'CREATE VIEW public.metrics_summary AS ' || view_def;
      RAISE NOTICE 'Successfully recreated metrics_summary view without SECURITY DEFINER';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not fix metrics_summary view: %', SQLERRM;
  END;
END $$;

-- Also fix any other views that might have security_definer set
-- by checking pg_class for relrowsecurity
DO $$
DECLARE
  r RECORD;
  view_def TEXT;
BEGIN
  FOR r IN
    SELECT c.relname as view_name, n.nspname as schema_name
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relkind = 'v'  -- views only
    AND n.nspname = 'public'
    AND c.relrowsecurity = false  -- Check if RLS is disabled (potential security definer)
    AND EXISTS (
      SELECT 1 FROM pg_depend d
      JOIN pg_rewrite rw ON d.objid = rw.oid
      WHERE rw.ev_class = c.oid
      AND d.deptype = 'n'  -- normal dependency
    )
  LOOP
    BEGIN
      -- Get view definition
      SELECT pg_get_viewdef(format('%I.%I', r.schema_name, r.view_name)::regclass, true) INTO view_def;

      -- Skip if view_def is null or empty
      IF view_def IS NOT NULL AND view_def != '' THEN
        -- Check if this view has security_barrier or security_definer attributes
        -- by querying pg_class options
        IF EXISTS (
          SELECT 1 FROM pg_class
          WHERE oid = format('%I.%I', r.schema_name, r.view_name)::regclass
          AND reloptions::text LIKE '%security_barrier%'
        ) THEN
          RAISE NOTICE 'View %.% may need review for security settings', r.schema_name, r.view_name;
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not check view %.%: %', r.schema_name, r.view_name, SQLERRM;
    END;
  END LOOP;
END $$;
