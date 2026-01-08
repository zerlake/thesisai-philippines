-- Add new columns to testimonials table if they don't exist
-- We use a DO block to check for existence before adding to avoid errors
DO $$
BEGIN
    -- Check for full_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'full_name') THEN
        ALTER TABLE testimonials ADD COLUMN full_name TEXT;
    END IF;

    -- Check for course column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'course') THEN
        ALTER TABLE testimonials ADD COLUMN course TEXT;
    END IF;

    -- Check for institution column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'institution') THEN
        ALTER TABLE testimonials ADD COLUMN institution TEXT;
    END IF;
END $$;
