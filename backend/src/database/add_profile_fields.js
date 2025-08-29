import { query } from '../config/database.js';

const addProfileFields = async () => {
  try {
    console.log('Adding profile fields to users table...');

    // Add new profile fields to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'
    `);

    console.log('✓ Profile fields added to users table');

    // Create indexes for new fields
    await query('CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_state ON users(state)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender)');

    console.log('✓ Indexes created for profile fields');
    console.log('Profile fields migration completed successfully!');

  } catch (error) {
    console.error('Profile fields migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addProfileFields();
}

export default addProfileFields;
