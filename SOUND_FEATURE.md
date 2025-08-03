# Sound Toggle Feature

## Overview
The sound toggle feature allows users to turn sound effects on/off throughout the application. The setting is persisted in the database and works across all puzzle types.

## Features

### 🎵 Sound Toggle Button
- **Location**: Navbar (top-right, before "sign out")
- **Visual**: Speaker icon with "Sound On"/"Sound Off" text
- **Colors**: 
  - Green when sound is ON
  - Red when sound is OFF
- **Mobile**: Shows only icon (no text) on small screens

### 🔄 Persistence
- **Database**: Stored in `users.sound_setting` column
- **Default**: Sound is ON by default for new users
- **Sync**: Setting persists across sessions and devices

### 🎮 Sound Effects
- **Tile Movement**: Plays when tiles are moved/slided
- **Global Control**: Affects all sound effects in the app
- **Instant**: Changes take effect immediately

## Technical Implementation

### Database Schema
```sql
-- Added to users table
ALTER TABLE public.users 
ADD COLUMN sound_setting boolean NOT NULL DEFAULT true;
```

### Components
1. **SoundContext** (`src/contexts/SoundContext.jsx`)
   - Global state management for sound settings
   - Handles database persistence
   - Provides `playSound()` function

2. **SoundToggle** (`src/components/SoundToggle.jsx`)
   - UI component for toggling sound
   - Uses SoundContext for state management
   - Styled with Chalktastic font

3. **Puzzle Component** (`src/components/Puzzle.jsx`)
   - Uses `useSound()` hook
   - Calls `playSound(tileAudioRef)` instead of direct audio play

### Usage Example
```javascript
// In any component
import { useSound } from '../contexts/SoundContext'

const MyComponent = () => {
  const { soundEnabled, playSound } = useSound()
  
  const handleAction = () => {
    // This will only play if sound is enabled
    playSound(audioRef)
  }
}
```

## User Experience

### How It Works
1. **User clicks sound toggle** in navbar
2. **Setting updates** in database (if logged in)
3. **UI updates** immediately (green/red colors)
4. **Sound effects respect** the new setting
5. **Setting persists** across browser sessions

### Demo Mode
- Works without database connection
- Settings stored locally only
- Resets when page is refreshed

## Styling
- **Font**: Chalktastic (consistent with app theme)
- **Colors**: Green for ON, Red for OFF
- **Hover effects**: Scale and color changes
- **Responsive**: Icon-only on mobile devices

## Future Enhancements
- Volume control slider
- Different sound effects for different actions
- Sound preview when toggling
- Background music option 