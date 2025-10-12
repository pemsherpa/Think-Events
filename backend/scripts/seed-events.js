import { query } from '../src/config/database.js';

// High-quality event images from Unsplash
const eventImages = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop', // Music concert
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop', // Conference
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', // Theater
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop', // Festival
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', // Sports
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop', // Art exhibition
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop', // Food festival
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop', // Comedy show
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', // Dance performance
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', // Workshop
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop', // Networking
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop', // Art gallery
];

const events = [
  {
    title: 'Kathmandu Music Festival 2024',
    description: 'Join us for the biggest music festival of the year featuring top artists from Nepal and around the world. Experience live performances, food stalls, and an unforgettable atmosphere.',
    category_id: 43, // Music & Concerts
    venue_name: 'Tundikhel Ground',
    venue_address: 'Tundikhel, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-12-15',
    end_date: '2024-12-15',
    start_time: '14:00',
    end_time: '22:00',
    price: 2500,
    currency: 'NPR',
    total_seats: 5000,
    tags: 'music, festival, live, outdoor, entertainment',
    image_url: eventImages[0]
  },
  {
    title: 'Tech Innovation Summit 2024',
    description: 'A premier technology conference bringing together industry leaders, innovators, and entrepreneurs to discuss the future of technology and digital transformation.',
    category_id: 51, // Technology
    venue_name: 'Hotel Yak & Yeti',
    venue_address: 'Durbar Marg, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-11-20',
    end_date: '2024-11-22',
    start_time: '09:00',
    end_time: '17:00',
    price: 5000,
    currency: 'NPR',
    total_seats: 300,
    tags: 'technology, innovation, conference, networking, business',
    image_url: eventImages[1]
  },
  {
    title: 'Nepali Classical Dance Performance',
    description: 'Experience the beauty and grace of traditional Nepali classical dance performed by renowned artists. A cultural evening showcasing our rich heritage.',
    category_id: 53, // Arts
    venue_name: 'National Theatre',
    venue_address: 'Jamal, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-12-01',
    end_date: '2024-12-01',
    start_time: '18:30',
    end_time: '20:30',
    price: 1500,
    currency: 'NPR',
    total_seats: 200,
    tags: 'dance, classical, culture, traditional, performance',
    image_url: eventImages[3]
  },
  {
    title: 'Food & Wine Festival',
    description: 'Indulge in the finest cuisines and wines from around the world. Meet local chefs, participate in cooking workshops, and enjoy live music.',
    category_id: 54, // Food
    venue_name: 'Garden of Dreams',
    venue_address: 'Thamel, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-11-25',
    end_date: '2024-11-25',
    start_time: '16:00',
    end_time: '21:00',
    price: 3000,
    currency: 'NPR',
    total_seats: 400,
    tags: 'food, wine, festival, culinary, tasting',
    image_url: eventImages[6]
  },
  {
    title: 'Stand-up Comedy Night',
    description: 'Laugh your heart out with Nepal\'s funniest comedians. An evening of pure entertainment and laughter guaranteed to lift your spirits.',
    category_id: 56, // Comedy
    venue_name: 'Club Deja Vu',
    venue_address: 'Thamel, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-11-30',
    end_date: '2024-11-30',
    start_time: '19:00',
    end_time: '21:00',
    price: 1200,
    currency: 'NPR',
    total_seats: 150,
    tags: 'comedy, stand-up, entertainment, laughter, fun',
    image_url: eventImages[7]
  },
  {
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies and tools from industry experts. Perfect for entrepreneurs, marketers, and business owners.',
    category_id: 51, // Technology
    venue_name: 'Innovation Hub',
    venue_address: 'Lalitpur, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-12-05',
    end_date: '2024-12-05',
    start_time: '10:00',
    end_time: '16:00',
    price: 2000,
    currency: 'NPR',
    total_seats: 50,
    tags: 'workshop, digital marketing, business, learning, skills',
    image_url: eventImages[9]
  },
  {
    title: 'Art Exhibition: Modern Nepal',
    description: 'Contemporary art exhibition showcasing the works of emerging and established Nepali artists. Explore the evolving art scene of Nepal.',
    category_id: 53, // Arts
    venue_name: 'Nepal Art Council',
    venue_address: 'Babar Mahal, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-12-10',
    end_date: '2024-12-20',
    start_time: '10:00',
    end_time: '18:00',
    price: 500,
    currency: 'NPR',
    total_seats: 100,
    tags: 'art, exhibition, contemporary, culture, visual',
    image_url: eventImages[5]
  },
  {
    title: 'Marathon for Charity',
    description: 'Join us for a 10K marathon to raise funds for education in rural Nepal. Run for a cause and make a difference in children\'s lives.',
    category_id: 50, // Sports
    venue_name: 'Kathmandu Valley',
    venue_address: 'Various locations',
    venue_city: 'Kathmandu',
    start_date: '2024-12-08',
    end_date: '2024-12-08',
    start_time: '06:00',
    end_time: '10:00',
    price: 1000,
    currency: 'NPR',
    total_seats: 1000,
    tags: 'marathon, charity, fitness, running, social cause',
    image_url: eventImages[4]
  },
  {
    title: 'Business Networking Mixer',
    description: 'Connect with like-minded entrepreneurs, investors, and business professionals. Expand your network and discover new opportunities.',
    category_id: 52, // Business
    venue_name: 'Hotel Radisson',
    venue_address: 'Lazimpat, Kathmandu',
    venue_city: 'Kathmandu',
    start_date: '2024-11-28',
    end_date: '2024-11-28',
    start_time: '18:00',
    end_time: '21:00',
    price: 2500,
    currency: 'NPR',
    total_seats: 120,
    tags: 'networking, business, entrepreneurship, professional, connections',
    image_url: eventImages[10]
  },
  {
    title: 'Yoga & Meditation Retreat',
    description: 'Reconnect with yourself through yoga and meditation. A peaceful retreat in the mountains to rejuvenate your mind, body, and soul.',
    category_id: 44, // Sports & Fitness
    venue_name: 'Nagarkot Resort',
    venue_address: 'Nagarkot, Bhaktapur',
    venue_city: 'Bhaktapur',
    start_date: '2024-12-12',
    end_date: '2024-12-14',
    start_time: '07:00',
    end_time: '19:00',
    price: 8000,
    currency: 'NPR',
    total_seats: 30,
    tags: 'yoga, meditation, wellness, retreat, mindfulness',
    image_url: eventImages[8]
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Starting to seed events...');
    
    // Get categories to verify they exist
    const categoriesResult = await query('SELECT id, name FROM categories ORDER BY id');
    console.log('\n📋 Available categories:');
    console.table(categoriesResult.rows);
    
    // Get a sample organizer (assuming user ID 46 exists)
    const organizerResult = await query('SELECT id, first_name, last_name, email FROM users WHERE id = 46 LIMIT 1');
    
    if (organizerResult.rows.length === 0) {
      console.error('❌ No organizer found with ID 46. Please ensure the user exists.');
      return;
    }
    
    const organizer = organizerResult.rows[0];
    console.log(`\n👤 Using organizer: ${organizer.first_name} ${organizer.last_name} (${organizer.email})`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const eventData of events) {
      try {
        const result = await query(`
          INSERT INTO events (
            organizer_id, title, description, category_id, start_date, end_date, start_time, 
            end_time, price, currency, total_seats, available_seats, 
            tags, images, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          organizer.id,
          eventData.title,
          eventData.description,
          eventData.category_id,
          eventData.start_date,
          eventData.end_date,
          eventData.start_time,
          eventData.end_time,
          eventData.price,
          eventData.currency,
          eventData.total_seats,
          eventData.total_seats, // available_seats = total_seats initially
          eventData.tags.split(',').map(tag => tag.trim()), // Convert to array
          eventData.image_url ? [eventData.image_url] : [], // Convert to array
          'published',
          new Date(),
          new Date()
        ]);
        
        console.log(`✅ Created event: ${eventData.title}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create event "${eventData.title}":`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Seeding Summary:`);
    console.log(`✅ Successfully created: ${successCount} events`);
    console.log(`❌ Failed: ${errorCount} events`);
    
    // Show final count
    const finalCount = await query('SELECT COUNT(*) as count FROM events');
    console.log(`\n📈 Total events in database: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
}

// Run the seeding
seedEvents().then(() => {
  console.log('🎉 Event seeding completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
