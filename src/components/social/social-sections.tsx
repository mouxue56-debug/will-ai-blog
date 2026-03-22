'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { YouTubeEmbed } from './YouTubeEmbed';
import { InstagramGrid } from './InstagramGrid';
import { TikTokGrid } from './TikTokGrid';

/* ── YouTube ─────────────────────────────────────────── */

const sampleVideoIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', 'kJQP7kiw5Fk'];

function YouTubeSection() {
  const t = useTranslations('social');

  const videos = [
    { key: 'kittens', date: '2026-03-18', views: '2.3K', gradient: 'from-red-500 via-red-400 to-orange-400', emoji: '🐱', videoId: sampleVideoIds[0] },
    { key: 'workflow', date: '2026-03-10', views: '1.8K', gradient: 'from-red-600 via-rose-500 to-pink-400', emoji: '🤖', videoId: sampleVideoIds[1] },
    { key: 'foodwalk', date: '2026-03-01', views: '3.1K', gradient: 'from-red-400 via-orange-400 to-yellow-400', emoji: '🍜', videoId: sampleVideoIds[2] },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white text-xl shadow-lg shadow-red-500/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400">YouTube</h3>
          <p className="text-sm text-muted-foreground">{t('youtube_subtitle')}</p>
        </div>
      </div>

      {/* Featured video embed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-5"
      >
        <YouTubeEmbed videoId={videos[0].videoId} title={t(`youtube_videos.${videos[0].key}`)} />
      </motion.div>

      {/* More video cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {videos.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            className="rounded-lg overflow-hidden bg-white/5 dark:bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className={`bg-gradient-to-br ${v.gradient} h-28 flex items-center justify-center relative`}>
              <span className="text-3xl">{v.emoji}</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium line-clamp-2 mb-1">{t(`youtube_videos.${v.key}`)}</h4>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{v.date}</span>
                <span>▶ {v.views}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subscribe button */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          {t('subscribe')}
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          {t('view_channel')} →
        </a>
      </div>
    </motion.section>
  );
}

/* ── Instagram ───────────────────────────────────────── */

function InstagramSection() {
  const t = useTranslations('social');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-xl shadow-lg shadow-purple-500/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">Instagram</h3>
          <p className="text-sm text-muted-foreground">{t('instagram_subtitle')}</p>
        </div>
      </div>

      {/* Photo grid */}
      <InstagramGrid />

      {/* Follow button */}
      <a
        href="#"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20"
      >
        {t('follow')} @fuluck_cattery →
      </a>
    </motion.section>
  );
}

/* ── TikTok ──────────────────────────────────────────── */

function TikTokSection() {
  const t = useTranslations('social');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-xl shadow-lg">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white dark:fill-black">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.18a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.61z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold">TikTok</h3>
          <p className="text-sm text-muted-foreground">{t('tiktok_subtitle')}</p>
        </div>
      </div>

      {/* Video grid */}
      <TikTokGrid />

      {/* Follow button */}
      <a
        href="#"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity shadow-md"
      >
        {t('follow')} →
      </a>
    </motion.section>
  );
}

/* ── Bottom Links ────────────────────────────────────── */

function AllPlatformLinks() {
  const t = useTranslations('social');

  const platforms = [
    { name: 'YouTube', url: '#', color: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30', icon: '▶' },
    { name: 'Instagram', url: '#', color: 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30', icon: '📷' },
    { name: 'TikTok', url: '#', color: 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800', icon: '🎵' },
    { name: 'X / Twitter', url: '#', color: 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800', icon: '𝕏' },
    { name: 'LINE', url: '#', color: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30', icon: '💬' },
    { name: 'GitHub', url: 'https://github.com', color: 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800', icon: '💻' },
    { name: 'note.com', url: 'https://note.com', color: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30', icon: '📝' },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-border/40">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('all_platforms')}</h3>
      <div className="flex flex-wrap gap-3">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-full glass-card text-sm font-medium ${p.color} transition-colors inline-flex items-center gap-2`}
          >
            <span className="text-xs">{p.icon}</span>
            {p.name}
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {t('more_platforms_hint')}
      </p>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────── */

export function SocialSections() {
  return (
    <div className="space-y-8">
      <YouTubeSection />
      <InstagramSection />
      <TikTokSection />
      <AllPlatformLinks />
    </div>
  );
}
