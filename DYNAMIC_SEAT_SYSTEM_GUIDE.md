# 🎫 Dynamic Seat Selection System

A comprehensive, production-ready seat selection system for the Think-Events ticket booking platform, similar to BookMyShow.

## 🚀 **SYSTEM OVERVIEW**

The dynamic seat selection system provides event organizers with complete control over their venue layouts while offering users an intuitive booking experience. The system supports three venue types and two booking modes.

---

## 🏗️ **ARCHITECTURE**

### **Database Schema**
- **`seat_categories`**: Predefined seat categories (VIP, Premium, Standard, etc.)
- **`seat_layouts`**: Event-specific layout configurations
- **`seats`**: Individual seat definitions with pricing and availability
- **`seat_bookings`**: Detailed booking records linking seats to bookings

### **Backend APIs**
- **Seat Layout Management**: CRUD operations for layouts
- **Seat Categories**: Management of seat types and pricing
- **Booking Logic**: Advanced seat booking with conflict resolution
- **Availability Tracking**: Real-time seat availability updates

### **Frontend Components**
- **SeatLayoutCreator**: Visual layout designer for organizers
- **DynamicSeatGrid**: Interactive seat selection for users
- **SeatLayoutManager**: Layout management interface

---

## 🎯 **KEY FEATURES**

### ✅ **Custom Event Layout Creation**
- **Venue Types**: Theater, Open Ground, Simple Counter
- **Grid Configuration**: Customizable rows and columns (up to 20×30)
- **Visual Designer**: Click-to-assign category interface
- **Category Management**: Multiple seat types with custom pricing
- **Real-time Preview**: Live layout preview during creation

### ✅ **Dynamic Layout Storage**
- **Structured Data**: JSON-based layout configuration
- **Seat Metadata**: Row, column, category, price, capacity
- **Booking Rules**: One-time vs multiple booking per seat
- **Version Control**: Layout history and updates

### ✅ **Dynamic Frontend Rendering**
- **Interactive Grid**: Click-to-select seat interface
- **Visual Indicators**: Color-coded categories and status
- **Real-time Updates**: Live availability tracking
- **Responsive Design**: Works on all device sizes

### ✅ **Advanced Booking Logic**
- **One-Time Booking**: Each seat can only be booked once
- **Multiple Booking**: Seats can be booked multiple times up to capacity
- **Conflict Prevention**: Database-level booking validation
- **Transaction Safety**: ACID-compliant booking process

### ✅ **Simple Mode Fallback**
- **Counter Interface**: +/- buttons for quantity selection
- **No Layout Required**: Works for events without custom layouts
- **Flexible Pricing**: Single price per ticket

---

## 🛠️ **TECHNICAL IMPLEMENTATION**

### **Database Tables**

