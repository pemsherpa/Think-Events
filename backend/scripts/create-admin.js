import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.js';

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('K@shchit2004', 10);

    // Create admin user
    const result = await query(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        phone, is_organizer, is_admin, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, username, email
    `, [
      'admin',
      'admin@thinkevents.com',
      hashedPassword,
      'Admin',
      'User',
      '+977-9800000000',
      true, // is_organizer
      true, // is_admin
    ]);

    console.log('Admin user created successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run the script
createAdminUser().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
