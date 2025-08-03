# How to Start the Fifteen Puzzle Application

## Quick Start

1. **Start the PHP Backend:**
   ```bash
   cd backend
   php -S localhost:8000
   ```

2. **Start the React Frontend:**
   ```bash
   npm start
   ```

3. **Open the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## What's Running

- **React Frontend** (port 3000): The main puzzle game interface
- **PHP Backend** (port 8000): API endpoints for user management and game stats
- **Supabase**: Database and authentication (configured via environment variables)

## Features Available

✅ **Puzzle Game**: 15-puzzle with solvable shuffle algorithm  
✅ **Solved Modal**: Chalktastic font, confetti animation, OK button  
✅ **Game Statistics**: Saves moves, time, puzzle type to database  
✅ **Sound Toggle**: Turn sound effects on/off (persisted in database)  
✅ **Auto-Solve**: Visual step-by-step puzzle solving  
✅ **PHP Backend**: REST API for database operations  

## API Endpoints

- `POST /api/user.php` - Create or get user
- `POST /api/game_stats.php` - Save game statistics  
- `GET /api/stats.php` - Get user statistics
- `PUT /api/user.php` - Update user settings

## Troubleshooting

- If PHP backend fails, check that port 8000 is available
- If frontend fails, check that port 3000 is available
- Database operations use Supabase (configured in `.env` files)

## Clean Code Status

✅ Removed all "fake usernames" and mock data  
✅ Clean PHP backend with proper error handling  
✅ Proper database schema integration  
✅ Environment variable usage for credentials 