'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Share2, Menu } from 'lucide-react';
import { useVibeStore } from '@/lib/store';
import { VibeOrb } from '@/components/VibeOrb';
import { VibeSound } from '@/components/VibeSound';
import { useScramble } from '@/hooks/useScramble';
import { ToolsPanel } from '@/components/Tools';
import { TimerOverlay } from '@/components/TimerOverlay';
import { BreathOverlay } from '@/components/BreathOverlay';
import { AnalogNoiseOverlay } from '@/components/AnalogNoiseOverlay';
import { VibeHistoryPanel } from '@/components/VibeHistoryPanel';
import NoSleep from 'nosleep.js';
import { Target, Bug, Code2, Rocket, Coffee, Moon, BookOpen, Zap } from 'lucide-react';

function DecryptText({ text, className }: { text: string; className?: string }) {
  const scrambled = useScramble(text, 40);
  return <p className={className}>{scrambled}</p>;
}

const PRESETS = [
  { id: 'deep-work', label: 'Deep Work', icon: Target, color: '#38bdf8', duration: '60m' },
  { id: 'standup', label: 'Standup', icon: Coffee, color: '#10b981', duration: '15m' },
  { id: 'bug-hunt', label: 'Bug Hunt', icon: Bug, color: '#ef4444', duration: '45m' },
  { id: 'code-review', label: 'Code Review', icon: Code2, color: '#0ea5e9', duration: '30m' },
  { id: 'ship-mode', label: 'Ship Mode', icon: Rocket, color: '#fbbf24', duration: '60m' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: '#84cc16', duration: '50m' },
  { id: 'rest', label: 'Sleep Recovery', icon: Moon, color: '#8b5cf6', duration: '20m' },
  { id: 'calm', label: 'Calm Protocol', icon: Zap, color: '#38bdf8', duration: 'instant' },
];

