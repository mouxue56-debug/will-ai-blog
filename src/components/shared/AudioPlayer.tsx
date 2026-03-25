'use client';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getAudioUrl } from '@/lib/storage';

const HERO_LABEL: Record<string, string> = {
  zh: '听 Will 自我介绍',
  ja: 'Will の自己紹介を聴く',
  en: "Hear Will's intro",
};

const STOP_LABEL: Record<string, string> = {
  zh: '停止播放',
  ja: '停止',
  en: 'Stop',
};

export function AudioPlayer({ locale, src, label }: { locale?: string; src?: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loc = locale || 'zh';
  
  const resolvedSrc = src?.startsWith('/audio/') 
    ? getAudioUrl(src.replace('/audio/', ''))
    : (src || `placeholder-hero-intro-${loc}.mp3`);
  const audioSrc = resolvedSrc.startsWith('/audio/') 
    ? getAudioUrl(resolvedSrc.replace('/audio/', ''))
    : resolvedSrc.startsWith('http')
    ? resolvedSrc
    : getAudioUrl(`hero-intro-${loc}.mp3`);

  const btnLabel = label || HERO_LABEL[loc] || HERO_LABEL['zh'];
  const stopLabel = STOP_LABEL[loc] || STOP_LABEL['zh'];

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
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
          playing
            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/20'
            : 'border-cyan-500/40 bg-cyan-500/8 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60'
        }`}
        title={playing ? stopLabel : btnLabel}
      >
        {playing
          ? <VolumeX className="w-4 h-4 shrink-0" />
          : <Volume2 className="w-4 h-4 shrink-0" />}
        <span>{playing ? stopLabel : btnLabel}</span>
      </button>
    </>
  );
}