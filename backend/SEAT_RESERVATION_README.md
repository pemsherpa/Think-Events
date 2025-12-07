# Seat Reservation System - Technical Documentation

## Overview
This implements a **"Reserve-then-Commit"** strategy for seat booking with proper concurrency control to prevent double-booking in high-traffic scenarios.

## Architecture

### 1. Database Schema
**Table:** `seat_reservations`

**Key Features:**
- **Partial Unique Index:** Prevents two active (PENDING/BOOKED) reservations for the same seat
- **Status Flow:** PENDING → BOOKED (or EXPIRED/CANCELLED)
- **Expiration:** 10-minute window for payment

```sql
CREATE UNIQUE INDEX idx_active_seat_reservation 
ON seat_reservations (event_id, seat_number) 
WHERE status IN ('PENDING', 'BOOKED');
```

### 2. Concurrency Control Mechanism

**Problem:** Two users click "Reserve" at the same millisecond for the same seat.

**Solution:** Row-Level Locking with `FOR UPDATE NOWAIT`

```javascript
SELECT * FROM seat_reservations
WHERE event_id = $1 AND seat_number = $2
FOR UPDATE NOWAIT
```

**How it works:**
1. First transaction acquires lock → proceeds with reservation
2. Second transaction tries to acquire lock → gets `55P03` error immediately
3. Second user sees: "Seat is being reserved by another user"

### 3. Workflow

#### Reserve Flow
```
User clicks "Reserve Seat"
    ↓
BEGIN TRANSACTION
    ↓
SELECT ... FOR UPDATE NOWAIT (Lock the seat row)
    ↓
Check if seat is available
    ↓
INSERT reservation with status='PENDING', expires_at=NOW()+10min
    ↓
COMMIT
    ↓
Return reservationId and expiresAt to user
```

#### Payment Flow
```
User completes payment
    ↓
Payment gateway calls /api/reservations/confirm
    ↓
BEGIN TRANSACTION
    ↓
SELECT reservation FOR UPDATE
    ↓
Check if still PENDING and not expired
    ↓
UPDATE status='BOOKED', booking_id=X
    ↓
COMMIT
```

#### Cleanup Flow (Cron Job)
```
Every minute:
    ↓
UPDATE seat_reservations
SET status='EXPIRED'
WHERE status='PENDING' AND expires_at < NOW()
```

## API Endpoints

### 1. Reserve Seat
```http
POST /api/reservations/reserve
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": 123,
  "seat_number": "A15"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Seat reserved successfully",
  "data": {
    "reservationId": 456,
    "eventId": 123,
    "seatNumber": "A15",
    "status": "PENDING",
    "expiresAt": "2024-12-07T10:45:00Z",
    "expiresIn": 600
  }
}
```

**Error Response (409 - Seat Taken):**
```json
{
  "success": false,
  "message": "This seat is already reserved or booked"
}
```

### 2. Confirm Booking
```http
POST /api/reservations/confirm
Content-Type: application/json

{
  "reservation_id": 456,
  "booking_id": 789,
  "payment_reference": "PAY123"
}
```

### 3. Cancel Reservation
```http
DELETE /api/reservations/456
Authorization: Bearer <token>
```

### 4. Get Available Seats
```http
GET /api/reservations/available/123
```

## Installation

### 1. Install Dependencies
```bash
npm install node-cron
```

### 2. Run Database Migration
```bash
psql $DATABASE_URL -f database/migrations/add_seat_reservations.sql
```

### 3. Update server.js
```javascript
import { startReservationCleanupJob } from './jobs/cleanupExpiredReservations.js';
import seatReservationRoutes from './routes/seatReservationRoutes.js';

app.use('/api/reservations', seatReservationRoutes);
startReservationCleanupJob();
```

## Testing Concurrency

### Test Script (test-concurrency.js)
```javascript
import axios from 'axios';

const reserveSeat = async (token) => {
  try {
    const response = await axios.post('http://localhost:5001/api/reservations/reserve', {
      event_id: 123,
      seat_number: 'A15'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reserved:', response.data);
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.message);
  }
};

// Simulate 10 concurrent requests
const tokens = ['token1', 'token2', 'token3', ...]; // Different user tokens
Promise.all(tokens.map(token => reserveSeat(token)));
```

**Expected Result:** Only ONE reservation succeeds, others get "seat already reserved" error.

## Error Handling

| Error Code | Meaning | User Message |
|------------|---------|--------------|
| 55P03 | Lock timeout (NOWAIT) | "Seat is being reserved by another user" |
| 23505 | Unique constraint violation | "Seat is already reserved or booked" |
| 409 | Conflict | "Seat unavailable" |
| 400 | Expired reservation | "Reservation has expired" |

## Performance Considerations

1. **Indexes:** Partial index on active reservations is very efficient
2. **Cron Job:** Runs every minute, typically affects <100 rows
3. **Row Locking:** NOWAIT prevents lock queues, fails fast
4. **Connection Pooling:** Uses pg pool for efficient database connections

## Security

- Authentication required for reserve/cancel endpoints
- User can only cancel their own reservations
- Payment confirmation can be called by webhook (validate signature in production)

## Monitoring

**Key Metrics to Track:**
- Number of expired reservations per hour
- Lock timeout errors (55P03)
- Average reservation-to-booking conversion rate
- Peak concurrent reservation attempts

**Logs to Monitor:**
```
✅ Seat reserved: Event 123, Seat A15, User 456, Reservation 789
✅ Booking confirmed: Reservation 789, Booking 1011
✅ Cleaned up 15 expired reservations
❌ Lock timeout: Event 123, Seat A15 (concurrent attempt)
```

## Production Checklist

- [ ] Database migration applied
- [ ] Cron job started on server startup
- [ ] Monitoring alerts set up for high lock timeout rates
- [ ] Payment webhook signature validation implemented
- [ ] Load testing completed (100+ concurrent users)
- [ ] Backup/restore procedures tested
