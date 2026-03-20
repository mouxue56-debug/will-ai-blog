'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { BorderBeam } from '@/components/ui/aceternity';

/* ── Hero / Profile ──────────────────────────────────── */

function ProfileHero() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8"
    >
      {/* Avatar placeholder */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand-mint via-brand-cyan to-brand-taro flex items-center justify-center text-4xl sm:text-5xl shadow-lg flex-shrink-0">
        🧑‍💻
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold">Will<span className="text-muted-foreground font-normal text-lg sm:text-xl ml-2">（羅方遠）</span></h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('tagline')}</p>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
          {t('bio')}
        </p>
      </div>
    </motion.section>
  );
}

/* ── AI Team ─────────────────────────────────────────── */

interface AIAgent {
  name: string;
  nickname: string;
  roleKey: string;
  model: string;
  color: string;
  bgColor: string;
  borderColor: string;
  beamFrom: string;
  beamTo: string;
}

const agents: AIAgent[] = [
  { name: 'ユキ', nickname: '小爪爪', roleKey: 'agent_yuki_role', model: 'Claude', color: 'text-brand-mint', bgColor: 'bg-brand-mint/10', borderColor: 'border-brand-mint/30', beamFrom: '#5eead4', beamTo: '#38bdf8' },
  { name: 'ナツ', nickname: '小触手', roleKey: 'agent_natsu_role', model: 'Kimi', color: 'text-brand-coral', bgColor: 'bg-brand-coral/10', borderColor: 'border-brand-coral/30', beamFrom: '#fbbf24', beamTo: '#f97316' },
  { name: 'ハル', nickname: '', roleKey: 'agent_haru_role', model: 'DeepSeek', color: 'text-brand-cyan', bgColor: 'bg-brand-cyan/10', borderColor: 'border-brand-cyan/30', beamFrom: '#38bdf8', beamTo: '#818cf8' },
  { name: 'アキ', nickname: '', roleKey: 'agent_aki_role', model: 'Qwen', color: 'text-brand-taro', bgColor: 'bg-brand-taro/10', borderColor: 'border-brand-taro/30', beamFrom: '#c084fc', beamTo: '#e879f9' },
];

function AITeamSection() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('ai_team_title')}</h2>

      <div className="relative">
        {/* Connection SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-15 hidden sm:block" preserveAspectRatio="none">
          <defs>
            <linearGradient id="about-beam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <line x1="12.5%" y1="50%" x2="37.5%" y2="50%" stroke="url(#about-beam)" strokeWidth="1.5" />
          <line x1="37.5%" y1="50%" x2="62.5%" y2="50%" stroke="url(#about-beam)" strokeWidth="1.5" />
          <line x1="62.5%" y1="50%" x2="87.5%" y2="50%" stroke="url(#about-beam)" strokeWidth="1.5" />
          <line x1="12.5%" y1="50%" x2="62.5%" y2="50%" stroke="url(#about-beam)" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="37.5%" y1="50%" x2="87.5%" y2="50%" stroke="url(#about-beam)" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* Agent cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className={`glass-card p-4 sm:p-5 flex flex-col items-center gap-2 text-center relative overflow-hidden`}
            >
              <BorderBeam
                colorFrom={agent.beamFrom}
                colorTo={agent.beamTo}
                size={150}
                duration={8 + i * 2}
                delay={i * 0.5}
              />
              <div className={`text-2xl sm:text-3xl font-bold ${agent.color}`}>{agent.name}</div>
              {agent.nickname && (
                <div className="text-xs text-muted-foreground">{agent.nickname}</div>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground">{t(agent.roleKey)}</div>
              <div className={`text-[10px] sm:text-xs ${agent.color} font-medium px-2 py-0.5 rounded-full ${agent.bgColor}`}>
                {agent.model}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ── Business Links ──────────────────────────────────── */

function BusinessLinkCard({ 
  href, emoji, titleKey, descKey, t, inView, delay 
}: { 
  href: string; emoji: string; titleKey: string; descKey: string; 
  t: (key: string) => string; inView: boolean; delay: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
      className="group glass-card p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-mint/30 transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-mint/10 flex items-center justify-center text-2xl flex-shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold group-hover:text-brand-mint transition-colors truncate">{t(titleKey)}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{t(descKey)}</p>
      </div>
      <span className="text-muted-foreground group-hover:text-brand-mint group-hover:translate-x-1 transition-all duration-200 flex-shrink-0">
        →
      </span>
    </motion.a>
  );
}

function BusinessLinks() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const links = [
    { titleKey: 'biz_fuluckai', descKey: 'biz_fuluckai_desc', url: 'https://fuluckai.com', emoji: '🤖' },
    { titleKey: 'biz_cattery', descKey: 'biz_cattery_desc', url: 'https://fuluck-cattery.com', emoji: '🐱' },
    { titleKey: 'biz_social', descKey: 'biz_social_desc', url: '#', emoji: '📱' },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('business_title')}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((link, i) => (
          <BusinessLinkCard
            key={i}
            href={link.url}
            emoji={link.emoji}
            titleKey={link.titleKey}
            descKey={link.descKey}
            t={t}
            inView={inView}
            delay={0.3 + i * 0.1}
          />
        ))}
      </div>

      {/* Cattery hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5"
      >
        <span>🐾</span>
        {t('cattery_life_hint')}
      </motion.p>
    </motion.section>
  );
}

/* ── Contact ─────────────────────────────────────────── */

function ContactSection() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('contact_title')}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-lg">📧</span>
            <div>
              <div className="font-medium">{t('contact_email')}</div>
              <div className="text-muted-foreground">hello@willailab.com</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-lg">💬</span>
            <div>
              <div className="font-medium">LINE</div>
              <div className="text-muted-foreground">{t('contact_line_placeholder')}</div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="glass-card p-5">
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('form_name')}
              className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40"
              disabled
            />
            <input
              type="email"
              placeholder={t('form_email')}
              className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40"
              disabled
            />
            <textarea
              placeholder={t('form_message')}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 resize-none"
              disabled
            />
            <button
              disabled
              className="w-full px-4 py-2 rounded-lg bg-foreground/10 text-muted-foreground text-sm font-medium cursor-not-allowed"
            >
              {t('form_submit')} — Phase 2
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ── Export ───────────────────────────────────────────── */

export function AboutSections() {
  return (
    <div className="space-y-16">
      <ProfileHero />
      <AITeamSection />
      <BusinessLinks />
      <ContactSection />
    </div>
  );
}
