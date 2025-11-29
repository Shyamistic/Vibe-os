import { NextRequest, NextResponse } from 'next/server';

// Mock leaderboard data for MVP
const MOCK_LEADERBOARD = [
  { rank: 1, username: 'DevFlow', streakDays: 47, sessions: 156, totalHours: 234 },
  { rank: 2, username: 'CodeZen', streakDays: 42, sessions: 142, totalHours: 210 },
  { rank: 3, username: 'FocusMaster', streakDays: 38, sessions: 128, totalHours: 192 },
  { rank: 4, username: 'VibeCoder', streakDays: 35, sessions: 118, totalHours: 177 },
  { rank: 5, username: 'DeepWork', streakDays: 31, sessions: 104, totalHours: 156 },
  { rank: 6, username: 'FlowState', streakDays: 28, sessions: 95, totalHours: 142 },
  { rank: 7, username: 'ShipIt', streakDays: 24, sessions: 82, totalHours: 123 },
  { rank: 8, username: 'BugSlayer', streakDays: 21, sessions: 72, totalHours: 108 },
  { rank: 9, username: 'Learner', streakDays: 18, sessions: 62, totalHours: 93 },
  { rank: 10, username: 'Focused', streakDays: 15, sessions: 52, totalHours: 78 },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const leaderboard = MOCK_LEADERBOARD.slice(0, Math.min(limit, 10));

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}