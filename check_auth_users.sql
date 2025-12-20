-- Check auth users and their identities
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  i.provider,
  i.provider_id
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE u.email LIKE 'demo-%@thesis.ai';