export default function Home() {
  const [input, setInput] = useState('');
  const [presetsOpen, setPresetsOpen] = useState(false);
  const store = useVibeStore();
  const router = useRouter();
  const noSleepRef = useRef<NoSleep | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    noSleepRef.current = new NoSleep();
  }, []);

  useEffect(() => {
    store.loadMetricsFromLocalStorage();
  }, [store]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;

    let bg = store.currentVibe.colors.bg;
    let accent = store.currentVibe.colors.accent;

    if (store.themeMode === 'auto') {
      if (isNight) {
        bg = '#020108';
        accent = '#f97316';
      } else {
        bg = '#020617';
        accent = '#38bdf8';
      }
    } else if (store.themeMode === 'day') {
      bg = '#020617';
      accent = '#38bdf8';
    } else if (store.themeMode === 'night') {
      bg = '#020108';
      accent = '#f97316';
    }

    document.documentElement.style.setProperty('--bg-color', bg);
    document.documentElement.style.setProperty('--accent-color', accent);
  }, [store.currentVibe.colors.bg, store.currentVibe.colors.accent, store.themeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ns = noSleepRef.current;
    if (!ns) return;

    const shouldLock = store.timer.active;
    if (shouldLock) {
      try {
        ns.enable();
      } catch (e) {
        console.warn('Wake lock failed', e);
      }
    } else {
      try {
        ns.disable();
      } catch {}
    }
  }, [store.timer.active]);

  useEffect(() => {
    if (!store.keySoundsEnabled || typeof window === 'undefined') return;
    let audioCtx: AudioContext | null = null;

    const handler = (e: KeyboardEvent) => {
      if (!audioCtx) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AC();
      }
      const ctx = audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 400 + (e.key.length % 5) * 80;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (audioCtx) audioCtx.close();
    };
  }, [store.keySoundsEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && store.isImmersive) {
        store.toggleImmersive();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store.isImmersive, store.toggleImmersive]);

  useEffect(() => {
    if (
      !store.timer.active &&
      store.timer.duration > 0 &&
      store.timer.timeLeft === 0
    ) {
      store.markSessionComplete();
    }
  }, [
    store.timer.active,
    store.timer.duration,
    store.timer.timeLeft,
    store.markSessionComplete,
  ]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    store.setThinking(true);

    try {
      const response = await fetch('/api/vibe-check', {
        method: 'POST',
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      store.setVibe(data.object);
      store.addToHistory(input, data.object.name);
    } catch (err) {
      console.error('Link Failure:', err);
    }

    store.setThinking(false);
    setInput('');
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(store.currentVibe);
      const encoded = btoa(json);
      const url = `${window.location.origin}/v?state=${encodeURIComponent(
        encoded
      )}`;
      await navigator.clipboard.writeText(url);
      console.log('Vibe URL copied:', url);
    } catch (e) {
      console.error('Failed to share vibe', e);
    }
  };

  const handlePresetClick = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      const action = {
        'deep-work': () => store.applyDeepWorkPreset(),
        'standup': () => store.applyPresetStandup(),
        'bug-hunt': () => store.applyPresetBugHunt(),
        'code-review': () => store.applyPresetCodeReview(),
        'ship-mode': () => store.applyPresetShipMode(),
        'learning': () => store.applyPresetLearning(),
        'rest': () => store.applyPresetSleepRecovery(),
        'calm': () => store.triggerCalmProtocol(),
      }[presetId];
      
      if (action) {
        action();
        setPresetsOpen(false);
      }
    }
  };

  const isHighStress = (store.currentVibe.stressLevel ?? 0) > 80;

  return (
    <main className={`vibe-wrapper ${store.isImmersive ? 'immersive-active' : ''}`}>
      <div className="scanlines" />
      {store.featureFlags.analogNoise && <AnalogNoiseOverlay />}

      <div className="canvas-layer">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <VibeOrb />
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      <div className="ui-layer">
        {/* Top: Header with Title and Share Button */}
        <header className="interactive" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="header-panel">
            <div className="title">
              VIBE_OS // KERNEL_ACTIVE
              {store.streakDays > 0 && (
                <span className="streak-pill">
                  STREAK: {store.streakDays} DAY
                  {store.streakDays > 1 ? 'S' : ''}
                </span>
              )}
            </div>
            <div
              className="mood-text"
              style={{ color: store.currentVibe.colors.accent }}
            >
              {store.currentVibe.name}
            </div>
          </div>

        <div
  style={{
    position: 'fixed',
    top: '1.25rem',
    left: '1.5rem',        // ← Changed from right to LEFT
    zIndex: 80,
  }}
>
  <button
    onClick={handleShare}
    className="share-btn interactive"
  >
    <Share2 size={14} />
    <span>Share Vibe</span>
  </button>
</div>


        </header>

        {/* Center: Main Message and 3D Orb */}
        <section
          className={`center-message ${isHighStress ? 'glitch-mode' : ''}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={store.currentVibe.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {store.isThinking ? (
                <p
                  className="ai-text"
                  style={{ fontSize: '1rem', opacity: 0.5 }}
                >
                  ESTABLISHING NEURAL LINK...
                </p>
              ) : (
                <>
                  <DecryptText
                    text={`"${store.currentVibe.message}"`}
                    className="ai-text"
                  />
                  {(store.currentVibe as any).suggestedRitual && (
                    <div
                      className="ritual-box interactive"
                      style={{
                        borderColor: store.currentVibe.colors.accent,
                      }}
                    >
                      <small style={{ opacity: 0.5 }}>
                        SUGGESTED PROTOCOL
                      </small>
                      <p>{(store.currentVibe as any).suggestedRitual}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Bottom: Input Field */}
        <footer className="input-container interactive">
          <form onSubmit={handleCommand}>
            <input
              type="text"
              className="vibe-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                store.isThinking ? 'PROCESSING...' : 'Input cognitive state...'
              }
              disabled={store.isThinking}
              autoFocus
            />
          </form>
        </footer>

        {/* PRESET TOGGLE BUTTON - TOP RIGHT */}
        <button
          onClick={() => setPresetsOpen(!presetsOpen)}
          className="interactive"
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '8px',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms ease',
            zIndex: 60,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Menu size={20} />
        </button>

        {/* SMOOTH SLIDE-OUT VERTICAL PRESET PANEL */}
        <AnimatePresence>
          {presetsOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                right: 0,
                top: 0,
                height: '100vh',
                width: '280px',
                background: 'linear-gradient(135deg, rgba(10, 15, 35, 0.95) 0%, rgba(20, 25, 50, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '20px 0 0 20px',
                padding: '2rem 1.5rem',
                zIndex: 80,
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 700,
                }}>
                  ⚡ Presets
                </div>
              </div>

              {/* Vertical Preset List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', maxHeight: '85vh' }}>
                {PRESETS.map((preset, idx) => {
                  const Icon = preset.icon;
                  const isActive = store.currentVibe.name === preset.label;
                  
                  return (
                    <motion.button
                      key={preset.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handlePresetClick(preset.id)}
                      style={{
                        padding: '1rem',
                        background: isActive 
                          ? `linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.05) 100%)`
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isActive ? `1.5px solid ${preset.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        transition: 'all 200ms ease',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        fontWeight: isActive ? 700 : 600,
                        boxShadow: isActive ? `0 0 20px ${preset.color}40` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = preset.color;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <Icon size={18} style={{ color: preset.color, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{preset.label}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>⏱️ {preset.duration}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Left: Tools Panel */}
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '1.5rem',
          zIndex: 50,
          pointerEvents: 'auto',
        }}>
          <ToolsPanel />
        </div>

      {store.featureFlags.historyPanel && (
  <div
    style={{
      position: 'fixed',
      top: '50%',           // vertical center
      left: '1.5rem',       // left edge
      transform: 'translateY(-50%)',
      maxWidth: '260px',
      zIndex: 40,
      pointerEvents: 'auto',
    }}
  >
    <VibeHistoryPanel />
  </div>
)}


 
      </div>

      {store.featureFlags.breathOverlay && <BreathOverlay />}
      <TimerOverlay />
      <VibeSound />
    </main>
  );
}