'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type LBEntry = {
  rank: number;
  username: string;
  streakDays: number;
  sessions: number;
  totalHours: number;
};

export function Leaderboard() {
  const [data, setData] = useState<LBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard?limit=10')
      .then((r) => r.json())
      .then((d) => {
        setData(d.leaderboard || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Leaderboard error:', e);
        setError('Failed to load');
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="leaderboard-loading">
        <div className="spinner" />
      </div>
    );

  if (error)
    return (
      <div className="leaderboard-error">
        <span>{error}</span>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="leaderboard-container"
    >
      <div className="leaderboard-header">
        <div className="header-badge">🏆</div>
        <h3 className="leaderboard-title">Global Rankings</h3>
        <div className="online-dot" />
      </div>

      <div className="leaderboard-list">
        {data.length > 0 ? (
          data.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="leaderboard-entry"
            >
              <div className="entry-rank">
                <span className="rank-badge">#{entry.rank}</span>
              </div>

              <div className="entry-info">
                <div className="username">{entry.username}</div>
              </div>

              <div className="entry-stats">
                <div className="stat-pill">
                  <span className="stat-icon">🔥</span>
                  <span className="stat-value">{entry.streakDays}d</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-value">{entry.sessions}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-data">No leaderboard data yet</div>
        )}
      </div>

      <style>{`
        .leaderboard-container {
          width: 100%;
          max-width: 380px;
          padding: 1.5rem;
          background: linear-gradient(135deg,
            rgba(10, 20, 50, 0.6) 0%,
            rgba(30, 40, 70, 0.4) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(56, 189, 248, 0.15);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(56, 189, 248, 0.15);
        }

        .header-badge {
          font-size: 1.4rem;
        }

        .leaderboard-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          letter-spacing: 0.5px;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          margin-left: auto;
          animation: pulse 2s infinite;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          transition: all 200ms ease;
        }

        .leaderboard-entry:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }

        .entry-rank {
          min-width: 50px;
        }

        .rank-badge {
          font-size: 0.75rem;
          font-weight: 800;
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-family: 'Monaco', monospace;
        }

        .entry-info {
          flex: 1;
          min-width: 0;
        }

        .username {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .entry-stats {
          display: flex;
          gap: 0.8rem;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          padding: 0.3rem 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        }

        .stat-icon {
          font-size: 0.85rem;
        }

        .stat-value {
          font-weight: 700;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Monaco', monospace;
        }

        .no-data {
          text-align: center;
          padding: 2rem 1rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .leaderboard-loading,
        .leaderboard-error {
          padding: 1.5rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 1rem auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </motion.div>
  );
}
