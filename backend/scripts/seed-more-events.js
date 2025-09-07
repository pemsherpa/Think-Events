import { query } from '../src/config/database.js';
import bcrypt from 'bcrypt';

const seedMoreEvents = async () => {
  try {
    console.log('🌱 Starting to seed more events...');

    // First, create more organizers/artists
    const organizers = [
      {
        username: 'nepal_music_fest',
        email: 'info@nepalmusicfest.com',
        first_name: 'Nepal',
        last_name: 'Music Festival',
        phone: '+977-9801234567',
        password: 'password123',
        is_organizer: true
      },
      {
        username: 'kathmandu_events',
        email: 'events@kathmanduevents.com',
        first_name: 'Kathmandu',
        last_name: 'Events',
        phone: '+977-9801234568',
        password: 'password123',
        is_organizer: true
      },
      {
        username: 'pokhara_concerts',
        email: 'concerts@pokhara.com',
        first_name: 'Pokhara',
        last_name: 'Concerts',
        phone: '+977-9801234569',
        password: 'password123',
        is_organizer: true
      },
      {
        username: 'bhaktapur_culture',
        email: 'culture@bhaktapur.com',
        first_name: 'Bhaktapur',
        last_name: 'Cultural Center',
        phone: '+977-9801234570',
        password: 'password123',
        is_organizer: true
      },
      {
        username: 'lalitpur_arts',
        email: 'arts@lalitpur.com',
        first_name: 'Lalitpur',
        last_name: 'Arts Society',
        phone: '+977-9801234571',
        password: 'password123',
        is_organizer: true
      }
    ];

    // Create organizers
    const organizerIds = [];
    for (const org of organizers) {
      try {
        const hashedPassword = await bcrypt.hash(org.password, 10);
        const result = await query(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_organizer, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          RETURNING id
        `, [org.username, org.email, hashedPassword, org.first_name, org.last_name, org.phone, org.is_organizer]);
        
        organizerIds.push(result.rows[0].id);
        console.log(`✅ Created organizer: ${org.username} (ID: ${result.rows[0].id})`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Organizer ${org.username} already exists, skipping...`);
          // Get existing organizer ID
          const existing = await query('SELECT id FROM users WHERE username = $1', [org.username]);
          if (existing.rows.length > 0) {
            organizerIds.push(existing.rows[0].id);
          }
        } else {
          console.error(`❌ Error creating organizer ${org.username}:`, error.message);
        }
      }
    }

    // Get categories
    const categoriesResult = await query('SELECT id, name FROM categories');
    const categories = categoriesResult.rows;
    console.log('📂 Available categories:', categories.map(c => c.name));

    // Get venues
    const venuesResult = await query('SELECT id, name, city FROM venues');
    const venues = venuesResult.rows;
    console.log('🏢 Available venues:', venues.map(v => `${v.name} (${v.city})`));

    // Create more events
    const events = [
      {
        title: 'Nepal Folk Music Festival 2024',
        description: 'Experience the rich cultural heritage of Nepal through traditional folk music performances by renowned artists from across the country.',
        category_name: 'Music & Concerts',
        organizer_id: organizerIds[0],
        venue_name: 'Tundikhel Ground',
        venue_address: 'Tundikhel, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-03-15',
        end_date: '2024-03-17',
        start_time: '18:00',
        end_time: '22:00',
        price: 1500,
        currency: 'NPR',
        total_seats: 500,
        available_seats: 500,
        tags: ['folk', 'traditional', 'culture', 'music']
      },
      {
        title: 'Kathmandu Jazz Night',
        description: 'An intimate evening of smooth jazz performances in the heart of Kathmandu. Featuring local and international jazz artists.',
        category_name: 'Music & Concerts',
        organizer_id: organizerIds[1],
        venue_name: 'Jazz Up Cafe',
        venue_address: 'Thamel, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-03-20',
        end_date: '2024-03-20',
        start_time: '19:30',
        end_time: '23:00',
        price: 2500,
        currency: 'NPR',
        total_seats: 80,
        available_seats: 80,
        tags: ['jazz', 'intimate', 'cafe', 'music']
      },
      {
        title: 'Pokhara Lakeside Concert',
        description: 'A magical evening by the beautiful Phewa Lake with live music performances and stunning mountain views.',
        category_name: 'Music & Concerts',
        organizer_id: organizerIds[2],
        venue_name: 'Lakeside Amphitheater',
        venue_address: 'Lakeside, Pokhara',
        venue_city: 'Pokhara',
        start_date: '2024-03-25',
        end_date: '2024-03-25',
        start_time: '17:00',
        end_time: '21:00',
        price: 2000,
        currency: 'NPR',
        total_seats: 300,
        available_seats: 300,
        tags: ['lakeside', 'mountains', 'outdoor', 'music']
      },
      {
        title: 'Bhaktapur Cultural Heritage Tour',
        description: 'Explore the ancient city of Bhaktapur with guided tours, traditional dance performances, and local cuisine tasting.',
        category_name: 'Arts & Culture',
        organizer_id: organizerIds[3],
        venue_name: 'Bhaktapur Durbar Square',
        venue_address: 'Durbar Square, Bhaktapur',
        venue_city: 'Bhaktapur',
        start_date: '2024-03-30',
        end_date: '2024-03-30',
        start_time: '09:00',
        end_time: '17:00',
        price: 1200,
        currency: 'NPR',
        total_seats: 50,
        available_seats: 50,
        tags: ['heritage', 'culture', 'tour', 'traditional']
      },
      {
        title: 'Lalitpur Art Exhibition',
        description: 'Contemporary art exhibition featuring works by emerging and established Nepali artists. Includes interactive workshops.',
        category_name: 'Arts',
        organizer_id: organizerIds[4],
        venue_name: 'Patan Museum',
        venue_address: 'Patan Durbar Square, Lalitpur',
        venue_city: 'Lalitpur',
        start_date: '2024-04-05',
        end_date: '2024-04-10',
        start_time: '10:00',
        end_time: '18:00',
        price: 500,
        currency: 'NPR',
        total_seats: 200,
        available_seats: 200,
        tags: ['art', 'exhibition', 'contemporary', 'workshop']
      },
      {
        title: 'Himalayan Adventure Sports Expo',
        description: 'Discover the latest in adventure sports equipment and techniques. Meet expert climbers and outdoor enthusiasts.',
        category_name: 'Sports',
        organizer_id: organizerIds[1],
        venue_name: 'International Convention Centre',
        venue_address: 'New Baneshwor, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-04-12',
        end_date: '2024-04-14',
        start_time: '10:00',
        end_time: '18:00',
        price: 800,
        currency: 'NPR',
        total_seats: 1000,
        available_seats: 1000,
        tags: ['adventure', 'sports', 'himalayan', 'expo']
      },
      {
        title: 'Nepali Comedy Night',
        description: 'Laugh out loud with Nepal\'s funniest comedians. A night of clean humor and entertainment for all ages.',
        category_name: 'Comedy',
        organizer_id: organizerIds[0],
        venue_name: 'Comedy Club Kathmandu',
        venue_address: 'Durbarmarg, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-04-18',
        end_date: '2024-04-18',
        start_time: '20:00',
        end_time: '22:30',
        price: 1000,
        currency: 'NPR',
        total_seats: 120,
        available_seats: 120,
        tags: ['comedy', 'humor', 'entertainment', 'standup']
      },
      {
        title: 'Tech Innovation Summit Nepal',
        description: 'Connect with tech leaders, entrepreneurs, and innovators. Learn about the latest trends in technology and digital transformation.',
        category_name: 'Technology',
        organizer_id: organizerIds[2],
        venue_name: 'Hotel Yak & Yeti',
        venue_address: 'Durbar Marg, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-04-25',
        end_date: '2024-04-26',
        start_time: '09:00',
        end_time: '17:00',
        price: 3000,
        currency: 'NPR',
        total_seats: 500,
        available_seats: 500,
        tags: ['technology', 'innovation', 'summit', 'networking']
      },
      {
        title: 'Yoga & Wellness Retreat',
        description: 'Rejuvenate your mind and body with traditional yoga practices, meditation sessions, and wellness workshops.',
        category_name: 'Education & Workshops',
        organizer_id: organizerIds[3],
        venue_name: 'Swayambhunath Temple Grounds',
        venue_address: 'Swayambhunath, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-05-01',
        end_date: '2024-05-03',
        start_time: '06:00',
        end_time: '18:00',
        price: 5000,
        currency: 'NPR',
        total_seats: 60,
        available_seats: 60,
        tags: ['yoga', 'wellness', 'meditation', 'retreat']
      },
      {
        title: 'Nepali Food Festival',
        description: 'Taste authentic Nepali cuisine from different regions. Cooking demonstrations and food competitions included.',
        category_name: 'Food & Drink',
        organizer_id: organizerIds[4],
        venue_name: 'Garden of Dreams',
        venue_address: 'Keshar Mahal, Kathmandu',
        venue_city: 'Kathmandu',
        start_date: '2024-05-08',
        end_date: '2024-05-08',
        start_time: '11:00',
        end_time: '20:00',
        price: 800,
        currency: 'NPR',
        total_seats: 400,
        available_seats: 400,
        tags: ['food', 'nepali', 'cuisine', 'festival']
      }
    ];

    // Insert events
    for (const event of events) {
      try {
        // Find category ID
        const category = categories.find(c => c.name === event.category_name);
        if (!category) {
          console.log(`⚠️  Category ${event.category_name} not found, skipping event: ${event.title}`);
          continue;
        }

        // Create venue if it doesn't exist
        let venueId;
        const existingVenue = await query(
          'SELECT id FROM venues WHERE name = $1 AND city = $2',
          [event.venue_name, event.venue_city]
        );

        if (existingVenue.rows.length > 0) {
          venueId = existingVenue.rows[0].id;
        } else {
          const venueResult = await query(`
            INSERT INTO venues (name, address, city, country, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
          `, [event.venue_name, event.venue_address, event.venue_city, 'Nepal']);
          venueId = venueResult.rows[0].id;
          console.log(`✅ Created venue: ${event.venue_name} in ${event.venue_city}`);
        }

        // Insert event
        const eventResult = await query(`
          INSERT INTO events (
            title, description, category_id, venue_id, organizer_id,
            start_date, end_date, start_time, end_time, price, currency,
            total_seats, available_seats, images, tags, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
          RETURNING id
        `, [
          event.title,
          event.description,
          category.id,
          venueId,
          event.organizer_id,
          event.start_date,
          event.end_date,
          event.start_time,
          event.end_time,
          event.price,
          event.currency,
          event.total_seats,
          event.available_seats,
          null, // images
          event.tags
        ]);

        console.log(`✅ Created event: ${event.title} (ID: ${eventResult.rows[0].id})`);
      } catch (error) {
        console.error(`❌ Error creating event ${event.title}:`, error.message);
      }
    }

    console.log('🎉 Successfully seeded more events!');
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  } finally {
    process.exit(0);
  }
};

seedMoreEvents();
