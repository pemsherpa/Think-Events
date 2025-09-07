# 📊 Excel Integration Guide

This guide explains how to use the Excel integration features for managing events in the Think-Events application.

## 🚀 Features Implemented

### ✅ Completed Features
1. **Calendar in Navbar** - Added calendar button to top right of navbar
2. **Booked Events Highlighting** - Events with bookings are highlighted in red on calendar
3. **Welcome Section Removal** - Removed welcome text from navbar
4. **Expired Events** - Past events are marked as expired and appear dull/grayed out
5. **Excel Import System** - Complete system to import events from Excel files
6. **Dynamic Excel Sync** - Real-time synchronization when Excel file is modified

---

## 📅 Calendar Features

### Calendar Button Location
- **Position**: Top right of navbar, next to profile button
- **Icon**: Calendar icon with "Calendar" text (hidden on mobile)
- **Functionality**: Opens modal showing user's booked events

### Booked Events Display
- **Red Highlighting**: Dates with booked events show red dots
- **Event Details**: Click on dates to see event information
- **Status Indicators**: 
  - 🟢 Green: Confirmed bookings
  - 🟡 Yellow: Pending bookings
  - 🔴 Red: Cancelled bookings

### Calendar Modal Features
- **Monthly View**: Navigate between months
- **Event List**: Shows upcoming booked events
- **Click Navigation**: Click events to go to event details
- **Responsive Design**: Works on all screen sizes

---

## ⏰ Expired Events

### Visual Indicators
- **Opacity**: Expired events appear at 60% opacity
- **Grayscale**: Images are converted to grayscale
- **Button State**: "Book Now" button becomes "Expired" and disabled
- **Status Badge**: Shows "Expired" instead of availability status

### Expiration Logic
- **Date Comparison**: Events are expired if start_date < today
- **Time Consideration**: Uses date only (ignores time for expiration)
- **Automatic Detection**: No manual intervention required

---

## 📊 Excel Integration

### Supported Excel Formats
- **File Types**: `.xlsx`, `.xls`
- **Sheet**: Uses first sheet in workbook
- **Headers**: First row should contain column headers

### Expected Column Names
The system looks for these column names (case-insensitive):

| Column Name | Description | Required | Default |
|-------------|-------------|----------|---------|
| `Event Title` / `Title` / `title` | Event name | Yes | "Event {number}" |
| `Description` / `description` | Event description | No | "Event description" |
| `Category` / `category` | Event category | No | "General" |
| `Venue` / `venue` | Venue name | No | "TBD" |
| `City` / `city` | Venue city | No | "Kathmandu" |
| `Address` / `address` | Venue address | No | "" |
| `Start Date` / `start_date` / `StartDate` | Event start date | Yes | Today |
| `End Date` / `end_date` / `EndDate` | Event end date | No | Same as start date |
| `Start Time` / `start_time` / `StartTime` | Event start time | No | "18:00" |
| `End Time` / `end_time` / `EndTime` | Event end time | No | "22:00" |
| `Price` / `price` | Ticket price | No | 0 |
| `Currency` / `currency` | Currency code | No | "NPR" |
| `Total Seats` / `total_seats` / `TotalSeats` | Total capacity | No | 100 |
| `Image URL` / `image_url` / `ImageUrl` | Event image URL | No | null |
| `Organizer` / `organizer` | Organizer name | No | "Event Organizer" |
| `Tags` / `tags` | Comma-separated tags | No | null |

### Date Format Support
- **Excel Dates**: Automatically converted to ISO format
- **Text Dates**: Parsed using JavaScript Date constructor
- **Fallback**: Invalid dates default to today's date

---

## 🛠️ Usage Instructions

### 1. Manual Excel Import

```bash
# Navigate to backend directory
cd Think-Events/backend

# Run manual import
npm run excel:import

# Or specify custom Excel file path
npm run excel:import "C:\path\to\your\events.xlsx"
```

