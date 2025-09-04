import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed categories
    const categories = [
      { name: 'Concert', description: 'Live music performances', icon: 'music', color: '#8B5CF6' },
      { name: 'Sports', description: 'Athletic events and competitions', icon: 'trophy', color: '#EF4444' },
      { name: 'Technology', description: 'Tech conferences and workshops', icon: 'cpu', color: '#3B82F6' },
      { name: 'Business', description: 'Business conferences and networking', icon: 'briefcase', color: '#10B981' },
      { name: 'Arts', description: 'Art exhibitions and cultural events', icon: 'palette', color: '#F59E0B' },
      { name: 'Food', description: 'Food festivals and culinary events', icon: 'utensils', color: '#F97316' },
      { name: 'Education', description: 'Educational workshops and seminars', icon: 'graduation-cap', color: '#6366F1' },
      { name: 'Comedy', description: 'Stand-up comedy and entertainment', icon: 'smile', color: '#EC4899' }
    ];

    for (const category of categories) {
      await query(
        'INSERT INTO categories (name, description, icon, color) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
        [category.name, category.description, category.icon, category.color]
      );
    }
    console.log('✓ Categories seeded');

    // Seed venues
    const venues = [
      {
        name: 'Dashrath Stadium',
        address: 'Tripureshwor, Kathmandu',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        postal_code: '44600',
        capacity: 25000,
        description: 'The largest stadium in Nepal, perfect for large-scale events',
        amenities: ['Parking', 'Food Court', 'VIP Seating', 'Sound System'],
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
        latitude: 27.7172,
        longitude: 85.3240
      },
      {
        name: 'Yak & Yeti Hotel',
        address: 'Durbar Marg, Kathmandu',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        postal_code: '44600',
        capacity: 500,
        description: 'Luxury hotel with elegant event spaces',
        amenities: ['Catering', 'Audio/Visual', 'WiFi', 'Valet Parking'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        latitude: 27.7172,
        longitude: 85.3240
      },
      {
        name: 'Nepal Academy Hall',
        address: 'Kamaladi, Kathmandu',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        postal_code: '44600',
        capacity: 800,
        description: 'Cultural center perfect for arts and educational events',
        amenities: ['Stage', 'Lighting', 'Sound System', 'Green Room'],
        images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'],
        latitude: 27.7172,
        longitude: 85.3240
      }
    ];

    for (const venue of venues) {
      await query(
        `INSERT INTO venues (name, address, city, state, country, postal_code, capacity, description, amenities, images, latitude, longitude) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [venue.name, venue.address, venue.city, venue.state, venue.country, venue.postal_code, 
         venue.capacity, venue.description, venue.amenities, venue.images, venue.latitude, venue.longitude]
      );
    }
    console.log('✓ Venues seeded');

    // Seed users (organizers)
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = [
      {
        username: 'musicnepal',
        email: 'info@musicnepal.com',
        password_hash: hashedPassword,
        first_name: 'Music',
        last_name: 'Nepal',
        phone: '+977-1-4444444',
        is_organizer: true,
        is_verified: true
      },
      {
        username: 'techconf',
        email: 'hello@techconf.com',
        password_hash: hashedPassword,
        first_name: 'Tech',
        last_name: 'Conference',
        phone: '+977-1-5555555',
        is_organizer: true,
        is_verified: true
      },
      {
        username: 'sportsnepal',
        email: 'contact@sportsnepal.com',
        password_hash: hashedPassword,
        first_name: 'Sports',
        last_name: 'Nepal',
        phone: '+977-1-6666666',
        is_organizer: true,
        is_verified: true
      }
    ];

    for (const user of users) {
      await query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_organizer, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (username) DO NOTHING`,
        [user.username, user.email, user.password_hash, user.first_name, user.last_name, user.phone, user.is_organizer, user.is_verified]
      );
    }
    console.log('✓ Users seeded');

    // Get category and venue IDs for events
    const categoryResult = await query('SELECT id FROM categories WHERE name = $1', ['Concert']);
    const venueResult = await query('SELECT id FROM venues WHERE name = $1', ['Dashrath Stadium']);
    const organizerResult = await query('SELECT id FROM users WHERE username = $1', ['musicnepal']);

    if (categoryResult.rows.length > 0 && venueResult.rows.length > 0 && organizerResult.rows.length > 0) {
      const categoryId = categoryResult.rows[0].id;
      const venueId = venueResult.rows[0].id;
      const organizerId = organizerResult.rows[0].id;

      // Seed events
      const events = [
        {
          title: 'Sajjan Raj Vaidya Live in Concert',
          description: 'Join us for an unforgettable evening with Sajjan Raj Vaidya, one of Nepal\'s most beloved musicians. Experience the magic of live music in the heart of Kathmandu.',
          category_id: categoryId,
          venue_id: venueId,
          organizer_id: organizerId,
          start_date: '2024-12-15',
          end_date: '2024-12-15',
          start_time: '19:00:00',
          end_time: '22:00:00',
          price: 1500.00,
          currency: 'NPR',
          total_seats: 2000,
          available_seats: 1250,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800'],
          tags: ['Live Music', 'Nepali Music', 'Concert', 'Sajjan Raj Vaidya'],
          rating: 4.8,
          review_count: 324
        },
        {
          title: 'Nepal Tech Summit 2024',
          description: 'The biggest technology conference in Nepal featuring industry leaders, startups, and innovative solutions.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Technology'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Yak & Yeti Hotel'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['techconf'])).rows[0].id,
          start_date: '2024-11-20',
          end_date: '2024-11-22',
          start_time: '09:00:00',
          end_time: '18:00:00',
          price: 2500.00,
          currency: 'NPR',
          total_seats: 500,
          available_seats: 350,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
          tags: ['Technology', 'Conference', 'Innovation', 'Networking'],
          rating: 4.6,
          review_count: 156
        },
        {
          title: 'Nepal Premier League 2024',
          description: 'Witness the excitement of Nepal\'s premier football league with top teams competing for glory.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Sports'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Dashrath Stadium'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['sportsnepal'])).rows[0].id,
          start_date: '2024-10-01',
          end_date: '2024-12-31',
          start_time: '16:00:00',
          end_time: '18:00:00',
          price: 800.00,
          currency: 'NPR',
          total_seats: 25000,
          available_seats: 20000,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
          tags: ['Football', 'Sports', 'League', 'Competition'],
          rating: 4.7,
          review_count: 892
        },
        {
          title: 'Nepal Comedy Festival 2024',
          description: 'Laugh your heart out with Nepal\'s top comedians in this hilarious comedy festival.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Comedy'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Nepal Academy Hall'])).rows[0].id,
          organizer_id: organizerId,
          start_date: '2024-11-10',
          end_date: '2024-11-10',
          start_time: '20:00:00',
          end_time: '23:00:00',
          price: 1200.00,
          currency: 'NPR',
          total_seats: 800,
          available_seats: 600,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'],
          tags: ['Comedy', 'Stand-up', 'Entertainment', 'Laughter'],
          rating: 4.5,
          review_count: 234
        },
        {
          title: 'Nepal Food & Wine Festival',
          description: 'Experience the finest Nepali cuisine and international wines in this culinary extravaganza.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Food'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Yak & Yeti Hotel'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['techconf'])).rows[0].id,
          start_date: '2024-12-01',
          end_date: '2024-12-03',
          start_time: '18:00:00',
          end_time: '22:00:00',
          price: 3000.00,
          currency: 'NPR',
          total_seats: 300,
          available_seats: 200,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
          tags: ['Food', 'Wine', 'Cuisine', 'Gourmet'],
          rating: 4.9,
          review_count: 189
        },
        {
          title: 'Nepal Art Exhibition 2024',
          description: 'Discover amazing artworks from Nepal\'s finest artists in this cultural exhibition.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Arts'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Nepal Academy Hall'])).rows[0].id,
          organizer_id: organizerId,
          start_date: '2024-10-15',
          end_date: '2024-10-30',
          start_time: '10:00:00',
          end_time: '18:00:00',
          price: 500.00,
          currency: 'NPR',
          total_seats: 1000,
          available_seats: 800,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'],
          tags: ['Art', 'Exhibition', 'Culture', 'Paintings'],
          rating: 4.4,
          review_count: 156
        },
        {
          title: 'Nepal Business Summit 2024',
          description: 'Connect with business leaders and entrepreneurs in Nepal\'s premier business networking event.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Business'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Yak & Yeti Hotel'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['techconf'])).rows[0].id,
          start_date: '2024-11-25',
          end_date: '2024-11-26',
          start_time: '09:00:00',
          end_time: '17:00:00',
          price: 5000.00,
          currency: 'NPR',
          total_seats: 400,
          available_seats: 250,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'],
          tags: ['Business', 'Networking', 'Entrepreneurship', 'Leadership'],
          rating: 4.7,
          review_count: 298
        },
        {
          title: 'Nepal Education Workshop Series',
          description: 'Enhance your skills with our comprehensive educational workshops covering various topics.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Education'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Nepal Academy Hall'])).rows[0].id,
          organizer_id: organizerId,
          start_date: '2024-10-20',
          end_date: '2024-10-25',
          start_time: '14:00:00',
          end_time: '17:00:00',
          price: 800.00,
          currency: 'NPR',
          total_seats: 200,
          available_seats: 150,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'],
          tags: ['Education', 'Workshop', 'Skills', 'Learning'],
          rating: 4.6,
          review_count: 167
        },
        {
          title: 'Nepal Gaming Championship 2024',
          description: 'Compete with the best gamers in Nepal in this exciting gaming tournament.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Technology'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Nepal Academy Hall'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['sportsnepal'])).rows[0].id,
          start_date: '2024-12-05',
          end_date: '2024-12-07',
          start_time: '12:00:00',
          end_time: '20:00:00',
          price: 1000.00,
          currency: 'NPR',
          total_seats: 500,
          available_seats: 400,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'],
          tags: ['Gaming', 'Tournament', 'Esports', 'Competition'],
          rating: 4.8,
          review_count: 445
        },
        {
          title: 'Nepal Music Festival 2024',
          description: 'A three-day celebration of music featuring local and international artists.',
          category_id: categoryId,
          venue_id: venueId,
          organizer_id: organizerId,
          start_date: '2024-12-20',
          end_date: '2024-12-22',
          start_time: '18:00:00',
          end_time: '23:00:00',
          price: 2000.00,
          currency: 'NPR',
          total_seats: 5000,
          available_seats: 3500,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'],
          tags: ['Music', 'Festival', 'Live Performance', 'Entertainment'],
          rating: 4.9,
          review_count: 678
        },
        {
          title: 'Nepal Yoga & Wellness Retreat',
          description: 'Rejuvenate your mind and body with our comprehensive yoga and wellness program.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Education'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Yak & Yeti Hotel'])).rows[0].id,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['techconf'])).rows[0].id,
          start_date: '2024-11-15',
          end_date: '2024-11-17',
          start_time: '07:00:00',
          end_time: '19:00:00',
          price: 3500.00,
          currency: 'NPR',
          total_seats: 150,
          available_seats: 100,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
          tags: ['Yoga', 'Wellness', 'Meditation', 'Health'],
          rating: 4.7,
          review_count: 234
        },
        {
          title: 'Nepal Photography Workshop',
          description: 'Learn photography techniques from professional photographers in beautiful Nepal.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Arts'])).rows[0].id,
          venue_id: (await query('SELECT id FROM venues WHERE name = $1', ['Nepal Academy Hall'])).rows[0].id,
          organizer_id: organizerId,
          start_date: '2024-10-25',
          end_date: '2024-10-27',
          start_time: '09:00:00',
          end_time: '17:00:00',
          price: 1500.00,
          currency: 'NPR',
          total_seats: 100,
          available_seats: 75,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
          tags: ['Photography', 'Workshop', 'Skills', 'Creative'],
          rating: 4.5,
          review_count: 123
        },
        {
          title: 'Nepal Cricket Championship',
          description: 'Watch the best cricket teams in Nepal compete for the championship title.',
          category_id: (await query('SELECT id FROM categories WHERE name = $1', ['Sports'])).rows[0].id,
          venue_id: venueId,
          organizer_id: (await query('SELECT id FROM users WHERE username = $1', ['sportsnepal'])).rows[0].id,
          start_date: '2024-11-05',
          end_date: '2024-11-15',
          start_time: '14:00:00',
          end_time: '18:00:00',
          price: 600.00,
          currency: 'NPR',
          total_seats: 15000,
          available_seats: 12000,
          status: 'upcoming',
          images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'],
          tags: ['Cricket', 'Sports', 'Championship', 'Competition'],
          rating: 4.6,
          review_count: 567
        }
      ];

          for (const event of events) {
      await query(
        `INSERT INTO events (title, description, category_id, venue_id, organizer_id, start_date, end_date, start_time, end_time, price, currency, total_seats, available_seats, status, images, tags, rating, review_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [event.title, event.description, event.category_id, event.venue_id, event.organizer_id, event.start_date, event.end_date, 
         event.start_time, event.end_time, event.price, event.currency, event.total_seats, event.available_seats, event.status, 
         event.images, event.tags, event.rating, event.review_count]
      );
    }
      console.log('✓ Events seeded');
    }

    // Seed created_events sample tracking rows for first two events
    const firstTwo = await query('SELECT id, title, category_id, venue_id, organizer_id, start_date, end_date, start_time, end_time, price, currency, total_seats, images FROM events ORDER BY id ASC LIMIT 2');
    for (const row of firstTwo.rows) {
      await query(
        `INSERT INTO created_events (event_id, organizer_id, title, description, category_id, venue_id, start_date, end_date, start_time, end_time, price, currency, total_seats, image_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)` ,
        [
          row.id, row.organizer_id, row.title, 'Seeded created event record', row.category_id, row.venue_id,
          row.start_date, row.end_date, row.start_time, row.end_time, row.price, row.currency, row.total_seats,
          Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null,
          'created'
        ]
      );
    }
    console.log('✓ Created events seeded');

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
