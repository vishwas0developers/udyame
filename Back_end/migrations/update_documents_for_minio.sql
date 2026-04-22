-- SQL Migration: Update Documents Table for MinIO Metadata Sync
-- Description: Adds columns to track object storage locations and link metadata with MinIO buckets.

-- 1. Add MinIO-specific columns
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS minio_path VARCHAR(512),
ADD COLUMN IF NOT EXISTS bucket_name VARCHAR(64) DEFAULT 'udyme-documents',
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(128),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS presigned_expiry TIMESTAMP WITH TIME ZONE;

-- 2. Create Index on minio_path for fast lookups
CREATE INDEX IF NOT EXISTS idx_documents_minio_path ON documents(minio_path);

-- 3. Add constraint to ensure bucket name is valid
ALTER TABLE documents 
ADD CONSTRAINT check_bucket_name 
CHECK (bucket_name IN ('udyme-documents', 'udyme-templates', 'udyme-audit-logs'));

COMMENT ON COLUMN documents.minio_path IS 'S3 Key/Path within the bucket';
COMMENT ON COLUMN documents.presigned_expiry IS 'Timestamp when the last generated presigned URL expires';
