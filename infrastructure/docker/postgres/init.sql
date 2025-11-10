-- Thai Education Platform - PostgreSQL Initialization
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE thai_edu TO thai_edu_user;

-- Create audit function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Logging
DO $$
BEGIN
    RAISE NOTICE 'Thai Education Platform database initialized successfully';
END $$;
