// src/lib/store.ts - COMPLETE VERSION WITH ALL PRESETS & PERSISTENCE
import { create } from 'zustand';

export type VibeData = {
  name: string;
  colors: { bg: string; accent: string; orb: string };
  shapeParams: { distort: number; speed: number; roughness: number };
  soundParams: {
    frequency: number;
    waveType: string;
    binauralMode?: 'off' | 'focus' | 'calm' | 'sleep';
    panDriftSpeed?: number;
  };
  message: string;
  suggestedRitual: string;
  stressLevel?: number;
};

type ThemeMode = 'auto' | 'day' | 'night';

type FeatureFlags = {
  historyPanel: boolean;
  breathOverlay: boolean;
  analogNoise: boolean;
};

type ToolHints = {
  timer: boolean;
  music: boolean;
  immersive: boolean;
  binaural: boolean;
  keys: boolean;
  breath: boolean;
  calm: boolean;
  ambience: boolean;
};

export type SessionMetrics = {
  date: string; // YYYY-MM-DD
  presetUsed: string;
  durationMinutes: number;
  completed: boolean;
  timestamp: number; // unix
  stressLevel: number;
};

type VibeStore = {
  currentVibe: VibeData;
  history: { time: string; vibe: string; trigger: string; snapshot: VibeData }[];
  isThinking: boolean;

  timer: { active: boolean; timeLeft: number; duration: number };
  isImmersive: boolean;
  isMusicActive: boolean;

  themeMode: ThemeMode;
  isBinauralEnabled: boolean;

  ambience: { rain: number; cafe: number; white: number };
  keySoundsEnabled: boolean;
  breathModeActive: boolean;

  streakDays: number;
  lastFocusDay: string | null;
  completedSessions: number;
  sessionMetrics: SessionMetrics[];

  featureFlags: FeatureFlags;
  toolHints: ToolHints;

  setThinking: (status: boolean) => void;
  setVibe: (vibe: Partial<VibeData>) => void;
  setVibeAbsolute: (vibe: VibeData) => void;
  addToHistory: (trigger: string, vibeName: string) => void;
  restoreHistoryIndex: (index: number) => void;

  startTimer: (minutes: number, presetName?: string) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  markSessionComplete: () => void;

  toggleImmersive: () => void;
  toggleMusic: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleBinaural: () => void;
  setAmbience: (partial: Partial<{ rain: number; cafe: number; white: number }>) => void;
  toggleKeySounds: () => void;
  toggleBreathMode: () => void;

  triggerCalmProtocol: () => void;
  applyDeepWorkPreset: () => void;
  applyPresetStandup: () => void;
  applyPresetBugHunt: () => void;
  applyPresetCodeReview: () => void;
  applyPresetShipMode: () => void;
  applyPresetSleepRecovery: () => void;
  applyPresetLearning: () => void;

  dismissToolHint: (key: keyof ToolHints) => void;
  setFeatureFlag: (key: keyof FeatureFlags, value: boolean) => void;
  
  loadMetricsFromLocalStorage: () => void;
  saveMetricsToLocalStorage: () => void;
  exportSessionsAsJSON: () => string;
};

// VIBE CONSTANTS
const DEFAULT_VIBE: VibeData = {
  name: 'Systems Nominal',
  colors: { bg: '#030303', accent: '#a855f7', orb: '#6020a0' },
  shapeParams: { distort: 0.3, speed: 1.5, roughness: 0.2 },
  soundParams: { frequency: 60, waveType: 'sine', binauralMode: 'off', panDriftSpeed: 0.1 },
  message: 'Operating System Online. Awaiting input...',
  suggestedRitual: '',
  stressLevel: 10,
};

const CALM_VIBE: VibeData = {
  name: 'Calm Protocol',
  colors: { bg: '#02010a', accent: '#38bdf8', orb: '#1e293b' },
  shapeParams: { distort: 0.1, speed: 0.4, roughness: 0.1 },
  soundParams: { frequency: 60, waveType: 'sine', binauralMode: 'sleep', panDriftSpeed: 0.02 },
  message: 'Breathing down the system load. Nothing is on fire.',
  suggestedRitual: 'Slow inhale 4s, hold 4s, exhale 8s. Repeat 5 times.',
  stressLevel: 20,
};

