# Fifteen Puzzle Game

A modern, interactive Fifteen Puzzle game built with React, PHP backend, and Supabase integration. Features a chalk-style design with Chalktastic font and comprehensive game management.

## 🎮 Features

### Core Game Features
- **Multiple Puzzle Types**: Numbers, Penguin, Cow, Duck, and custom background images
- **Solvable Puzzles**: Guaranteed solvable puzzle generation using mathematical algorithms
- **Auto-Solve**: Visual step-by-step puzzle solving with animation
- **Game Statistics**: Track moves, time, and best scores
- **Leaderboard**: Global leaderboard with puzzle type filtering
- **Sound Effects**: Toggleable sound effects with user preference persistence

### User Management
- **Authentication**: Supabase Auth integration with email/password
- **Forgot Password**: Complete password reset flow
- **User Profiles**: Role-based access (Player/Admin)
- **Sound Settings**: Per-user sound preference storage

### Admin Features
- **User Management**: Activate/deactivate users, change roles
- **Background Images**: Upload and manage custom puzzle backgrounds
- **Game Statistics**: View comprehensive game data
- **Admin Dashboard**: Full administrative interface

### Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Chalk-Style UI**: Beautiful chalkboard aesthetic with Chalktastic font
- **PHP Backend**: RESTful API endpoints for all operations
- **Supabase Integration**: Database and authentication
- **Real-time Updates**: Live leaderboard and statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PHP (v8.0 or higher)
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL scripts in the `database/` folder
   - Set up authentication policies
   - Configure storage buckets for background images

5. **Start the development servers**

   **Frontend (React):**
   ```bash
   npm run dev
   ```
   Access at: http://localhost:3000

   **Backend (PHP):**
   ```bash
   cd backend
   php -S localhost:8000
   ```
   Access at: http://localhost:8000

## 📁 Project Structure

```
project/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── lib/               # Utility libraries
│   └── assets/            # Images, fonts, etc.
├── backend/               # PHP backend
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication APIs
│   │   ├── admin/         # Admin APIs
│   │   └── users/         # User management APIs
│   └── config/            # Configuration files
├── database/              # Database schemas and migrations
└── docs/                  # Documentation
```

## 🎯 Game Modes

### 1. Numbers Puzzle
Classic 15-puzzle with numbered tiles (1-15)

### 2. Image Puzzles
- **Penguin**: Cute penguin image puzzle
- **Cow**: Farm animal puzzle
- **Duck**: Waterfowl puzzle

### 3. Custom Backgrounds
Upload and play with custom background images

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/signout` - User logout

### Game Statistics
- `POST /api/game_stats` - Save game statistics
- `GET /api/leaderboard` - Get leaderboard data

### User Management
- `PUT /api/users/sound` - Update sound settings
- `GET /api/admin/users` - Get all users (admin)
- `DELETE /api/admin/users` - Delete user (admin)

### Background Images
- `GET /api/admin/images` - Get all images (admin)
- `POST /api/admin/images` - Upload image (admin)
- `DELETE /api/admin/images` - Delete image (admin)

## 🎨 Styling

The application uses a consistent chalk-style design:
- **Font**: Chalktastic (custom chalk font)
- **Colors**: White, yellow, green, cyan theme
- **Style**: Chalkboard aesthetic with text shadows
- **Responsive**: Mobile-friendly design

## 🚀 Deployment

### Frontend Deployment
The React app can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Railway

### Backend Deployment
The PHP backend can be deployed to:
- Railway
- Heroku
- DigitalOcean
- AWS

### Database
Supabase provides the database and authentication services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the setup guides in the root directory

## 🎯 Roadmap

- [ ] Multiplayer mode
- [ ] Tournament system
- [ ] Achievement system
- [ ] Mobile app
- [ ] Advanced puzzle algorithms
- [ ] Social features

---

**Enjoy playing the Fifteen Puzzle Game! 🧩** 