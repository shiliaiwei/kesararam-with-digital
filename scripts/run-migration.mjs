import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const sql = neon(DATABASE_URL);

try {
  console.log('📝 Running migration: add-updated-by-column.sql');
  
  // Execute the migration step by step
  console.log('   Checking if column exists...');
  
  const checkColumn = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'updated_by'
  `;
  
  if (checkColumn.length > 0) {
    console.log('✅ Column updated_by already exists, skipping creation');
  } else {
    console.log('   Adding updated_by column...');
    await sql`
      ALTER TABLE topics 
      ADD COLUMN updated_by INTEGER REFERENCES users(id)
    `;
    console.log('✅ Column updated_by added successfully');
    
    console.log('   Setting initial values...');
    await sql`
      UPDATE topics 
      SET updated_by = created_by 
      WHERE updated_by IS NULL
    `;
    console.log('✅ Initial values set');
  }
  
  // Verify the column was added
  const result = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'updated_by'
  `;
  
  if (result.length > 0) {
    console.log('✅ Verified: updated_by column exists');
    console.log(`   Type: ${result[0].data_type}`);
  }
  
  // Check how many topics have updated_by values
  const topicsCount = await sql`
    SELECT COUNT(*) as count FROM topics WHERE updated_by IS NOT NULL
  `;
  
  console.log(`✅ ${topicsCount[0].count} topics have updated_by values`);
  console.log('\n🎉 Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error(error);
  process.exit(1);
}
