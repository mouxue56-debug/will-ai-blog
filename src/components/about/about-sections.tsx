'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  Bot,
  Braces,
  Code2,
  ExternalLink,
  Github,
  Mail,
  MapPin,
  NotebookText,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BorderBeam } from '@/components/ui/aceternity';
import { PublicCalendar } from '@/components/shared/PublicCalendar';
import Image from 'next/image';
import { getIllustrationUrl } from '@/lib/storage';

/* ── Hero / Profile ──────────────────────────────────── */

function ProfileHero() {
  const t = useTranslations('about');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8"
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-brand-cyan/30 shadow-lg flex-shrink-0">
        <Image
          src={getIllustrationUrl('about-portrait')}
          alt="Will"
          width={128}
          height={128}
          className="w-full h-full object-cover object-top"
        />
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold">Will<span className="text-muted-foreground font-normal text-lg sm:text-xl ml-2">{t('display_name_native')}</span></h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('tagline')}</p>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-line">
          {t('bio')}
        </p>
      </div>
    </motion.section>
  );
}

/* ── AI Team ─────────────────────────────────────────── */

interface AIAgent {
  key: string;
  nicknameKey?: string;
  roleKey: string;
  model: string;
  color: string;
  bgColor: string;
  beamFrom: string;
  beamTo: string;
}

const agents: AIAgent[] = [
  { key: 'yuki', nicknameKey: 'agent_yuki_nickname', roleKey: 'agent_yuki_role', model: 'Claude', color: 'text-brand-mint', bgColor: 'bg-brand-mint/10', beamFrom: '#5eead4', beamTo: '#38bdf8' },
  { key: 'natsu', nicknameKey: 'agent_natsu_nickname', roleKey: 'agent_natsu_role', model: 'Kimi', color: 'text-brand-coral', bgColor: 'bg-brand-coral/10', beamFrom: '#fbbf24', beamTo: '#f97316' },
  { key: 'haru', roleKey: 'agent_haru_role', model: 'DeepSeek', color: 'text-brand-cyan', bgColor: 'bg-brand-cyan/10', beamFrom: '#38bdf8', beamTo: '#818cf8' },
  { key: 'aki', roleKey: 'agent_aki_role', model: 'Qwen', color: 'text-brand-taro', bgColor: 'bg-brand-taro/10', beamFrom: '#c084fc', beamTo: '#e879f9' },
];

function AITeamSection() {
  const t = useTranslations('about');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('ai_team_title')}</h2>

      <div className="relative">
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

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,212,255,0.15)' }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="glass-card p-4 sm:p-5 flex flex-col items-center gap-2 text-center relative overflow-hidden"
            >
              <BorderBeam
                colorFrom={agent.beamFrom}
                colorTo={agent.beamTo}
                size={150}
                duration={8 + i * 2}
                delay={i * 0.5}
              />
              <div className={`text-2xl sm:text-3xl font-bold ${agent.color}`}>{t(`agent_names.${agent.key}`)}</div>
              {agent.nicknameKey ? (
                <div className="text-xs text-muted-foreground">{t(agent.nicknameKey)}</div>
              ) : null}
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

/* ── Tool Stack ─────────────────────────────────────── */

interface StackTool {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  href?: string;
}

const stackTools: StackTool[] = [
  {
    titleKey: 'stack_openclaw',
    descKey: 'stack_openclaw_desc',
    icon: Bot,
    accent: 'text-brand-mint',
    glow: 'from-brand-mint/20 to-brand-cyan/10',
  },
  {
    titleKey: 'stack_models',
    descKey: 'stack_models_desc',
    icon: Sparkles,
    accent: 'text-brand-coral',
    glow: 'from-brand-coral/20 to-brand-taro/10',
  },
  {
    titleKey: 'stack_github',
    descKey: 'stack_github_desc',
    icon: Github,
    accent: 'text-foreground',
    glow: 'from-white/10 to-white/0',
    href: 'https://github.com/konayuki56',
  },
  {
    titleKey: 'stack_notion',
    descKey: 'stack_notion_desc',
    icon: NotebookText,
    accent: 'text-brand-cyan',
    glow: 'from-brand-cyan/20 to-brand-mint/10',
  },
  {
    titleKey: 'stack_vscode',
    descKey: 'stack_vscode_desc',
    icon: Code2,
    accent: 'text-brand-taro',
    glow: 'from-brand-taro/20 to-brand-cyan/10',
  },
];

