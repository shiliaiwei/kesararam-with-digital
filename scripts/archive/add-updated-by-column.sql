-- Add updated_by column to topics table if it doesn't exist
-- This tracks which staff member last updated the topic

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE topics 
        ADD COLUMN updated_by INTEGER REFERENCES users(id);
        
        -- Set initial updated_by to created_by for existing records
        UPDATE topics 
        SET updated_by = created_by 
        WHERE updated_by IS NULL;
        
        RAISE NOTICE 'Column updated_by added to topics table';
    ELSE
        RAISE NOTICE 'Column updated_by already exists in topics table';
    END IF;
END $$;
