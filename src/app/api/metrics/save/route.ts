import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionData } = await req.json();

    // Save to localStorage (client-side handled by store)
    // Here we just validate and return success
    if (!sessionData) {
      return NextResponse.json(
        { error: 'No session data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session metrics saved',
      data: sessionData,
    });
  } catch (error) {
    console.error('Save metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to save metrics' },
      { status: 500 }
    );
  }
}