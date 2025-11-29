import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json(
        { error: 'No stats provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stats exported',
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to export metrics' },
      { status: 500 }
    );
  }
}