import { query } from '../src/config/database.js';

const addAdminColumn = async () => {
  try {
    // Check if is_admin column exists
    const columnExists = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);

    if (columnExists.rows.length === 0) {
      // Add is_admin column
      await query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('Added is_admin column to users table');
    } else {
      console.log('is_admin column already exists');
    }
  } catch (error) {
    console.error('Error adding admin column:', error);
  }
};

// Run the script
addAdminColumn().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