const DEEP_WORK_VIBE: VibeData = {
  name: 'Deep Work Tunnel',
  colors: { bg: '#020617', accent: '#38bdf8', orb: '#0f172a' },
  shapeParams: { distort: 0.25, speed: 0.8, roughness: 0.15 },
  soundParams: { frequency: 110, waveType: 'sine', binauralMode: 'focus', panDriftSpeed: 0.08 },
  message: 'Tunnel vision engaged. External noise deprioritized.',
  suggestedRitual: 'Pick one task. No context switching until timer ends.',
  stressLevel: 35,
};

const STANDUP_VIBE: VibeData = {
  name: 'Pre-Standup',
  colors: { bg: '#0f172a', accent: '#10b981', orb: '#047857' },
  shapeParams: { distort: 0.15, speed: 0.6, roughness: 0.1 },
  soundParams: { frequency: 80, waveType: 'sine', binauralMode: 'calm', panDriftSpeed: 0.05 },
  message: 'Light focus. Gather your thoughts for the team.',
  suggestedRitual: 'Quick review of yesterday. One sentence per point.',
  stressLevel: 15,
};

const BUG_HUNT_VIBE: VibeData = {
  name: 'Bug Hunt Mode',
  colors: { bg: '#1a0a0a', accent: '#ef4444', orb: '#7f1d1d' },
  shapeParams: { distort: 0.4, speed: 2.0, roughness: 0.3 },
  soundParams: { frequency: 140, waveType: 'sawtooth', binauralMode: 'focus', panDriftSpeed: 0.15 },
  message: 'Debug mode active. Find it. Fix it. Move on.',
  suggestedRitual: 'Isolate the bug. Write a test. Verify the fix.',
  stressLevel: 75,
};

const CODE_REVIEW_VIBE: VibeData = {
  name: 'Code Review Mode',
  colors: { bg: '#082f49', accent: '#0ea5e9', orb: '#0c4a6e' },
  shapeParams: { distort: 0.2, speed: 0.7, roughness: 0.12 },
  soundParams: { frequency: 90, waveType: 'sine', binauralMode: 'calm', panDriftSpeed: 0.06 },
  message: 'Analytical mode. Read code like prose.',
  suggestedRitual: 'One PR at a time. Constructive feedback only.',
  stressLevel: 30,
};

const SHIP_MODE_VIBE: VibeData = {
  name: 'Ship Mode',
  colors: { bg: '#1f0101', accent: '#fbbf24', orb: '#b45309' },
  shapeParams: { distort: 0.35, speed: 1.8, roughness: 0.25 },
  soundParams: { frequency: 130, waveType: 'triangle', binauralMode: 'focus', panDriftSpeed: 0.12 },
  message: 'Shipping adrenaline. Go fast. Break things. Fix them.',
  suggestedRitual: '50 min sprint. Test. Deploy. Celebrate.',
  stressLevel: 70,
};

const SLEEP_RECOVERY_VIBE: VibeData = {
  name: 'Sleep Recovery',
  colors: { bg: '#0a0515', accent: '#8b5cf6', orb: '#2e1065' },
  shapeParams: { distort: 0.08, speed: 0.3, roughness: 0.08 },
  soundParams: { frequency: 40, waveType: 'sine', binauralMode: 'sleep', panDriftSpeed: 0.01 },
  message: 'Theta wave mode. Let your mind wander.',
  suggestedRitual: '90 min session. Minimal caffeine. Lights dimmed.',
  stressLevel: 5,
};

const LEARNING_VIBE: VibeData = {
  name: 'Learning Mode',
  colors: { bg: '#0d2818', accent: '#84cc16', orb: '#3f6212' },
  shapeParams: { distort: 0.22, speed: 1.0, roughness: 0.16 },
  soundParams: { frequency: 100, waveType: 'sine', binauralMode: 'calm', panDriftSpeed: 0.09 },
  message: 'Curiosity mode. Absorb everything.',
  suggestedRitual: 'Take notes. Ask questions. Build a small project.',
  stressLevel: 25,
};

