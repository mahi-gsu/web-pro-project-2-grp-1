// PHP Backend API Service
const API_BASE_URL = 'http://localhost:8000/api';

class PhpApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // User operations
    async getUserById(id) {
        return this.apiCall(`user.php?id=${id}`, { method: 'GET' });
    }

    async getUserByEmail(email) {
        return this.apiCall(`user.php?email=${encodeURIComponent(email)}`, { method: 'GET' });
    }

    async createOrGetUser(email) {
        return this.apiCall('user.php', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async updateUserSoundSetting(id, soundSetting) {
        return this.apiCall('user.php', {
            method: 'PUT',
            body: JSON.stringify({ id, sound_setting: soundSetting }),
        });
    }

    // Game stats operations
    async saveGameStats(gameStats) {
        return this.apiCall('game_stats.php', {
            method: 'POST',
            body: JSON.stringify(gameStats),
        });
    }

    async getGameStats(userId, puzzleType = null, limit = 50) {
        let url = `game_stats.php?user_id=${userId}&limit=${limit}`;
        if (puzzleType) {
            url += `&puzzle_type=${puzzleType}`;
        }
        return this.apiCall(url, { method: 'GET' });
    }

    // User statistics
    async getUserStats(userId, puzzleType = null) {
        let url = `stats.php?user_id=${userId}`;
        if (puzzleType) {
            url += `&puzzle_type=${puzzleType}`;
        }
        return this.apiCall(url, { method: 'GET' });
    }

    // Leaderboard
    async getLeaderboard(puzzleType = null) {
        let url = 'leaderboard.php';
        if (puzzleType) {
            url += `?puzzle_type=${encodeURIComponent(puzzleType)}`;
        }
        return this.apiCall(url, { method: 'GET' });
    }

    // Check if PHP backend is available
    async isAvailable() {
        try {
            await this.apiCall('user.php', { method: 'GET' });
            return true;
        } catch (error) {
            console.log('PHP backend not available:', error);
            return false;
        }
    }
}

// Create singleton instance
const phpApiService = new PhpApiService();

export default phpApiService; 