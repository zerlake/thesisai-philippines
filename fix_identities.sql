-- Add missing identity records for critic and advisor users

-- Create identity for critic
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  jsonb_build_object(
    'sub', '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
    'email', 'demo-critic@thesis.ai',
    'email_verified', true
  ),
  'email',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  NOW(),
  NOW(),
  NOW()
);

-- Create identity for advisor
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  jsonb_build_object(
    'sub', 'ff79d401-5614-4de8-9f17-bc920f360dcf',
    'email', 'demo-advisor@thesis.ai',
    'email_verified', true
  ),
  'email',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  NOW(),
  NOW(),
  NOW()
);

-- Verify identities were created
SELECT u.id, u.email, i.provider, i.provider_id
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email LIKE 'demo-%@thesis.ai';