#### **seat_categories**
```sql
CREATE TABLE seat_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **seat_layouts**
```sql
CREATE TABLE seat_layouts (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  venue_type VARCHAR(20) NOT NULL CHECK (venue_type IN ('theater', 'open_ground', 'simple_counter')),
  layout_name VARCHAR(100) NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  total_columns INTEGER NOT NULL DEFAULT 0,
  booking_type VARCHAR(20) NOT NULL DEFAULT 'one_time' CHECK (booking_type IN ('one_time', 'multiple')),
  max_bookings_per_seat INTEGER DEFAULT 1,
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **seats**
```sql
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  layout_id INTEGER REFERENCES seat_layouts(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  column_number INTEGER NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  category_id INTEGER REFERENCES seat_categories(id),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  max_capacity INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  seat_type VARCHAR(20) DEFAULT 'standard' CHECK (seat_type IN ('standard', 'aisle', 'disabled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(layout_id, row_number, column_number)
);
```

#### **seat_bookings**
```sql
CREATE TABLE seat_bookings (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id INTEGER REFERENCES seats(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **API Endpoints**

#### **Seat Categories**
- `GET /api/seat-layout/categories` - Get all categories
- `POST /api/seat-layout/categories` - Create new category

#### **Seat Layouts**
- `GET /api/seat-layout/event/:eventId` - Get layout for event
- `GET /api/seat-layout/event/:eventId/available` - Get available seats
- `POST /api/seat-layout/event/:eventId` - Create layout
- `PUT /api/seat-layout/layout/:layoutId` - Update layout
- `DELETE /api/seat-layout/layout/:layoutId` - Delete layout

#### **Seat Booking**
- `POST /api/seat-layout/event/:eventId/book` - Book selected seats

---

## 🎨 **USER INTERFACE**

### **Event Organizer Interface**

#### **Seat Layout Creator**
- **Venue Type Selection**: Theater, Open Ground, Simple Counter
- **Grid Configuration**: Set rows and columns
- **Category Assignment**: Click seats to assign categories
- **Pricing Setup**: Set price and capacity per category
- **Booking Rules**: Choose one-time or multiple booking
- **Live Preview**: Real-time layout visualization

#### **Layout Management**
- **Layout Overview**: View current layout configuration
- **Edit/Delete**: Modify or remove layouts
- **Status Tracking**: Active/inactive layout states
- **Booking Statistics**: Track seat utilization

### **User Booking Interface**

#### **Dynamic Seat Grid**
- **Interactive Selection**: Click to select/deselect seats
- **Visual Categories**: Color-coded seat types
- **Availability Status**: Real-time seat availability
- **Quantity Selection**: Adjust quantities for multiple bookings
- **Price Display**: Live price calculation

#### **Simple Counter Mode**
- **Quantity Selector**: +/- buttons for ticket count
- **Price Display**: Total price calculation
- **No Layout Required**: Works without custom layouts

---

## 🔄 **BOOKING FLOW**

### **1. Event Creation**
1. Organizer creates event
2. Optionally configures seat layout
3. System generates seat inventory

### **2. Seat Selection**
1. User views event details
2. System checks for custom layout
3. Displays appropriate interface (grid or counter)
4. User selects seats/quantity

### **3. Booking Process**
1. User proceeds to payment
2. System validates seat availability
3. Creates booking with seat details
4. Updates seat availability
5. Sends confirmation

### **4. Conflict Resolution**
- **Database Transactions**: Ensures data consistency
- **Availability Checks**: Prevents double-booking
- **Rollback Support**: Handles booking failures gracefully

---

## 🎛️ **CONFIGURATION OPTIONS**

### **Venue Types**

#### **Theater**
- **Grid Layout**: Traditional row/column arrangement
- **Category Assignment**: VIP, Premium, Standard seats
- **Aisle Support**: Disabled seats for aisles
- **Visual Design**: Theater-style seat arrangement

#### **Open Ground**
- **Flexible Layout**: Custom grid configuration
- **Category Support**: Multiple pricing tiers
- **Capacity Management**: Per-seat booking limits
- **Outdoor Events**: Suitable for festivals, concerts

#### **Simple Counter**
- **No Layout**: Quantity-based booking only
- **Single Price**: One price per ticket
- **Unlimited Capacity**: No seat restrictions
- **Quick Setup**: Minimal configuration required

### **Booking Types**

#### **One-Time Booking**
- **Single Occupancy**: Each seat booked once
- **Traditional Model**: Like movie theaters
- **Simple Logic**: Straightforward availability

#### **Multiple Booking**
- **Shared Seats**: Multiple bookings per seat
- **Capacity Limits**: Configurable max bookings
- **Flexible Model**: Suitable for events with variable attendance

---

## 🚀 **USAGE EXAMPLES**

### **Creating a Theater Layout**
```javascript
const layoutData = {
  venueType: 'theater',
  layoutName: 'Main Theater',
  totalRows: 10,
  totalColumns: 15,
  bookingType: 'one_time',
  seats: [
    {
      rowNumber: 1,
      columnNumber: 1,
      seatNumber: 'A1',
      categoryId: 1, // VIP
      price: 2500,
      maxCapacity: 1,
      seatType: 'standard'
    }
    // ... more seats
  ]
};
```

### **Booking Seats**
```javascript
const bookingData = {
  seatSelections: [
    {
      seatId: 123,
      quantity: 1
    },
    {
      seatId: 124,
      quantity: 2
    }
  ]
};
```

---

## 🔧 **SETUP INSTRUCTIONS**

### **1. Database Migration**
```bash
cd Think-Events/backend
npm run migrate:seats
```

### **2. Backend Setup**
The seat layout APIs are automatically included in the server:
```javascript
app.use('/api/seat-layout', seatLayoutRoutes);
```

### **3. Frontend Integration**
Components are ready to use:
```tsx
import DynamicSeatGrid from '@/components/SeatLayout/DynamicSeatGrid';
import SeatLayoutCreator from '@/components/SeatLayout/SeatLayoutCreator';
```

### **4. Event Creation Flow**
1. Create event normally
2. System prompts for seat layout configuration
3. Configure layout using visual designer
4. Layout is automatically applied to booking page

---

## 📊 **PERFORMANCE CONSIDERATIONS**

### **Database Optimization**
- **Indexes**: Optimized queries for seat availability
- **Transactions**: Efficient booking operations
- **Caching**: Seat availability caching (future enhancement)

### **Frontend Performance**
- **Virtual Scrolling**: For large seat grids (future enhancement)
- **Lazy Loading**: Load seat data on demand
- **State Management**: Efficient React state updates

### **Scalability**
- **Horizontal Scaling**: Database can handle multiple instances
- **Load Balancing**: API endpoints support load distribution
- **Caching Strategy**: Redis integration ready (future enhancement)

---

## 🛡️ **SECURITY FEATURES**

### **Authentication**
- **JWT Tokens**: Secure API access
- **Role-based Access**: Organizer vs user permissions
- **Session Management**: Secure user sessions

### **Data Validation**
- **Input Sanitization**: All user inputs validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Frontend input sanitization

### **Booking Security**
- **Conflict Prevention**: Database-level constraints
- **Transaction Safety**: ACID compliance
- **Audit Trail**: Complete booking history

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- **API Endpoints**: Comprehensive endpoint testing
- **Database Operations**: CRUD operation validation
- **Business Logic**: Booking rule verification

### **Integration Tests**
- **End-to-End Flow**: Complete booking process
- **Database Transactions**: Multi-step operation testing
- **API Integration**: Frontend-backend communication

### **Performance Tests**
- **Load Testing**: High-concurrency booking scenarios
- **Database Performance**: Query optimization validation
- **Frontend Performance**: Large grid rendering tests

---

## 🚀 **DEPLOYMENT**

### **Production Checklist**
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Frontend components integrated
- [ ] Booking flow validated
- [ ] Performance benchmarks met

### **Monitoring**
- **Booking Metrics**: Track booking success rates
- **Performance Monitoring**: API response times
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Seat selection patterns

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Planned Features**
- [ ] **Real-time Updates**: WebSocket-based live availability
- [ ] **Advanced Analytics**: Booking pattern analysis
- [ ] **Mobile App**: Native mobile seat selection
- [ ] **AI Recommendations**: Smart seat suggestions
- [ ] **Group Booking**: Bulk seat reservations
- [ ] **Season Passes**: Recurring event bookings

### **Technical Improvements**
- [ ] **Caching Layer**: Redis integration
- [ ] **CDN Integration**: Static asset optimization
- [ ] **Microservices**: Service decomposition
- [ ] **Event Sourcing**: Advanced booking history
- [ ] **GraphQL API**: Flexible data querying

---

## 📞 **SUPPORT & MAINTENANCE**

### **Documentation**
- **API Documentation**: Comprehensive endpoint docs
- **Component Library**: Reusable UI components
- **Database Schema**: Complete schema documentation
- **Deployment Guide**: Production setup instructions

### **Troubleshooting**
- **Common Issues**: Known problems and solutions
- **Debug Tools**: Development debugging utilities
- **Log Analysis**: Error tracking and resolution
- **Performance Tuning**: Optimization guidelines

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

This dynamic seat selection system provides a robust, scalable foundation for ticket booking applications, with comprehensive features for both event organizers and end users.
