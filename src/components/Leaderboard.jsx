import React, { useState, useEffect } from 'react';
import phpApiService from '../services/phpApi';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPuzzleType, setSelectedPuzzleType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const puzzleTypes = [
    { value: 'all', label: 'All Puzzles' },
    { value: 'numbers', label: 'Numbers' },
    { value: '15-puzzle', label: '15-Puzzle' },
    { value: 'penguin', label: 'Penguin' },
    { value: 'cow', label: 'Cow' },
    { value: 'duck', label: 'Duck' },
    { value: 'bg', label: 'Background Images' }
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    filterData();
  }, [leaderboardData, selectedPuzzleType]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const data = await phpApiService.getLeaderboard();
      
      // Process data to get best times for each user per puzzle type
      const processedData = processLeaderboardData(data);
      setLeaderboardData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const processLeaderboardData = (data) => {
    // Group by user and puzzle type, get best time for each
    const userPuzzleMap = {};
    
    data.forEach(stat => {
      const key = `${stat.user_id}-${stat.puzzle_type}`;
      if (!userPuzzleMap[key] || stat.time_taken_seconds < userPuzzleMap[key].time_taken_seconds) {
        userPuzzleMap[key] = stat;
      }
    });

    // Convert to array and sort by time
    const processedData = Object.values(userPuzzleMap)
      .sort((a, b) => a.time_taken_seconds - b.time_taken_seconds)
      .map((stat, index) => ({
        ...stat,
        rank: index + 1,
        username: stat.users?.username || 'Unknown User'
      }));

    return processedData;
  };

  const filterData = () => {
    if (selectedPuzzleType === 'all') {
      setFilteredData(leaderboardData);
    } else {
      const filtered = leaderboardData.filter(stat => stat.puzzle_type === selectedPuzzleType);
      // Re-rank filtered data
      const reRanked = filtered.map((stat, index) => ({
        ...stat,
        rank: index + 1
      }));
      setFilteredData(reRanked);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPuzzleTypeLabel = (type) => {
    const puzzleType = puzzleTypes.find(pt => pt.value === type);
    return puzzleType ? puzzleType.label : type;
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-message">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchLeaderboardData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      
      <div className="filter-section">
        <label htmlFor="puzzle-filter" className="filter-label">
          Filter by Puzzle Type:
        </label>
        <select
          id="puzzle-filter"
          value={selectedPuzzleType}
          onChange={(e) => setSelectedPuzzleType(e.target.value)}
          className="puzzle-filter"
        >
          {puzzleTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {filteredData.length === 0 ? (
        <div className="no-data-message">
          No data available for the selected puzzle type.
        </div>
      ) : (
        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Puzzle Type</th>
                <th>Best Time</th>
                <th>Moves</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((stat) => (
                <tr key={`${stat.user_id}-${stat.puzzle_type}-${stat.stat_id}`}>
                  <td className="rank-cell">{stat.rank}</td>
                  <td className="user-cell">{stat.username}</td>
                  <td className="puzzle-cell">{getPuzzleTypeLabel(stat.puzzle_type)}</td>
                  <td className="time-cell">{formatTime(stat.time_taken_seconds)}</td>
                  <td className="moves-cell">{stat.moves_count}</td>
                  <td className="date-cell">{formatDate(stat.game_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 