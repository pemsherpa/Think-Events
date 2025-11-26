import { query } from '../config/database.js';

const seedLOD = async () => {
  try {
    console.log('Seeding LOD Event and Layout...');

    // 1. Get or Create Categories
    const categories = [
      { name: 'VVIP', color: '#00FFFF', description: 'VVIP Section' }, // Cyan
      { name: 'Wings', color: '#FFA500', description: 'Side Wings' }, // Orange/Gold
      { name: 'Standard', color: '#FFA500', description: 'Standard Seating' }, // Orange
      { name: 'Dance Floor', color: '#FFFF00', description: 'Dance Floor Access' } // Yellow
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const res = await query(
        'INSERT INTO seat_categories (name, color, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET color = $2 RETURNING id',
        [cat.name, cat.color, cat.description]
      );
      categoryMap[cat.name] = res.rows[0].id;
    }

    // 2. Create Event
    // Assuming we have a venue and organizer (reuse from seed.js or fetch first available)
    const venueRes = await query('SELECT id FROM venues LIMIT 1');
    const organizerRes = await query('SELECT id FROM users WHERE is_organizer = true LIMIT 1');
    const eventCategoryRes = await query('SELECT id FROM categories LIMIT 1');

    if (venueRes.rows.length === 0 || organizerRes.rows.length === 0) {
      throw new Error('No venue or organizer found. Run main seed first.');
    }

    const venueId = venueRes.rows[0].id;
    const organizerId = organizerRes.rows[0].id;
    const eventCategoryId = eventCategoryRes.rows[0].id;

    const eventRes = await query(
      `INSERT INTO events (
        title, description, category_id, venue_id, organizer_id, 
        start_date, end_date, start_time, end_time, 
        price, currency, total_seats, available_seats, status, 
        images, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING id`,
      [
        'LOD Night Special', 
        'Experience the ultimate party with our exclusive LOD layout.',
        eventCategoryId, venueId, organizerId,
        '2025-12-31', '2026-01-01', '20:00:00', '04:00:00',
        2000, 'NPR', 1000, 1000, 'upcoming',
        ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'],
        ['Party', 'Nightlife', 'LOD']
      ]
    );
    const eventId = eventRes.rows[0].id;
    console.log('Created Event:', eventId);

    // 3. Create Seat Layout
    const layoutRes = await query(
      `INSERT INTO seat_layouts (
        event_id, venue_type, layout_name, total_rows, total_columns,
        booking_type, max_bookings_per_seat, layout_config, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [eventId, 'open_ground', 'LOD Layout', 20, 20, 'multiple', 8, { type: 'lod' }, true]
    );
    const layoutId = layoutRes.rows[0].id;
    console.log('Created Layout:', layoutId);

    // 4. Create Seats
    const seats = [];

    // Helper to add seat
    const addSeat = (row, col, number, catName, price, capacity = 1, type = 'standard') => {
      seats.push({
        layout_id: layoutId,
        row_number: row,
        column_number: col,
        seat_number: number,
        category_id: categoryMap[catName],
        price: price,
        max_capacity: capacity,
        seat_type: type
      });
    };

    // VVIP Left (A14-A16)
    addSeat(1, 1, 'A14', 'VVIP', 5000);
    addSeat(1, 2, 'A15', 'VVIP', 5000);
    addSeat(1, 3, 'A16', 'VVIP', 5000);

    // VVIP Right (B15, B14)
    addSeat(1, 17, 'B15', 'VVIP', 5000);
    addSeat(1, 18, 'B14', 'VVIP', 5000);

    // Side Wings A (Left) - Prefix with A-
    const wingAPrice = 3000;
    // X6
    addSeat(3, 1, 'A-12', 'Wings', wingAPrice); addSeat(3, 2, 'A-5', 'Wings', wingAPrice); addSeat(3, 3, 'A-4', 'Wings', wingAPrice);
    // X5
    addSeat(4, 1, 'A-11', 'Wings', wingAPrice); addSeat(4, 2, 'A-6', 'Wings', wingAPrice); addSeat(4, 3, 'A-3', 'Wings', wingAPrice);
    // X4
    addSeat(5, 1, 'A-10', 'Wings', wingAPrice); addSeat(5, 2, 'A-7', 'Wings', wingAPrice); addSeat(5, 3, 'A-2', 'Wings', wingAPrice);
    // X3
    addSeat(6, 1, 'A-9', 'Wings', wingAPrice);  addSeat(6, 2, 'A-8', 'Wings', wingAPrice); addSeat(6, 3, 'A-1', 'Wings', wingAPrice);
    // X2
    addSeat(7, 1, 'A-X2-1', 'Wings', wingAPrice); addSeat(7, 2, 'A-X2-2', 'Wings', wingAPrice);
    // X1
    addSeat(8, 1, 'A-X1-1', 'Wings', wingAPrice);

    // Side Wings B (Right) - Prefix with B-
    const wingBPrice = 3000;
    // Y6
    addSeat(3, 17, 'B-4', 'Wings', wingBPrice); addSeat(3, 18, 'B-5', 'Wings', wingBPrice); addSeat(3, 19, 'B-12', 'Wings', wingBPrice);
    // Y5
    addSeat(4, 17, 'B-3', 'Wings', wingBPrice); addSeat(4, 18, 'B-6', 'Wings', wingBPrice); addSeat(4, 19, 'B-11', 'Wings', wingBPrice);
    // Y4
    addSeat(5, 17, 'B-2', 'Wings', wingBPrice); addSeat(5, 18, 'B-7', 'Wings', wingBPrice); addSeat(5, 19, 'B-10', 'Wings', wingBPrice);
    // Y3
    addSeat(6, 17, 'B-1', 'Wings', wingBPrice); addSeat(6, 18, 'B-8', 'Wings', wingBPrice); addSeat(6, 19, 'B-9', 'Wings', wingBPrice);
    // Y2
    addSeat(7, 18, 'B-Y2-1', 'Wings', wingBPrice); addSeat(7, 19, 'B-Y2-2', 'Wings', wingBPrice);
    // Y1
    addSeat(8, 19, 'B-Y1-1', 'Wings', wingBPrice);

    // Dance Floor (Center)
    addSeat(5, 10, 'DF', 'Dance Floor', 1000, 500, 'standard');

    // Section C (Bottom Center)
    const sectionCPrice = 2000;
    addSeat(10, 8, 'D6', 'Standard', sectionCPrice);
    addSeat(10, 9, 'D7', 'Standard', sectionCPrice);
    addSeat(10, 11, 'D8', 'Standard', sectionCPrice);
    addSeat(10, 12, 'D9', 'Standard', sectionCPrice);

    // Section D (Bottom)
    const sectionDPrice = 2000;
    addSeat(12, 6, 'D5', 'Standard', sectionDPrice);
    addSeat(12, 8, 'D4', 'Standard', sectionDPrice);
    addSeat(12, 10, 'D3', 'Standard', sectionDPrice);
    addSeat(12, 12, 'D2', 'Standard', sectionDPrice);
    addSeat(12, 14, 'D1', 'Standard', sectionDPrice);

    // Insert all seats
    for (const seat of seats) {
      await query(
        `INSERT INTO seats (
          layout_id, row_number, column_number, seat_number,
          category_id, price, max_capacity, seat_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          seat.layout_id, seat.row_number, seat.column_number, seat.seat_number,
          seat.category_id, seat.price, seat.max_capacity, seat.seat_type
        ]
      );
    }
    console.log(`Seeded ${seats.length} seats.`);

    console.log('LOD Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedLOD();