function ToolStackSection() {
  const t = useTranslations('about');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
    >
      <h2 className="text-2xl font-bold mb-2">{t('stack_title')}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-3xl leading-relaxed">{t('stack_intro')}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stackTools.map((tool, index) => {
          const Icon = tool.icon;
          const card = (
            <div className="glass-card p-5 h-full relative overflow-hidden border border-white/10">
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.glow} opacity-70`} />
              <div className="relative z-10 flex h-full flex-col gap-4">
                <div className={`w-11 h-11 rounded-2xl bg-background/70 border border-white/10 flex items-center justify-center ${tool.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold leading-tight">{t(tool.titleKey)}</h3>
                    {tool.href ? <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> : null}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(tool.descKey)}</p>
                </div>
              </div>
            </div>
          );

          return tool.href ? (
            <motion.a
              key={tool.titleKey}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
              className="block"
            >
              {card}
            </motion.a>
          ) : (
            <motion.div
              key={tool.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ── Business Links ──────────────────────────────────── */

function BusinessLinkCard({
  href, emoji, titleKey, descKey, t, delay
}: {
  href: string; emoji: string; titleKey: string; descKey: string;
  t: (key: string) => string; delay: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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

  const links = [
    { titleKey: 'biz_fuluckai', descKey: 'biz_fuluckai_desc', url: 'https://fuluckai.com', emoji: '🤖' },
    { titleKey: 'biz_cattery', descKey: 'biz_cattery_desc', url: 'https://fuluck-cattery.com', emoji: '🐱' },
    { titleKey: 'biz_social', descKey: 'biz_social_desc', url: 'https://aiblog.fuluckai.com/zh/social', emoji: '📱' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('business_title')}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((link, i) => (
          <BusinessLinkCard
            key={link.titleKey}
            href={link.url}
            emoji={link.emoji}
            titleKey={link.titleKey}
            descKey={link.descKey}
            t={t}
            delay={0.3 + i * 0.1}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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

interface ContactLink {
  titleKey: string;
  valueKey: string;
  href: string;
  icon: LucideIcon;
}

const contactLinks: ContactLink[] = [
  {
    titleKey: 'contact_email',
    valueKey: 'contact_email_value',
    href: 'mailto:will@fuluckai.com',
    icon: Mail,
  },
  {
    titleKey: 'contact_github',
    valueKey: 'contact_github_value',
    href: 'https://github.com/konayuki56',
    icon: Github,
  },
  {
    titleKey: 'contact_x',
    valueKey: 'contact_x_value',
    href: 'https://x.com/will_fuluckai',
    icon: Braces,
  },
];

function ContactSection() {
  const t = useTranslations('about');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold mb-6">{t('contact_title')}</h2>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="glass-card p-6 flex flex-col justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{t('contact_intro')}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-brand-cyan" />
              <span className="font-medium text-foreground">{t('contact_location')}:</span>
              <span>{t('contact_location_value')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {['OpenClaw', 'Agent Workflow', 'AI Training'].map((tag, i) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={`px-3 py-1 rounded-full cursor-default ${
                  i === 0 ? 'bg-brand-mint/10 text-brand-mint' :
                  i === 1 ? 'bg-brand-coral/10 text-brand-coral' :
                  'bg-brand-cyan/10 text-brand-cyan'
                }`}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4">
          {contactLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.titleKey}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
                className="group glass-card p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-mint/30 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium group-hover:text-brand-mint transition-colors">{t(link.titleKey)}</div>
                  <div className="text-sm text-muted-foreground truncate">{t(link.valueKey)}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-mint transition-colors flex-shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

/* ── Calendar ─────────────────────────────────────────── */

function CalendarSection() {
  const t = useTranslations('about');

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <h2 className="text-2xl font-bold mb-2">{t('calendar_title')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('calendar_desc')}</p>
      <PublicCalendar />
    </motion.section>
  );
}

/* ── Export ───────────────────────────────────────────── */

export function AboutSections() {
  return (
    <div className="space-y-16">
      <ProfileHero />
      <AITeamSection />
      <ToolStackSection />
      <CalendarSection />
      <BusinessLinks />
      <ContactSection />
    </div>
  );
}
