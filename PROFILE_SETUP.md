# Profile Page Setup Guide

This guide explains how to set up and use the new comprehensive profile page functionality in Think-Events.

## Features

The new profile page includes:

- **Personal Information**: First name, last name, email, phone, date of birth, gender, and address
- **Preferences**: Notification settings, language, and currency preferences
- **My Bookings**: View and manage event bookings
- **Security & Privacy**: Account security settings and privacy controls
- **Profile Summary**: Quick stats and profile overview

## Backend Setup

### 1. Run Database Migration

First, run the profile fields migration to add the new columns to the users table:

```bash
cd backend
npm run migrate:profile
```

This will add the following fields to the users table:
- `date_of_birth` (DATE)
- `gender` (VARCHAR(20))
- `address` (TEXT)
- `city` (VARCHAR(100))
- `state` (VARCHAR(100))
- `zip_code` (VARCHAR(20))
- `preferences` (JSONB)

### 2. Backend Changes

The following backend files have been updated:
- `src/controllers/authController.js` - Enhanced `updateProfile` and `getProfile` methods
- `src/routes/auth.js` - Profile routes are already configured
- `src/database/add_profile_fields.js` - New migration file

## Frontend Setup

### 1. New Components

The following new files have been created:
- `src/pages/Profile.tsx` - Main profile page component
- Updated `src/components/Layout/Header.tsx` - Now shows profile/logout buttons when authenticated
- Updated `src/App.tsx` - Added profile route

### 2. Authentication Flow

- After login/signup, users are redirected to `/profile`
- The header now shows "Profile" and "Logout" buttons instead of "Login" and "Sign Up" when authenticated
- Users can access their profile from the header navigation

## Usage

### 1. Accessing Profile

- Log in to your account
- Click on "Profile" in the header
- You'll be redirected to the comprehensive profile page

### 2. Editing Profile

- Click the "Edit" button in the Personal Information section
- Make your changes
- Click "Save" to update your profile
- Click "Cancel" to discard changes

### 3. Managing Preferences

- Navigate to the "Preferences" tab
- Toggle notification settings
- Select your preferred language and currency
- Changes are saved automatically

### 4. Viewing Bookings

- Navigate to the "My Bookings" tab
- View your event booking history
- See booking status and details

### 5. Security Settings

- Navigate to the "Security" tab
- Configure two-factor authentication
- Manage login notifications
- Control data privacy settings

## API Endpoints

### GET /api/auth/profile
- Returns the current user's profile information
- Requires authentication token

### PUT /api/auth/profile
- Updates the user's profile information
- Requires authentication token
- Accepts: `first_name`, `last_name`, `phone`, `date_of_birth`, `gender`, `address`, `city`, `state`, `zip_code`, `preferences`

## Database Schema

The users table now includes these additional fields:

```sql
ALTER TABLE users 
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(20),
ADD COLUMN address TEXT,
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN zip_code VARCHAR(20),
ADD COLUMN preferences JSONB DEFAULT '{}';
```

## Troubleshooting

### Common Issues

1. **Profile fields not saving**: Ensure the database migration has been run
2. **Authentication errors**: Check that the JWT token is valid and not expired
3. **Missing UI components**: Ensure all shadcn/ui components are properly installed

### Running Migrations

If you encounter database issues:

```bash
cd backend
npm run migrate:profile
```

### Resetting Database

If you need to start fresh:

```bash
cd backend
npm run reset
npm run migrate
npm run migrate:profile
npm run seed
```

## Future Enhancements

Potential improvements for the profile system:
- Profile picture upload functionality
- Social media integration
- Advanced privacy controls
- Activity history and analytics
- Integration with external services
- Multi-language support for profile fields
