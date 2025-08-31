'use client';

import { useState, useEffect } from 'react';
import { fetchPosts, generateLeaderboard } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const posts = await fetchPosts();
      const leaderboardData = generateLeaderboard(posts);
      setLeaderboard(leaderboardData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-pink-500 border-r-blue-400 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="shiba-card rounded-xl p-6 text-center">
          <div className="text-pink-500 text-lg font-medium mb-2">Oops! Something went wrong</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">{error}</div>
          <button
            onClick={() => loadLeaderboard()}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-400 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          🌱 Shomato Seeds Leaderboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Top seed collectors from the Shiba community
        </p>
      </div>
      
      <div className="shiba-card rounded-2xl shadow-2xl overflow-hidden">
        <div className="shiba-gradient px-8 py-6 border-b border-white/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              🏆 Champions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ranked by total shomato seeds collected
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Last updated</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            )}
            <button
              onClick={() => loadLeaderboard(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-400 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-medium"
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
        
        <div className="p-2">
          {leaderboard.map((entry, index) => (
            <a
              key={entry.slackId}
              href={entry.gameLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block m-2 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-200 group"
            >
              <div
                className="relative p-6 flex items-center justify-between bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30"
                style={{
                  backgroundImage: entry.thumbnail ? `url(${entry.thumbnail})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'overlay'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-700/70"></div>
                
                <div className="relative flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700' :
                      'bg-gradient-to-br from-pink-400 to-purple-500'
                    }`}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {entry.gameName}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md inline-block">
                      {entry.slackId}
                    </p>
                  </div>
                </div>
                
                <div className="relative text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                    {entry.totalSeeds}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    🌱 seeds
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 group-hover:text-pink-500 transition-colors">
                  ↗
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="px-8 py-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <div className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
              No seeds collected yet!
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Start building games to earn shomato seeds
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <div className="shiba-card rounded-xl p-4 inline-block">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            🔄 Auto-updates every 10 minutes • 💾 Data cached locally
          </div>
        </div>
      </div>
    </div>
  );
}