### 2. Dynamic Excel Sync Service

```bash
# Start the sync service (watches for file changes)
npm run excel:sync "C:\path\to\your\events.xlsx"
```

### 3. API Endpoints

All Excel sync endpoints require authentication:

```bash
# Manual sync via API
POST /api/excel/sync
Authorization: Bearer <your-jwt-token>

# Get sync status
GET /api/excel/status
Authorization: Bearer <your-jwt-token>

# Start watching Excel file
POST /api/excel/watch/start
Authorization: Bearer <your-jwt-token>

# Stop watching Excel file
POST /api/excel/watch/stop
Authorization: Bearer <your-jwt-token>
```

### 4. Automatic Sync on Server Start

The server automatically starts Excel sync if:
- Excel file path is provided in `EXCEL_FILE_PATH` environment variable
- Or default path exists: `C:\Users\ALEX\thinkevebn\Think-Events\event list .xlsx`

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# Excel file path for automatic sync
EXCEL_FILE_PATH=C:\Users\ALEX\thinkevebn\Think-Events\event list .xlsx
```

### Server Integration

The Excel sync service is automatically initialized when the server starts:

```javascript
// In server.js
const excelFilePath = process.env.EXCEL_FILE_PATH || 'C:\\Users\\ALEX\\thinkevebn\\Think-Events\\event list .xlsx';
if (excelFilePath && fs.existsSync(excelFilePath)) {
  const syncService = initializeSyncService(excelFilePath);
  syncService.startWatching();
}
```

---

## 📋 Database Operations

### What Gets Cleared
When importing from Excel, the following tables are cleared:
1. `bookings` (to avoid foreign key conflicts)
2. `created_events`
3. `events`

### What Gets Created
- **Categories**: Auto-created if they don't exist
- **Venues**: Auto-created if they don't exist
- **Organizers**: Auto-created as users if they don't exist
- **Events**: Inserted into both `events` and `created_events` tables

### Data Validation
- **Required Fields**: Title and start date
- **Type Conversion**: Automatic conversion for numbers and dates
- **Error Handling**: Individual row errors don't stop the entire import

---

## 🚨 Important Notes

### File Watching
- **Stability Threshold**: 2 seconds (prevents multiple syncs during save)
- **Poll Interval**: 100ms
- **File Lock**: Waits for file to be released before reading

### Performance
- **Batch Processing**: All events processed in single transaction
- **Memory Efficient**: Processes one row at a time
- **Error Recovery**: Continues processing even if individual rows fail

### Security
- **Authentication Required**: All API endpoints require valid JWT
- **File Path Validation**: Checks file existence before processing
- **Input Sanitization**: All data is validated and sanitized

---

## 🐛 Troubleshooting

### Common Issues

1. **Excel file not found**
   ```
   ⚠️  Excel file not found, Excel sync service not started
   ```
   - Check file path in environment variable
   - Ensure file exists and is accessible

2. **Permission errors**
   ```
   ❌ Error reading Excel file: EACCES
   ```
   - Check file permissions
   - Ensure file is not open in Excel

3. **Date parsing errors**
   ```
   ❌ Error importing row X: Invalid date
   ```
   - Check date format in Excel
   - Use standard date formats (YYYY-MM-DD)

4. **Database connection errors**
   ```
   ❌ Error clearing existing events: connection refused
   ```
   - Check database connection
   - Ensure database is running

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] Excel template download
- [ ] Bulk event updates (not just full replacement)
- [ ] Event validation before import
- [ ] Import history and rollback
- [ ] Multiple Excel file support
- [ ] Real-time collaboration features

### API Improvements
- [ ] WebSocket notifications for sync status
- [ ] Progress tracking for large imports
- [ ] Import preview before execution
- [ ] Conflict resolution for duplicate events

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Ensure all dependencies are installed: `npm install`
4. Verify database connection and permissions

---

**Last Updated**: December 2024
**Version**: 1.0.0
