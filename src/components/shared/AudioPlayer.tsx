'use client';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer({ locale, src, label }: { locale?: string; src?: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const audioSrc = src || `/audio/hero-intro-${locale || 'zh'}.mp3`;
  const displayLabel = label || '🔊';

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} src={audioSrc} onEnded={() => setPlaying(false)} />
      <button
        onClick={toggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        title={playing ? 'Stop' : 'Listen'}
      >
        {playing ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        {displayLabel}
      </button>
    </>
  );
}