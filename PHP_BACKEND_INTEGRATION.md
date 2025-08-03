# PHP Backend Integration for Fifteen Puzzle

## Overview

This project now includes a complete PHP backend to replace the Supabase functionality. The backend provides RESTful API endpoints for user management and game statistics.

## Architecture

```
Frontend (React) ←→ PHP API ←→ PostgreSQL Database
```

## Backend Structure

### 1. Configuration (`backend/config/`)
- `database.php` - Database connection configuration

### 2. Models (`backend/models/`)
- `User.php` - User operations (CRUD, sound settings)
- `GameStats.php` - Game statistics operations

### 3. API Endpoints (`backend/api/`)
- `user.php` - User management endpoints
- `game_stats.php` - Game statistics endpoints
- `stats.php` - User statistics endpoints

### 4. Frontend Service (`src/services/phpApi.js`)
- JavaScript service to communicate with PHP backend
- Replaces Supabase client functionality

## Setup Instructions

### 1. Database Setup
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the setup script
\i backend/setup_database.sql
```

### 2. PHP Configuration
Edit `backend/config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'your_database_name';
private $username = 'your_username';
private $password = 'your_password';
```

### 3. Web Server Configuration
Ensure your web server can access the backend directory:
```
http://localhost/fifteen-puzzle/backend/api/
```

### 4. Frontend Configuration
Update the API base URL in `src/services/phpApi.js`:
```javascript
const API_BASE_URL = 'http://localhost/fifteen-puzzle/backend/api';
```

## API Endpoints

### User Management
- `GET /api/user.php?id={user_id}` - Get user by ID
- `GET /api/user.php?email={email}` - Get user by email
- `POST /api/user.php` - Create or get user
- `PUT /api/user.php` - Update user sound setting

### Game Statistics
- `POST /api/game_stats.php` - Save game statistics
- `GET /api/game_stats.php?user_id={user_id}` - Get user's game stats
- `GET /api/game_stats.php?user_id={user_id}&puzzle_type={type}` - Get stats by puzzle type

### User Statistics
- `GET /api/stats.php?user_id={user_id}` - Get user statistics
- `GET /api/stats.php?user_id={user_id}&puzzle_type={type}` - Get stats for specific puzzle type

## Frontend Integration

The React frontend now uses the PHP backend instead of Supabase:

### Before (Supabase)
```javascript
import { supabase } from './supabaseClient'
const { data, error } = await supabase.from('game_stats').insert(gameStatsData)
```

### After (PHP Backend)
```javascript
import phpApiService from './services/phpApi'
const result = await phpApiService.saveGameStats(gameStatsData)
```

## Migration from Supabase

To migrate from Supabase to PHP backend:

1. **Update Sound Context:**
   ```javascript
   // Replace Supabase calls with PHP API calls
   const user = await phpApiService.createOrGetUser(email)
   await phpApiService.updateUserSoundSetting(user.id, soundEnabled)
   ```

2. **Update Game Stats Saving:**
   ```javascript
   // Replace Supabase calls with PHP API calls
   await phpApiService.saveGameStats({
     user_id: user.id,
     puzzle_type: puzzleType,
     time_taken_seconds: finalTimeSeconds,
     moves_count: finalMoveCount,
     background_image_id: backgroundImageId
   })
   ```

3. **Update User Management:**
   ```javascript
   // Replace Supabase auth with PHP user management
   const user = await phpApiService.createOrGetUser(email)
   ```

## Benefits of PHP Backend

1. **Full Control** - Complete control over database and API logic
2. **Customization** - Easy to add new features and endpoints
3. **Performance** - Direct database access without external service overhead
4. **Cost** - No external service costs
5. **Security** - Data stays on your own server

## Testing

Test the API endpoints:

```bash
# Test user creation
curl -X POST http://localhost/fifteen-puzzle/backend/api/user.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test game stats
curl -X POST http://localhost/fifteen-puzzle/backend/api/game_stats.php \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-uuid","puzzle_type":"numbers","time_taken_seconds":120,"moves_count":50}'
```

## Error Handling

The PHP backend includes comprehensive error handling:
- Database connection errors
- Invalid input validation
- Proper HTTP status codes
- JSON error responses

## Security Features

- CORS configuration for cross-origin requests
- SQL injection prevention with prepared statements
- Input validation and sanitization
- Security headers in .htaccess 