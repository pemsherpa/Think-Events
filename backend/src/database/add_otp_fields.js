import { query } from '../config/database.js';

const addOtpAndProfileFields = async () => {
  try {
    console.log('Starting OTP and profile fields migration...');

    // Add OTP fields
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE
    `);
    console.log('✓ OTP fields added');

    // Add profile fields
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS preferences JSONB
    `);
    console.log('✓ Profile fields added');

    // Add reset token fields if they don't exist
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP
    `);
    console.log('✓ Reset token fields added');

    console.log('OTP and profile fields migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addOtpAndProfileFields();
}

export default addOtpAndProfileFields;
