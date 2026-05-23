-- FinFlow PostgreSQL Initialization
-- Creates extensions needed by the application

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- For GIN indexes

-- Create schemas for multi-tenancy
CREATE SCHEMA IF NOT EXISTS finflow;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set default search path
ALTER DATABASE finflow_db SET search_path TO finflow, public;
