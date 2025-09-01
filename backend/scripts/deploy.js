import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Starting deployment process...');

try {
  // Run database migrations
  console.log('📊 Running database migrations...');
  execSync('npm run migrate', { stdio: 'inherit' });
  
  // Seed database with initial data
  console.log('🌱 Seeding database...');
  execSync('npm run seed', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
