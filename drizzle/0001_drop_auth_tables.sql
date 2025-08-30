-- Drop unused NextAuth tables after switching to JWT sessions
-- Safe to run multiple times due to IF EXISTS
-- Wrap in a transaction for atomicity

BEGIN;

-- Accounts table (used for OAuth/social logins)
DROP TABLE IF EXISTS "account";

-- Sessions table (used for database session strategy)
DROP TABLE IF EXISTS "session";

-- Verification tokens table (used for email verification / magic links)
DROP TABLE IF EXISTS "verificationToken";

COMMIT;

