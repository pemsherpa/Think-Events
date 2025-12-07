// Add this to your main server.js file

import { startReservationCleanupJob } from './jobs/cleanupExpiredReservations.js';
import seatReservationRoutes from './routes/seatReservationRoutes.js';

// ... your existing server setup ...

// Register seat reservation routes
app.use('/api/reservations', seatReservationRoutes);

// Start the cleanup cron job
startReservationCleanupJob();

// ... rest of your server code ...
