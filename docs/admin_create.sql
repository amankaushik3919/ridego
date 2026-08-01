-- =====================================================================
-- RideGo Admin User Create Query
-- Supabase SQL Editor me ye query chalao (pehli baar ek admin banata hai)
--
-- NOTE: "Admin" table tabhi exist karegi jab backend ka migration run ho
--       chuka ho (prisma migrate deploy). Otherwise pehle migration chalayen.
-- =====================================================================

INSERT INTO "Admin" ("id", "username", "passwordHash", "createdAt")
VALUES (
  gen_random_uuid(),               -- unique id
  'admin',                         -- login username
  '$2b$10$wrRioauFPSYOiFAlsoXGQuqu3kXxp0BpOWQqwg4u/MfgZeUoWeGx2',  -- bcrypt hash of 'Admin@123' (10 rounds)
  NOW()
)
ON CONFLICT ("username") DO NOTHING;

-- =====================================================================
-- Ager password change karna ho to pehle node se hash banao:
--   node -e "console.log(require('bcryptjs').hashSync('NayaPassword', 10))"
-- phir is query se update karo:
-- =====================================================================
-- UPDATE "Admin" SET "passwordHash" = '<hash>' WHERE "username" = 'admin';

-- =====================================================================
-- Verify (yahan admin count check karo):
-- =====================================================================
-- SELECT "id", "username", "createdAt" FROM "Admin";
