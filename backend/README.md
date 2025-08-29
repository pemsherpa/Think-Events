# Think-Events Backend

A scalable, production-ready backend API for the Think-Events application built with Node.js, Express, and PostgreSQL (Neon DB).

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with Google OAuth support
- **Event Management**: CRUD operations for events, categories, and venues
- **Booking System**: Complete booking management with seat selection
- **Database**: PostgreSQL with Neon DB integration
- **Security**: Helmet, CORS, rate limiting, input validation
- **Scalable Architecture**: Modular structure with separation of concerns
- **API Documentation**: RESTful API design with proper error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon DB)
- **Authentication**: JWT + Google OAuth
- **Validation**: Express-validator
- **Security**: Helmet, bcryptjs
- **Rate Limiting**: Express-rate-limit

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models (if using ORM)
├── routes/          # API route definitions
├── services/        # Business logic services
├── utils/           # Utility functions
├── database/        # Database migrations and seeds
└── server.js        # Main application file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Neon DB account

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL=your_neon_db_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed database with initial data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **events**: Event information and details
- **categories**: Event categories
- **venues**: Event venues and locations
- **bookings**: User bookings and reservations
- **reviews**: User reviews and ratings

### Key Relationships

- Events belong to categories and venues
- Bookings link users to events
- Reviews connect users to events
- Users can be organizers for events

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `GET /api/events/categories` - List categories
- `GET /api/events/venues` - List venues
- `POST /api/events` - Create event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete event (organizer only)

### Bookings
- `GET /api/bookings` - User's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/seats/:event_id` - Get available seats

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Configurable rate limiting per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **SQL Injection Prevention**: Parameterized queries

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Neon DB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set strong JWT secret

2. **Process Management**
   - Use PM2 or similar process manager
   - Configure reverse proxy (Nginx)
   - Set up SSL certificates

3. **Monitoring**
   - Implement logging (Winston)
   - Set up health checks
   - Monitor performance metrics

## 📈 Scalability Considerations

- **Database Connection Pooling**: Configured for optimal performance
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Modular Architecture**: Easy to add new features
- **Caching Ready**: Structure supports Redis integration
- **Microservices Ready**: Can be split into separate services

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review error logs
- Check database connectivity
- Verify environment variables

## 🔄 Updates and Maintenance

- Regular dependency updates
- Security patches
- Performance monitoring
- Database optimization
- API versioning strategy
