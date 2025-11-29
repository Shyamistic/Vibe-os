'use client';
import { useState, useEffect } from 'react';
import { useVibeStore } from '@/lib/store';
import {
  Timer,
  Zap,
  Maximize,
  Music,
  Radio,
  SlidersHorizontal,
  Keyboard,
  Wind,
  ShieldCheck,
  Target,
} from 'lucide-react';

function HintBadge({ text, visible, onDismiss }: { text: string; visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <div className="tool-hint" onClick={onDismiss}>
      {text}
    </div>
  );
}

export function ToolsPanel() {
  const store = useVibeStore();
  const [dumpText, setDumpText] = useState('');
  const [isVanishing, setIsVanishing] = useState(false);

  useEffect(() => {
    if (!dumpText) return;
    const timeout = setTimeout(() => {
      setIsVanishing(true);
      setTimeout(() => {
        setDumpText('');
        setIsVanishing(false);
      }, 1000);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [dumpText]);

  const hints = store.toolHints;

  return (
    <div className="tools-panel interactive">
      <div className="tools-row">
        <div className="tool-with-hint">
          <button
            onClick={store.applyDeepWorkPreset}
            className="tool-btn active"
            title="Deep Work Now"
          >
            <Target size={16} />
          </button>
          <HintBadge
            text="One click deep work preset"
            visible={false}
            onDismiss={() => {}}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={() =>
              store.timer.active ? store.stopTimer() : store.startTimer(25)
            }
            className={`tool-btn ${store.timer.active ? 'active' : ''}`}
            title="Focus Timer (25m)"
          >
            <Timer size={16} />
          </button>
          <HintBadge
            text="Start 25m focus block"
            visible={hints.timer}
            onDismiss={() => store.dismissToolHint('timer')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.toggleMusic}
            className={`tool-btn ${store.isMusicActive ? 'active-green' : ''}`}
            title="Music Pulse Sync"
          >
            <Music size={16} />
          </button>
          <HintBadge
            text="Add heartbeat to the orb"
            visible={hints.music}
            onDismiss={() => store.dismissToolHint('music')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.toggleImmersive}
            className="tool-btn"
            title="Immersive Mode"
          >
            <Maximize size={16} />
          </button>
          <HintBadge
            text="Hide UI. Move mouse down or press Esc to exit."
            visible={hints.immersive}
            onDismiss={() => store.dismissToolHint('immersive')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.toggleBinaural}
            className={`tool-btn ${store.isBinauralEnabled ? 'active' : ''}`}
            title="Binaural Engine"
          >
            <Radio size={16} />
          </button>
          <HintBadge
            text="Layer focus/sleep brainwaves"
            visible={hints.binaural}
            onDismiss={() => store.dismissToolHint('binaural')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.toggleKeySounds}
            className={`tool-btn ${store.keySoundsEnabled ? 'active' : ''}`}
            title="Typewriter key sounds"
          >
            <Keyboard size={16} />
          </button>
          <HintBadge
            text="Mechanical key clicks as you type"
            visible={hints.keys}
            onDismiss={() => store.dismissToolHint('keys')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.toggleBreathMode}
            className={`tool-btn ${store.breathModeActive ? 'active' : ''}`}
            title="Breath Mode Overlay"
          >
            <Wind size={16} />
          </button>
          <HintBadge
            text="Guided 4–7–8 breathing ring"
            visible={hints.breath}
            onDismiss={() => store.dismissToolHint('breath')}
          />
        </div>

        <div className="tool-with-hint">
          <button
            onClick={store.triggerCalmProtocol}
            className="tool-btn active-green"
            title="Instant Calm Protocol"
          >
            <ShieldCheck size={16} />
          </button>
          <HintBadge
            text="Panic button → calm vibe"
            visible={hints.calm}
            onDismiss={() => store.dismissToolHint('calm')}
          />
        </div>
      </div>

      <div className="brain-dump-container">
        <input
          type="text"
          value={dumpText}
          onChange={(e) => {
            setDumpText(e.target.value);
            setIsVanishing(false);
          }}
          placeholder="Brain dump..."
          className={`brain-dump-input ${isVanishing ? 'vanishing' : ''}`}
        />
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            opacity: 0.5,
          }}
        >
          <Zap size={12} />
        </div>
      </div>

      <div className="ambience-panel">
        <div className="ambience-header">
          <SlidersHorizontal size={14} />
          <span>Ambience</span>
        </div>
        <label className="ambience-row">
          <span>Rain</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={store.ambience.rain}
            onChange={(e) =>
              store.setAmbience({ rain: Number(e.target.value) })
            }
          />
        </label>
        <label className="ambience-row">
          <span>Café</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={store.ambience.cafe}
            onChange={(e) =>
              store.setAmbience({ cafe: Number(e.target.value) })
            }
          />
        </label>
        <label className="ambience-row">
          <span>White</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={store.ambience.white}
            onChange={(e) =>
              store.setAmbience({ white: Number(e.target.value) })
            }
          />
        </label>
      </div>
    </div>
  );
}
