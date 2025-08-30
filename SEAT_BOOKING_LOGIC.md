# Seat Booking Logic for Think-Events

## Overview
This document outlines the comprehensive seat booking system logic for the Think-Events platform, covering different venue types, seat management, and booking workflows.

## Current Implementation Status

### ✅ What's Working Now
- **All seats are available**: Modified the seat generation logic to make all seats available by default
- **Multiple venue types**: Theater, Stadium, Movie Hall, and Open Ground layouts
- **Seat selection UI**: Interactive seat map with visual feedback
- **Price calculation**: Real-time total price calculation based on selected seats
- **Seat types**: VIP, Premium, Standard, GA, and Fan Pit categories

### 🔄 What's Implemented but Needs Payment Integration
- Seat selection and reservation
- Price calculation
- Booking form integration
- Order summary

## Seat Booking Logic Architecture

### 1. Venue Types and Layouts

#### Theater Layout
```
Row A: VIP (रु 2,500) - 12 seats
Row B: VIP (रु 2,500) - 12 seats
Row C: Premium (रु 1,500) - 12 seats
Row D: Premium (रु 1,500) - 12 seats
Row E-J: Standard (रु 800) - 12 seats each
```

#### Stadium Layout
```
North Stand: VIP (रु 1,800) - 5 seats
South Stand: VIP (रु 1,800) - 5 seats
East Stand: Premium (रु 1,200) - 5 seats
West Stand: Premium (रु 1,200) - 5 seats
```

#### Movie Hall Layout
```
Row A-C: VIP (रु 1,200) - 16 seats each
Row D-F: Premium (रु 800) - 16 seats each
Row G-L: Standard (रु 400) - 16 seats each
```

#### Open Ground Layout
```
VIP Section: रु 2,000 - 3 seats
General Admission: रु 300 - 8 seats
Fan Pit: रु 800 - 5 seats
```

### 2. Seat Management System

#### Seat States
1. **Available**: Seat can be selected
2. **Selected**: User has selected this seat
3. **Reserved**: Seat is temporarily reserved (during booking process)
4. **Booked**: Seat has been purchased
5. **Unavailable**: Seat is not available for booking

#### Seat Properties
```typescript
interface Seat {
  id: string;           // Unique seat identifier
  row: string;          // Row or section name
  number: number;       // Seat number
  type: SeatType;       // VIP, Premium, Standard, etc.
  price: number;        // Seat price in NPR
  isAvailable: boolean; // Availability status
  isSelected: boolean;  // User selection status
  section?: string;     // For stadium/ground layouts
}
```

### 3. Booking Workflow

#### Step 1: Seat Selection
1. User views interactive seat map
2. Clicks on available seats to select/deselect
3. Real-time price calculation updates
4. Visual feedback shows selected seats

#### Step 2: Booking Form
1. User fills in personal details
2. Selects payment method
3. Reviews order summary
4. Confirms booking

#### Step 3: Payment Processing
1. Payment gateway integration
2. Transaction verification
3. Seat reservation confirmation

#### Step 4: Confirmation
1. Booking confirmation email
2. QR code generation for entry
3. Seat reservation in database

### 4. Database Schema

#### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  venue_id INTEGER REFERENCES venues(id),
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  seat_layout JSONB, -- Stores seat configuration
  pricing_config JSONB -- Stores pricing tiers
);
```

#### Seats Table
```sql
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  seat_number VARCHAR(50) NOT NULL,
  row_name VARCHAR(50),
  section_name VARCHAR(100),
  seat_type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  booking_id INTEGER REFERENCES bookings(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER REFERENCES events(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  booking_status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Payment Integration Strategy

#### Payment Methods
1. **Esewa**: Popular Nepali payment gateway
2. **Khalti**: Digital wallet integration
3. **Credit/Debit Cards**: International payment support
4. **Bank Transfer**: Direct bank payment
5. **Cash on Delivery**: For local events

#### Payment Flow
1. **Pre-booking**: Reserve seats for 15 minutes
2. **Payment Processing**: Secure payment gateway
3. **Confirmation**: Update booking status
4. **Ticket Generation**: QR code and digital ticket

### 6. Seat Reservation Logic

#### Temporary Reservation
```javascript
// Reserve seats for 15 minutes during payment
const reserveSeats = async (seatIds, userId) => {
  const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000);
  
  await query(`
    UPDATE seats 
    SET status = 'reserved', 
        reservation_expiry = $1,
        reserved_by = $2
    WHERE id = ANY($3) AND status = 'available'
  `, [reservationExpiry, userId, seatIds]);
};
```

#### Payment Confirmation
```javascript
// Confirm booking after successful payment
const confirmBooking = async (bookingId, paymentId) => {
  await query(`
    UPDATE seats 
    SET status = 'booked', 
        booking_id = $1
    WHERE reservation_expiry > NOW() 
    AND reserved_by = $2
  `, [bookingId, userId]);
};
```

### 7. Real-time Updates

#### WebSocket Integration
```javascript
// Real-time seat status updates
const seatUpdateHandler = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-event', (eventId) => {
      socket.join(`event-${eventId}`);
    });
    
    socket.on('seat-selected', (seatId) => {
      socket.to(`event-${eventId}`).emit('seat-updated', {
        seatId,
        status: 'reserved'
      });
    });
  });
};
```

### 8. Error Handling

#### Common Scenarios
1. **Seat Already Booked**: Show error and refresh seat map
2. **Payment Failed**: Release seat reservation
3. **Session Timeout**: Clear selected seats
4. **Network Issues**: Retry mechanism with exponential backoff

#### Recovery Mechanisms
```javascript
// Clean up expired reservations
const cleanupExpiredReservations = async () => {
  await query(`
    UPDATE seats 
    SET status = 'available', 
        reservation_expiry = NULL,
        reserved_by = NULL
    WHERE status = 'reserved' 
    AND reservation_expiry < NOW()
  `);
};
```

### 9. Future Enhancements

#### Advanced Features
1. **Group Booking**: Book multiple seats together
2. **Seat Recommendations**: AI-powered seat suggestions
3. **Dynamic Pricing**: Real-time price adjustments
4. **Waitlist System**: Queue for sold-out events
5. **Seat Exchange**: Allow users to exchange seats

#### Analytics
1. **Booking Patterns**: Track popular seats and times
2. **Revenue Optimization**: Analyze pricing strategies
3. **User Behavior**: Understand booking preferences

## Implementation Priority

### Phase 1 (Current)
- ✅ Basic seat selection
- ✅ Price calculation
- ✅ UI/UX implementation

### Phase 2 (Next)
- 🔄 Payment gateway integration
- 🔄 Database schema updates
- 🔄 Booking confirmation system

### Phase 3 (Future)
- 📋 Real-time updates
- 📋 Advanced seat management
- 📋 Analytics and optimization

## Technical Requirements

### Frontend
- React with TypeScript
- Real-time state management
- Responsive seat map
- Payment form integration

### Backend
- Node.js with Express
- PostgreSQL database
- WebSocket support
- Payment gateway APIs

### Infrastructure
- File storage for seat maps
- CDN for static assets
- Load balancing for high traffic
- Database optimization

This comprehensive seat booking system ensures a smooth user experience while maintaining data integrity and supporting scalable growth.
