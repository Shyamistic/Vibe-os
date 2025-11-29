import { NextRequest, NextResponse } from 'next/server';

// Fallback vibes if API call fails
const FALLBACK_VIBES = [
  {
    name: 'Deep Work',
    message: 'Tunnel vision engaged. The world fades away.',
    colors: { bg: '#020617', accent: '#38bdf8' },
    stressLevel: 20,
    suggestedRitual: 'Minimize distractions. 90-minute deep focus sprint.',
  },
  {
    name: 'Standup',
    message: 'Sync with your team. Share progress and blockers.',
    colors: { bg: '#020617', accent: '#10b981' },
    stressLevel: 30,
    suggestedRitual: 'Brief, focused updates. Max 15 minutes.',
  },
  {
    name: 'Bug Hunt',
    message: 'Detective mode. Find the source of chaos.',
    colors: { bg: '#020617', accent: '#ef4444' },
    stressLevel: 70,
    suggestedRitual: 'Isolate. Reproduce. Solve. Celebrate victory.',
  },
  {
    name: 'Code Review',
    message: 'Read code like it\'s prose. Elevate the codebase.',
    colors: { bg: '#020617', accent: '#0ea5e9' },
    stressLevel: 40,
    suggestedRitual: 'Thoughtful feedback. Constructive, not critical.',
  },
  {
    name: 'Ship Mode',
    message: 'Deploy adrenaline. Push the feature live.',
    colors: { bg: '#020617', accent: '#fbbf24' },
    stressLevel: 80,
    suggestedRitual: 'Final checks. Ship with confidence.',
  },
  {
    name: 'Learning',
    message: 'Curiosity mode. Absorb everything.',
    colors: { bg: '#020617', accent: '#84cc16' },
    stressLevel: 10,
    suggestedRitual: 'Take notes. Ask questions. Experiment.',
  },
  {
    name: 'Sleep Recovery',
    message: 'Let your mind drift. Rest is productive.',
    colors: { bg: '#020108', accent: '#8b5cf6' },
    stressLevel: 5,
    suggestedRitual: 'Slow inhale 4s, hold 4s, exhale 8s. Repeat 5 times.',
  },
  {
    name: 'Calm Protocol',
    message: 'Breathing down the system load. Nothing is on fire.',
    colors: { bg: '#020108', accent: '#38bdf8' },
    stressLevel: 15,
    suggestedRitual: 'Slow inhale 4s, hold 4s, exhale 8s. Repeat 5 times.',
  },
];

