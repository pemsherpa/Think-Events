import chokidar from 'chokidar';
import XLSX from 'xlsx';
import { query } from '../src/config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExcelSyncService {
  constructor(excelFilePath) {
    this.excelFilePath = excelFilePath;
    this.isWatching = false;
    this.lastModified = null;
    this.syncInProgress = false;
  }

  // Function to clear existing events
  async clearExistingEvents() {
    try {
      console.log('🗑️  Clearing existing events...');
      
      // Delete from bookings first (foreign key constraint)
      await query('DELETE FROM bookings');
      console.log('✓ Bookings cleared');
      
      // Delete from created_events
      await query('DELETE FROM created_events');
      console.log('✓ Created events cleared');
      
      // Delete from events
      await query('DELETE FROM events');
      console.log('✓ Events cleared');
      
      console.log('✅ All existing events cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing existing events:', error);
      throw error;
    }
  }

  // Function to import events from Excel
  async importEventsFromExcel() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;
    
    try {
      console.log('📊 Reading Excel file:', this.excelFilePath);
      
      // Read the Excel file
      const workbook = XLSX.readFile(this.excelFilePath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`📋 Found ${jsonData.length} rows in Excel file`);
      
      // Clear existing events first
      await this.clearExistingEvents();
      
      // Get or create categories
      const categories = {};
      const venues = {};
      
      // Process each row
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        try {
          // Extract data (adjust column names based on your Excel structure)
          const title = row['Event Title'] || row['Title'] || row['title'] || `Event ${i + 1}`;
          const description = row['Description'] || row['description'] || 'Event description';
          const categoryName = row['Category'] || row['category'] || 'General';
          const venueName = row['Venue'] || row['venue'] || 'TBD';
          const venueCity = row['City'] || row['city'] || 'Kathmandu';
          const venueAddress = row['Address'] || row['address'] || '';
          const startDate = row['Start Date'] || row['start_date'] || row['StartDate'];
          const endDate = row['End Date'] || row['end_date'] || row['EndDate'] || startDate;
          const startTime = row['Start Time'] || row['start_time'] || row['StartTime'] || '18:00';
          const endTime = row['End Time'] || row['end_time'] || row['EndTime'] || '22:00';
          const price = parseFloat(row['Price'] || row['price'] || '0') || 0;
          const currency = row['Currency'] || row['currency'] || 'NPR';
          const totalSeats = parseInt(row['Total Seats'] || row['total_seats'] || row['TotalSeats'] || '100') || 100;
          const imageUrl = row['Image URL'] || row['image_url'] || row['ImageUrl'] || null;
          const organizerName = row['Organizer'] || row['organizer'] || 'Event Organizer';
          const tags = row['Tags'] || row['tags'] || null;
          
          // Handle date formatting
          let formattedStartDate, formattedEndDate;
          if (startDate) {
            const date = new Date(startDate);
            if (isNaN(date.getTime())) {
              // Try different date formats
              formattedStartDate = new Date().toISOString().split('T')[0];
            } else {
              formattedStartDate = date.toISOString().split('T')[0];
            }
          } else {
            formattedStartDate = new Date().toISOString().split('T')[0];
          }
          
          formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : formattedStartDate;
          
          // Get or create category
          let categoryId;
          if (categories[categoryName]) {
            categoryId = categories[categoryName];
          } else {
            const categoryResult = await query(
              'SELECT id FROM categories WHERE name = $1',
              [categoryName]
            );
            
            if (categoryResult.rows.length > 0) {
              categoryId = categoryResult.rows[0].id;
              categories[categoryName] = categoryId;
            } else {
              const newCategory = await query(
                'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
                [categoryName, `${categoryName} events`]
              );
              categoryId = newCategory.rows[0].id;
              categories[categoryName] = categoryId;
            }
          }
          
          // Get or create venue
          let venueId;
          if (venues[venueName]) {
            venueId = venues[venueName];
          } else {
            const venueResult = await query(
              'SELECT id FROM venues WHERE name = $1 AND city = $2',
              [venueName, venueCity]
            );
            
            if (venueResult.rows.length > 0) {
              venueId = venueResult.rows[0].id;
              venues[venueName] = venueId;
            } else {
              const newVenue = await query(
                'INSERT INTO venues (name, address, city, country, capacity) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [venueName, venueAddress, venueCity, 'Nepal', totalSeats]
              );
              venueId = newVenue.rows[0].id;
              venues[venueName] = venueId;
            }
          }
          
          // Get or create organizer (assuming admin user with ID 1)
          const organizerResult = await query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [organizerName.toLowerCase().replace(/\s+/g, ''), `${organizerName.toLowerCase().replace(/\s+/g, '')}@example.com`]
          );
          
          let organizerId;
          if (organizerResult.rows.length > 0) {
            organizerId = organizerResult.rows[0].id;
          } else {
            // Create a default organizer user
            const newOrganizer = await query(
              'INSERT INTO users (username, email, first_name, last_name, phone, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
              [
                organizerName.toLowerCase().replace(/\s+/g, ''),
                `${organizerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                organizerName.split(' ')[0] || organizerName,
                organizerName.split(' ').slice(1).join(' ') || '',
                '9800000000',
                '$2b$10$dummy.hash.for.organizer' // Dummy hash
              ]
            );
            organizerId = newOrganizer.rows[0].id;
          }
          
          // Insert event
          const eventResult = await query(
            `INSERT INTO events (
              title, description, category_id, venue_id, organizer_id,
              start_date, end_date, start_time, end_time, price, currency,
              total_seats, available_seats, status, images, tags
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id`,
            [
              title, description, categoryId, venueId, organizerId,
              formattedStartDate, formattedEndDate, startTime, endTime, price, currency,
              totalSeats, totalSeats, 'upcoming',
              imageUrl ? [imageUrl] : null,
              tags ? tags.split(',').map(tag => tag.trim()) : null
            ]
          );
          
          const eventId = eventResult.rows[0].id;
          
          // Also insert into created_events table
          await query(
            `INSERT INTO created_events (
              event_id, organizer_id, title, description, category_id, venue_id,
              start_date, end_date, start_time, end_time, price, currency,
              total_seats, image_url, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              eventId, organizerId, title, description, categoryId, venueId,
              formattedStartDate, formattedEndDate, startTime, endTime, price, currency,
              totalSeats, imageUrl, 'created'
            ]
          );
          
          console.log(`✓ Imported: ${title} (${formattedStartDate})`);
          
        } catch (rowError) {
          console.error(`❌ Error importing row ${i + 1}:`, rowError);
          console.error('Row data:', row);
        }
      }
      
      console.log('✅ Events sync completed successfully!');
      
    } catch (error) {
      console.error('❌ Error syncing events from Excel:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Start watching the Excel file for changes
  startWatching() {
    if (this.isWatching) {
      console.log('👀 Already watching Excel file');
      return;
    }

    console.log(`👀 Starting to watch Excel file: ${this.excelFilePath}`);
    
    const watcher = chokidar.watch(this.excelFilePath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher.on('change', async (path) => {
      console.log(`📝 Excel file changed: ${path}`);
      
      try {
        // Get file stats to check if it's actually modified
        const fs = await import('fs');
        const stats = fs.statSync(path);
        const currentModified = stats.mtime.getTime();
        
        // Only sync if file was actually modified (not just accessed)
        if (this.lastModified && currentModified <= this.lastModified) {
          console.log('⏭️  File not actually modified, skipping sync');
          return;
        }
        
        this.lastModified = currentModified;
        
        console.log('🔄 Starting automatic sync...');
        await this.importEventsFromExcel();
        console.log('✅ Automatic sync completed!');
        
      } catch (error) {
        console.error('❌ Error during automatic sync:', error);
      }
    });

    watcher.on('error', (error) => {
      console.error('❌ File watcher error:', error);
    });

    this.isWatching = true;
    console.log('✅ Excel file watcher started successfully!');
    
    // Initial sync
    console.log('🔄 Performing initial sync...');
    this.importEventsFromExcel().then(() => {
      console.log('✅ Initial sync completed!');
    }).catch((error) => {
      console.error('❌ Initial sync failed:', error);
    });
  }

  // Stop watching the Excel file
  stopWatching() {
    if (!this.isWatching) {
      console.log('👀 Not currently watching Excel file');
      return;
    }

    console.log('🛑 Stopping Excel file watcher...');
    this.isWatching = false;
    console.log('✅ Excel file watcher stopped');
  }
}

// Export the service
export default ExcelSyncService;

// If running directly, start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const excelFilePath = process.argv[2];
  
  if (!excelFilePath) {
    console.log('Usage: node excel-sync-service.js <path-to-excel-file>');
    console.log('Example: node excel-sync-service.js "C:\\Users\\ALEX\\thinkevebn\\Think-Events\\event list .xlsx"');
    process.exit(1);
  }
  
  const syncService = new ExcelSyncService(excelFilePath);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    syncService.stopWatching();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    syncService.stopWatching();
    process.exit(0);
  });
  
  // Start the service
  syncService.startWatching();
}
