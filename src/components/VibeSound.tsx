'use client';
import { useEffect, useRef, useState } from 'react';
import { useVibeStore } from '@/lib/store';
import { Volume2, VolumeX } from 'lucide-react';

export function VibeSound() {
  const { currentVibe, isBinauralEnabled, ambience } = useVibeStore();

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  const rainGainRef = useRef<GainNode | null>(null);
  const cafeGainRef = useRef<GainNode | null>(null);
  const whiteGainRef = useRef<GainNode | null>(null);

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    audioContextRef.current = ctx;

    const mainGain = ctx.createGain();
    mainGain.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    leftGain.gain.value = 1;
    rightGain.gain.value = 1;

    const panner = ctx.createStereoPanner();

    const merger = ctx.createChannelMerger(2);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(panner);
    panner.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    const makeNoise = () => {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      return whiteNoise;
    };

    const rainNoise = makeNoise();
    const cafeNoise = makeNoise();
    const whiteNoise = makeNoise();

    const rainGain = ctx.createGain();
    const cafeGain = ctx.createGain();
    const whiteGain = ctx.createGain();
    rainGain.gain.value = 0;
    cafeGain.gain.value = 0;
    whiteGain.gain.value = 0;

    rainNoise.connect(rainGain);
    cafeNoise.connect(cafeGain);
    whiteNoise.connect(whiteGain);

    rainGain.connect(mainGain);
    cafeGain.connect(mainGain);
    whiteGain.connect(mainGain);

    rainNoise.start();
    cafeNoise.start();
    whiteNoise.start();

    masterGainRef.current = mainGain;
    filterNodeRef.current = filter;
    leftGainRef.current = leftGain;
    rightGainRef.current = rightGain;
    pannerRef.current = panner;

    rainGainRef.current = rainGain;
    cafeGainRef.current = cafeGain;
    whiteGainRef.current = whiteGain;

    return () => {
      rainNoise.stop();
      cafeNoise.stop();
      whiteNoise.stop();
      ctx.close();
    };
  }, []);

  useEffect(() => {
    if (
      !audioContextRef.current ||
      !leftGainRef.current ||
      !rightGainRef.current ||
      !filterNodeRef.current
    ) {
      return;
    }
    const ctx = audioContextRef.current;

    if (!leftOscRef.current) {
      const osc = ctx.createOscillator();
      osc.connect(leftGainRef.current);
      osc.start();
      leftOscRef.current = osc;
    }
    if (!rightOscRef.current) {
      const osc = ctx.createOscillator();
      osc.connect(rightGainRef.current);
      osc.start();
      rightOscRef.current = osc;
    }

    const now = ctx.currentTime;
    const params = (currentVibe as any).soundParams || {};
    const baseFreq = params.frequency || 60;
    const waveType = params.waveType || 'sine';
    const binauralMode = params.binauralMode || 'off';

    let beatHz = 0;
    if (isBinauralEnabled) {
      if (binauralMode === 'focus') beatHz = 40;
      if (binauralMode === 'calm') beatHz = 10;
      if (binauralMode === 'sleep') beatHz = 4;
    }

    [leftOscRef.current, rightOscRef.current].forEach((osc) => {
      if (!osc) return;
      osc.type = waveType as any;
    });

    if (leftOscRef.current && rightOscRef.current) {
      leftOscRef.current.frequency.cancelScheduledValues(now);
      rightOscRef.current.frequency.cancelScheduledValues(now);

      if (beatHz === 0) {
        const target = Math.max(baseFreq, 40);
        leftOscRef.current.frequency.exponentialRampToValueAtTime(
          target,
          now + 2
        );
        rightOscRef.current.frequency.exponentialRampToValueAtTime(
          target,
          now + 2
        );
      } else {
        const leftTarget = Math.max(baseFreq - beatHz / 2, 40);
        const rightTarget = Math.max(baseFreq + beatHz / 2, 40);
        leftOscRef.current.frequency.exponentialRampToValueAtTime(
          leftTarget,
          now + 2
        );
        rightOscRef.current.frequency.exponentialRampToValueAtTime(
          rightTarget,
          now + 2
        );
      }
    }

    if (filterNodeRef.current) {
      filterNodeRef.current.frequency.cancelScheduledValues(now);

      let filterCutoff = 300;
      if (waveType === 'sine') filterCutoff = 600;
      if (waveType === 'sawtooth') filterCutoff = 200;
      if (waveType === 'square') filterCutoff = 150;

      filterNodeRef.current.frequency.exponentialRampToValueAtTime(
        filterCutoff,
        now + 2
      );
    }
  }, [currentVibe, isBinauralEnabled]);

  useEffect(() => {
    if (!audioContextRef.current || !pannerRef.current) return;
    let frame: number;
    const start = performance.now();
    const speed =
      (currentVibe as any).soundParams?.panDriftSpeed ?? 0.1;

    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      const pan = Math.sin(elapsed * speed);
      pannerRef.current!.pan.value = pan;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [currentVibe]);

  useEffect(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    if (rainGainRef.current) {
      rainGainRef.current.gain.cancelScheduledValues(now);
      rainGainRef.current.gain.linearRampToValueAtTime(
        ambience.rain,
        now + 1
      );
    }
    if (cafeGainRef.current) {
      cafeGainRef.current.gain.cancelScheduledValues(now);
      cafeGainRef.current.gain.linearRampToValueAtTime(
        ambience.cafe,
        now + 1
      );
    }
    if (whiteGainRef.current) {
      whiteGainRef.current.gain.cancelScheduledValues(now);
      whiteGainRef.current.gain.linearRampToValueAtTime(
        ambience.white,
        now + 1
      );
    }
  }, [ambience]);

  const toggleAudio = async () => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const now = audioContextRef.current.currentTime;

    if (isMuted) {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.linearRampToValueAtTime(0.05, now + 2);
      setIsMuted(false);
    } else {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.5);
      setIsMuted(true);
    }
  };

  return (
    <button
      onClick={toggleAudio}
      className="sound-button"
      title="Toggle Bio-Audio Link"
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