const initialToolHints: ToolHints = {
  timer: false, music: false, immersive: false, binaural: false,
  keys: false, breath: false, calm: false, ambience: false,
};

export const useVibeStore = create<VibeStore>((set, get) => ({
  currentVibe: DEFAULT_VIBE,
  history: [],
  isThinking: false,
  timer: { active: false, timeLeft: 0, duration: 0 },
  isImmersive: false,
  isMusicActive: false,
  themeMode: 'auto',
  isBinauralEnabled: false,
  ambience: { rain: 0.0, cafe: 0.0, white: 0.0 },
  keySoundsEnabled: false,
  breathModeActive: false,
  streakDays: 0,
  lastFocusDay: null,
  completedSessions: 0,
  sessionMetrics: [],
  featureFlags: { historyPanel: true, breathOverlay: true, analogNoise: true },
  toolHints: initialToolHints,

  setThinking: (status) => set({ isThinking: status }),
  setVibe: (newVibe) => set((state) => ({ currentVibe: { ...state.currentVibe, ...newVibe } })),
  setVibeAbsolute: (vibe) => set({ currentVibe: vibe }),

  addToHistory: (trigger, vibeName) => set((state) => {
    const now = new Date();
    const entry = {
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vibe: vibeName,
      trigger,
      snapshot: state.currentVibe,
    };
    return { history: [...state.history, entry].slice(-20) };
  }),

  restoreHistoryIndex: (index) => set((state) => {
    const entry = state.history[index];
    return entry ? { currentVibe: entry.snapshot } : state;
  }),

  startTimer: (minutes, presetName = 'Custom') =>
    set({ timer: { active: true, timeLeft: minutes * 60, duration: minutes * 60 } }),

  tickTimer: () => set((state) => {
    if (!state.timer.active || state.timer.timeLeft <= 0) return state;
    const newTime = state.timer.timeLeft - 1;
    return { timer: { ...state.timer, timeLeft: newTime, active: newTime > 0 } };
  }),

  stopTimer: () => set({ timer: { active: false, timeLeft: 0, duration: 0 } }),

  markSessionComplete: () => set((state) => {
    const today = new Date().toISOString().slice(0, 10);
    let streakDays = state.streakDays;
    if (state.lastFocusDay !== today) {
      streakDays = state.lastFocusDay ? streakDays + 1 : 1;
    }

    const metric: SessionMetrics = {
      date: today,
      presetUsed: state.currentVibe.name,
      durationMinutes: state.timer.duration / 60,
      completed: true,
      timestamp: Date.now(),
      stressLevel: state.currentVibe.stressLevel || 0,
    };

    const newMetrics = [...state.sessionMetrics, metric];
    const newState = {
      streakDays,
      lastFocusDay: today,
      completedSessions: state.completedSessions + 1,
      sessionMetrics: newMetrics,
    };

    // SAVE TO LOCALSTORAGE IMMEDIATELY
    try {
      localStorage.setItem('vibe_metrics', JSON.stringify({
        streakDays: newState.streakDays,
        lastFocusDay: newState.lastFocusDay,
        completedSessions: newState.completedSessions,
        sessionMetrics: newMetrics,
      }));
    } catch (e) {
      console.warn('Failed to save metrics', e);
    }

    return newState;
  }),

  toggleImmersive: () => set((state) => ({ isImmersive: !state.isImmersive })),
  toggleMusic: () => set((state) => ({ isMusicActive: !state.isMusicActive })),
  setThemeMode: (mode) => set({ themeMode: mode }),
  toggleBinaural: () => set((state) => ({ isBinauralEnabled: !state.isBinauralEnabled })),
  setAmbience: (partial) => set((state) => ({ ambience: { ...state.ambience, ...partial } })),
  toggleKeySounds: () => set((state) => ({ keySoundsEnabled: !state.keySoundsEnabled })),
  toggleBreathMode: () => set((state) => ({ breathModeActive: !state.breathModeActive })),
  triggerCalmProtocol: () => set({ currentVibe: CALM_VIBE }),

  applyDeepWorkPreset: () => set((state) => ({
    currentVibe: DEEP_WORK_VIBE,
    timer: { active: true, timeLeft: 60 * 60, duration: 60 * 60 },
    isMusicActive: true,
    isBinauralEnabled: true,
    ambience: { rain: 0.3, cafe: 0, white: 0.1 },
  })),

  applyPresetStandup: () => set((state) => ({
    currentVibe: STANDUP_VIBE,
    timer: { active: true, timeLeft: 15 * 60, duration: 15 * 60 },
    isMusicActive: false,
    isBinauralEnabled: false,
    ambience: { rain: 0, cafe: 0.1, white: 0 },
  })),

  applyPresetBugHunt: () => set((state) => ({
    currentVibe: BUG_HUNT_VIBE,
    timer: { active: true, timeLeft: 45 * 60, duration: 45 * 60 },
    isMusicActive: true,
    isBinauralEnabled: true,
    ambience: { rain: 0.1, cafe: 0, white: 0.2 },
  })),

  applyPresetCodeReview: () => set((state) => ({
    currentVibe: CODE_REVIEW_VIBE,
    timer: { active: true, timeLeft: 30 * 60, duration: 30 * 60 },
    isMusicActive: true,
    isBinauralEnabled: false,
    ambience: { rain: 0.1, cafe: 0.2, white: 0 },
  })),

  applyPresetShipMode: () => set((state) => ({
    currentVibe: SHIP_MODE_VIBE,
    timer: { active: true, timeLeft: 60 * 60, duration: 60 * 60 },
    isMusicActive: true,
    isBinauralEnabled: true,
    ambience: { rain: 0.4, cafe: 0, white: 0.1 },
  })),

  applyPresetSleepRecovery: () => set((state) => ({
    currentVibe: SLEEP_RECOVERY_VIBE,
    timer: { active: true, timeLeft: 20 * 60, duration: 20 * 60 },
    isMusicActive: true,
    isBinauralEnabled: true,
    ambience: { rain: 0.5, cafe: 0, white: 0.1 },
  })),

  applyPresetLearning: () => set((state) => ({
    currentVibe: LEARNING_VIBE,
    timer: { active: true, timeLeft: 50 * 60, duration: 50 * 60 },
    isMusicActive: true,
    isBinauralEnabled: false,
    ambience: { rain: 0, cafe: 0.3, white: 0 },
  })),

  dismissToolHint: (key) => set((state) => ({
    toolHints: { ...state.toolHints, [key]: true },
  })),

  setFeatureFlag: (key, value) => set((state) => ({
    featureFlags: { ...state.featureFlags, [key]: value },
  })),

  loadMetricsFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem('vibe_metrics');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          streakDays: parsed.streakDays || 0,
          lastFocusDay: parsed.lastFocusDay || null,
          completedSessions: parsed.completedSessions || 0,
          sessionMetrics: parsed.sessionMetrics || [],
        });
      }
    } catch (e) {
      console.warn('Failed to load metrics', e);
    }
  },

  saveMetricsToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    try {
      localStorage.setItem('vibe_metrics', JSON.stringify({
        streakDays: state.streakDays,
        lastFocusDay: state.lastFocusDay,
        completedSessions: state.completedSessions,
        sessionMetrics: state.sessionMetrics,
      }));
    } catch (e) {
      console.warn('Failed to save metrics', e);
    }
  },

  exportSessionsAsJSON: () => {
    const state = get();
    return JSON.stringify({
      exported: new Date().toISOString(),
      stats: {
        streakDays: state.streakDays,
        completedSessions: state.completedSessions,
        totalMinutes: state.sessionMetrics.reduce((acc, s) => acc + s.durationMinutes, 0),
      },
      sessions: state.sessionMetrics,
    }, null, 2);
  },
}));