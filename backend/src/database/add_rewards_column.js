import { query } from '../config/database.js';

const migrate = async () => {
  try {
    console.log('Adding reward_points column to users table...');
    
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;
    `);
    
    console.log('Successfully added reward_points column');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