async function getVibeFromGemini(input: string) {
  try {
    // Try both possible env variable names
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.warn('❌ Gemini API key not found in env');
      return null;
    }

    console.log('Using Gemini API with key:', apiKey.substring(0, 10) + '...');

    const systemPrompt = `You are VIBE_OS, an AI that detects developer flow states and emotional states. 
    
    Analyze the user's input and match it to ONE of these vibes:
    
    1. Deep Work - focused coding state, tunnel vision
    2. Standup - sync meetings, team communication
    3. Bug Hunt - debugging, problem solving, stress
    4. Code Review - reviewing code, thoughtful analysis
    5. Ship Mode - deployment, pushing live, high adrenaline
    6. Learning - studying, curiosity, exploring
    7. Sleep Recovery - tired, need rest, restoration
    8. Calm Protocol - panic, stress, need to calm down
    
    Respond in JSON format with these exact fields:
    {
      "vibe": "Vibe Name",
      "message": "A poetic message about this state (max 15 words)",
      "stressLevel": 0-100,
      "suggestedRitual": "What to do in this state"
    }
    
    Be creative but stay true to developer experiences. Messages should be cyberpunk/tech-noir in tone.`;

    // Try multiple model endpoints
    const modelEndpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    ];

    let lastError = null;
    
    for (const endpoint of modelEndpoints) {
      try {
        console.log('Trying endpoint:', endpoint.split('/models/')[1]?.split(':')[0] || 'unknown');
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser state: "${input}"\n\nRespond with only valid JSON, no markdown formatting.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid response structure');
            continue;
          }

          const content = data.candidates[0].content.parts[0].text;
          console.log('✅ Gemini responded:', content.substring(0, 100));

          // Parse JSON response
          let jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error('Could not parse JSON');
            continue;
          }

          const vibeData = JSON.parse(jsonMatch[0]);
          console.log('Parsed vibe data:', vibeData);

          // Map vibe name to full vibe object with colors
          const vibeMap: Record<string, typeof FALLBACK_VIBES[0]> = {};
          FALLBACK_VIBES.forEach((vibe) => {
            vibeMap[vibe.name] = vibe;
          });

          const matchedVibe = vibeMap[vibeData.vibe];
          
          if (matchedVibe) {
            console.log('✅ Matched vibe:', matchedVibe.name);
            return {
              ...matchedVibe,
              message: vibeData.message,
              stressLevel: vibeData.stressLevel,
              suggestedRitual: vibeData.suggestedRitual,
            };
          }
        } else {
          const errorText = await response.text();
          lastError = errorText;
          console.log('Endpoint failed, trying next...');
        }
      } catch (e) {
        console.log('Endpoint error, trying next...');
        lastError = String(e);
      }
    }

    console.error('All Gemini endpoints failed. Last error:', lastError);
    return null;
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    console.log('Processing vibe check for:', input);

    // Try Gemini first
    const geminiVibe = await getVibeFromGemini(input);
    
    if (geminiVibe) {
      console.log('✅ Using Gemini vibe:', geminiVibe.name);
      return NextResponse.json({
        object: geminiVibe,
        timestamp: new Date().toISOString(),
        source: 'gemini',
      });
    }

    console.log('⚠️ Gemini failed, using fallback keyword matching');

    // Fallback to simple keyword matching
    const lowerInput = input.toLowerCase();
    let selectedVibe = FALLBACK_VIBES[0];

    if (lowerInput.includes('debug') || lowerInput.includes('bug') || lowerInput.includes('fix')) {
      selectedVibe = FALLBACK_VIBES[2]; // Bug Hunt
    } else if (lowerInput.includes('review') || lowerInput.includes('code') || lowerInput.includes('read')) {
      selectedVibe = FALLBACK_VIBES[3]; // Code Review
    } else if (lowerInput.includes('ship') || lowerInput.includes('deploy') || lowerInput.includes('live') || lowerInput.includes('push')) {
      selectedVibe = FALLBACK_VIBES[4]; // Ship Mode
    } else if (lowerInput.includes('learn') || lowerInput.includes('study') || lowerInput.includes('explore') || lowerInput.includes('curious')) {
      selectedVibe = FALLBACK_VIBES[5]; // Learning
    } else if (lowerInput.includes('rest') || lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('exhausted')) {
      selectedVibe = FALLBACK_VIBES[6]; // Sleep Recovery
    } else if (lowerInput.includes('calm') || lowerInput.includes('panic') || lowerInput.includes('stress') || lowerInput.includes('anxiety') || lowerInput.includes('angry') || lowerInput.includes('upset') || lowerInput.includes('mad')) {
      selectedVibe = FALLBACK_VIBES[7]; // Calm Protocol
    } else if (lowerInput.includes('standup') || lowerInput.includes('sync') || lowerInput.includes('meeting') || lowerInput.includes('team')) {
      selectedVibe = FALLBACK_VIBES[1]; // Standup
    } else if (lowerInput.includes('deep') || lowerInput.includes('focus') || lowerInput.includes('work') || lowerInput.includes('ready') || lowerInput.includes('coding')) {
      selectedVibe = FALLBACK_VIBES[0]; // Deep Work
    }

    console.log('Using fallback vibe:', selectedVibe.name);
    return NextResponse.json({
      object: selectedVibe,
      timestamp: new Date().toISOString(),
      source: 'fallback',
    });
  } catch (error) {
    console.error('Vibe check error:', error);
    return NextResponse.json(
      { error: 'Failed to process vibe', details: String(error) },
      { status: 500 }
    );
  }
}