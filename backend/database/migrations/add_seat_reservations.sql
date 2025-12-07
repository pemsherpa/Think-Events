-- Migration: Add Seat Reservations Table with Concurrency Control
-- Purpose: Implement "Reserve-then-Commit" strategy to prevent double-booking

-- Create seat_reservations table
CREATE TABLE IF NOT EXISTS seat_reservations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'BOOKED', 'EXPIRED', 'CANCELLED')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRITICAL: Partial Unique Index to prevent double-booking
-- Only one active (PENDING or BOOKED) reservation per seat per event
CREATE UNIQUE INDEX idx_active_seat_reservation 
ON seat_reservations (event_id, seat_number) 
WHERE status IN ('PENDING', 'BOOKED');

-- Index for efficient expiration cleanup queries
CREATE INDEX idx_pending_expired 
ON seat_reservations (status, expires_at) 
WHERE status = 'PENDING';

-- Index for user's reservations
CREATE INDEX idx_user_reservations 
ON seat_reservations (user_id, status);

-- Index for event reservations
CREATE INDEX idx_event_reservations 
ON seat_reservations (event_id, status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seat_reservation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seat_reservation_updated_at
BEFORE UPDATE ON seat_reservations
FOR EACH ROW
EXECUTE FUNCTION update_seat_reservation_timestamp();

-- Comments for documentation
COMMENT ON TABLE seat_reservations IS 'Manages seat reservations with 10-minute hold period';
COMMENT ON COLUMN seat_reservations.status IS 'PENDING: Reserved but not paid, BOOKED: Payment confirmed, EXPIRED: Reservation timed out, CANCELLED: User cancelled';
COMMENT ON COLUMN seat_reservations.expires_at IS 'Timestamp when PENDING reservation expires (10 minutes from creation)';
COMMENT ON INDEX idx_active_seat_reservation IS 'Prevents double-booking by ensuring only one active reservation per seat';
