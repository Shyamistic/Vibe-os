'use client';

import React from 'react';
import { useVibeStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Target, Bug, Code2, Rocket, Coffee,
  Moon, BookOpen, Zap
} from 'lucide-react';

const PRESETS = [
  {
    id: 'deep-work',
    label: 'Deep Work',
    shortcut: '1',
    icon: Target,
    action: 'applyDeepWorkPreset',
    color: '#38bdf8',
    duration: '60m',
    description: 'Tunnel vision engaged',
  },
  {
    id: 'standup',
    label: 'Standup',
    shortcut: '2',
    icon: Coffee,
    action: 'applyPresetStandup',
    color: '#10b981',
    duration: '15m',
    description: 'Gather your thoughts',
  },
  {
    id: 'bug-hunt',
    label: 'Bug Hunt',
    shortcut: '3',
    icon: Bug,
    action: 'applyPresetBugHunt',
    color: '#ef4444',
    duration: '45m',
    description: 'Debug mode active',
  },
  {
    id: 'code-review',
    label: 'Code Review',
    shortcut: '4',
    icon: Code2,
    action: 'applyPresetCodeReview',
    color: '#0ea5e9',
    duration: '30m',
    description: 'Read like prose',
  },
  {
    id: 'ship-mode',
    label: 'Ship Mode',
    shortcut: '5',
    icon: Rocket,
    action: 'applyPresetShipMode',
    color: '#fbbf24',
    duration: '60m',
    description: 'Deploy adrenaline',
  },
  {
    id: 'learning',
    label: 'Learning',
    shortcut: '6',
    icon: BookOpen,
    action: 'applyPresetLearning',
    color: '#84cc16',
    duration: '50m',
    description: 'Curiosity mode',
  },
  {
    id: 'rest',
    label: 'Sleep Recovery',
    shortcut: '7',
    icon: Moon,
    action: 'applyPresetSleepRecovery',
    color: '#8b5cf6',
    duration: '20m',
    description: 'Let your mind drift',
  },
  {
    id: 'calm',
    label: 'Calm Protocol',
    shortcut: '8',
    icon: Zap,
    action: 'triggerCalmProtocol',
    color: '#38bdf8',
    duration: 'instant',
    description: 'Panic button',
  },
];

export function PresetSwitcher() {
  const store = useVibeStore();
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[1-8]$/.test(key)) {
        e.preventDefault();
        const preset = PRESETS[parseInt(key) - 1];
        if (preset && preset.action in store) {
          (store as any)[preset.action]();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  return (
    <div className="preset-switcher-container">
      <div className="preset-header">
        <div className="preset-indicator">
          <div className="pulse-dot" />
          <span className="header-text">⚡ Preset Selector</span>
        </div>
        <div className="preset-stats">
          <span className="stat-item">
            <span className="stat-label">Current Vibe</span>
            <span className="stat-value">{store.currentVibe.name}</span>
          </span>
          {store.timer.active && (
            <span className="stat-item timer-active">
              <span className="stat-label">⏱️ Timer</span>
              <span className="stat-value">
                {Math.floor(store.timer.timeLeft / 60)}:
                {String(store.timer.timeLeft % 60).padStart(2, '0')}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="preset-grid">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = store.currentVibe.name === preset.label;

          return (
            <motion.button
              key={preset.id}
              onMouseEnter={() => setHoveredId(preset.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (preset.action in store) {
                  (store as any)[preset.action]();
                }
              }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.93 }}
              className={`preset-button ${isActive ? 'active' : ''}`}
              style={{
                '--preset-color': preset.color,
              } as React.CSSProperties}
            >
              <div className="preset-button-content">
                <Icon size={24} style={{ color: preset.color }} strokeWidth={1.5} />
                <div className="preset-button-label">{preset.label}</div>
                <div className="preset-button-shortcut">{preset.shortcut}</div>
              </div>

              {hoveredId === preset.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="preset-tooltip"
                  style={{ borderColor: preset.color }}
                >
                  <div className="tooltip-title">{preset.label}</div>
                  <div className="tooltip-desc">{preset.description}</div>
                  <div className="tooltip-duration">⏱️ {preset.duration}</div>
                </motion.div>
              )}

              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="active-border"
                  style={{ borderColor: preset.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="preset-footer">
        <span className="footer-text">
          Press <kbd>1-8</kbd> • Space to Timer • Esc to Exit
        </span>
      </div>
    </div>
  );
}
