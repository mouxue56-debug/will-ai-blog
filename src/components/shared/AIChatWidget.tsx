'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from 'next-intl';
import { PublicCalendar } from './PublicCalendar';

/* ── Types ────────────────────────────────────────────── */

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

type View = 'chat' | 'calendar';

/* ── i18n content ─────────────────────────────────────── */

const i18n = {
  zh: {
    title: "Will's AI Assistant",
    welcome:
      '你好！我是 Will 的 AI 助手。关于 AI 活用、博客内容、业务合作，请随时提问！',
    quickQ: [
      { label: '关于AI研修', key: 'training' },
      { label: '推荐博客文章', key: 'posts' },
      { label: '联系方式', key: 'contact' },
    ],
    answers: {
      training:
        'Will 提供面向中小企业的 AI 导入研修服务，涵盖 AI 基础认知、提示词工程、业务自动化等模块。可定制线上/线下课程，首次咨询免费。详情请通过下方联系方式咨询！',
      posts:
        '推荐阅读：\n• 「OpenClaw マルチAI入門」— 多AI协同的实践指南\n• 「AI × 猫舎運営」— AI如何助力小型猫舎日常管理\n• 「プロンプト設計の基本」— 从零开始的提示词设计\n\n访问博客页面查看所有文章 →',
      contact:
        '📧 Email: hello@willailab.com\n💬 LINE: 通过猫舎官网联系\n📱 Instagram: @fuluck_cattery\n\n也欢迎通过本站 About 页面的联系表单留言！',
    },
    fallback:
      'AI 助手正在准备中 🚀\n\n请通过以下方式联系 Will：\n📧 hello@willailab.com\n💬 LINE / Instagram DM\n\n感谢您的关注！',
    inputPlaceholder: '输入消息...',
    send: '发送',
    powered: 'Powered by OpenClaw Multi-AI Architecture',
    model: 'Model: Kimi K2.5 + DeepSeek V3.2',
    calendar: '📅 查看日历',
    backToChat: '💬 返回聊天',
    calendarTitle: '公开日历',
  },
  ja: {
    title: "Will's AI Assistant",
    welcome:
      'こんにちは！Will の AI アシスタントです。AI 活用、ブログ内容、ビジネスについてお気軽にご質問ください！',
    quickQ: [
      { label: 'AI研修について', key: 'training' },
      { label: 'ブログのおすすめ記事', key: 'posts' },
      { label: 'お問い合わせ', key: 'contact' },
    ],
    answers: {
      training:
        'Will は中小企業向けの AI 導入研修を提供しています。AI 基礎、プロンプトエンジニアリング、業務自動化などのモジュールをカバー。オンライン / オフラインで柔軟に対応可能です。初回相談は無料ですので、お気軽にお問い合わせください！',
      posts:
        'おすすめ記事：\n• 「OpenClaw マルチAI入門」— マルチ AI 協調の実践ガイド\n• 「AI × 猫舎運営」— AI を活用した猫舎の効率化事例\n• 「プロンプト設計の基本」— ゼロから始めるプロンプト設計\n\nブログページで全記事をご覧いただけます →',
      contact:
        '📧 Email: hello@willailab.com\n💬 LINE: 猫舎公式サイトからお問い合わせ\n📱 Instagram: @fuluck_cattery\n\nAbout ページのお問い合わせフォームもご利用いただけます！',
    },
    fallback:
      'AI アシスタントは準備中です 🚀\n\n以下の方法で Will にご連絡ください：\n📧 hello@willailab.com\n💬 LINE / Instagram DM\n\nご関心いただきありがとうございます！',
    inputPlaceholder: 'メッセージを入力...',
    send: '送信',
    powered: 'Powered by OpenClaw Multi-AI Architecture',
    model: 'Model: Kimi K2.5 + DeepSeek V3.2',
    calendar: '📅 カレンダー',
    backToChat: '💬 チャットに戻る',
    calendarTitle: '公開カレンダー',
  },
  en: {
    title: "Will's AI Assistant",
    welcome:
      "Hi! I'm Will's AI Assistant. Feel free to ask about AI adoption, blog content, or business inquiries!",
    quickQ: [
      { label: 'About AI Training', key: 'training' },
      { label: 'Recommended posts', key: 'posts' },
      { label: 'Contact', key: 'contact' },
    ],
    answers: {
      training:
        'Will offers AI adoption training for small and medium businesses, covering AI fundamentals, prompt engineering, and workflow automation. Online and offline options available. First consultation is free — reach out below!',
      posts:
        'Recommended reads:\n• "OpenClaw Multi-AI Introduction" — A practical guide to multi-AI collaboration\n• "AI × Cattery Operations" — How AI helps manage a small cattery\n• "Prompt Design Basics" — Getting started with prompt engineering\n\nVisit the Blog page to see all posts →',
      contact:
        '📧 Email: hello@willailab.com\n💬 LINE: Contact via cattery website\n📱 Instagram: @fuluck_cattery\n\nYou can also leave a message via the About page contact form!',
    },
    fallback:
      "The AI Assistant is being prepared 🚀\n\nPlease contact Will via:\n📧 hello@willailab.com\n💬 LINE / Instagram DM\n\nThank you for your interest!",
    inputPlaceholder: 'Type a message...',
    send: 'Send',
    powered: 'Powered by OpenClaw Multi-AI Architecture',
    model: 'Model: Kimi K2.5 + DeepSeek V3.2',
    calendar: '📅 Calendar',
    backToChat: '💬 Back to chat',
    calendarTitle: 'Public Calendar',
  },
} as const;

type Locale = keyof typeof i18n;

/* ── component ────────────────────────────────────────── */

let idCounter = 0;
function uid() {
  return `msg-${++idCounter}-${Date.now()}`;
}

export function AIChatWidget() {
  const locale = (useLocale() as Locale) ?? 'zh';
  const t = i18n[locale] ?? i18n.zh;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* seed welcome message */
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: uid(), role: 'assistant', content: t.welcome, timestamp: new Date() },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  /* focus input when opened */
  useEffect(() => {
    if (open && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, view]);

  const pushReply = useCallback(
    (content: string) => {
      setTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', content, timestamp: new Date() },
        ]);
        setTyping(false);
      }, 600 + Math.random() * 400);
    },
    [],
  );

  function handleQuickQ(key: string) {
    const label = t.quickQ.find((q) => q.key === key)?.label ?? key;
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', content: label, timestamp: new Date() },
    ]);
    const answer = (t.answers as Record<string, string>)[key];
    pushReply(answer ?? t.fallback);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', content: text, timestamp: new Date() },
    ]);
    setInput('');
    pushReply(t.fallback);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* ── render ─────────────────────────────────────────── */

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-20 z-[60] w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full bg-gradient-to-br from-brand-mint to-brand-cyan text-white shadow-lg shadow-brand-mint/30 flex items-center justify-center hover:shadow-brand-mint/50 hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Open AI Assistant"
          >
            {/* pulse ring */}
            <span className="absolute inset-0 rounded-full bg-brand-mint/30 animate-ping pointer-events-none" />
            <span className="relative text-2xl">💬</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[70] w-full sm:w-[400px] h-dvh sm:h-[540px] sm:max-h-[80vh] flex flex-col glass-card sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
          >
            {/* ── Header ────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/20 bg-gradient-to-r from-brand-mint/10 to-brand-cyan/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-mint to-brand-cyan flex items-center justify-center text-sm">
                  🤖
                </span>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{t.title}</h3>
                  <span className="text-[10px] text-brand-mint font-medium">Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ── Body ──────────────────────────────── */}
            {view === 'chat' ? (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-brand-mint/20 text-foreground rounded-br-md'
                            : 'bg-foreground/[0.04] text-foreground rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-foreground/[0.04] px-4 py-2.5 rounded-2xl rounded-bl-md flex gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}

                  {/* Quick questions (show only when just welcome msg) */}
                  {messages.length === 1 && !typing && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {t.quickQ.map((q) => (
                        <button
                          key={q.key}
                          onClick={() => handleQuickQ(q.key)}
                          className="text-xs px-3 py-1.5 rounded-full border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/10 transition-colors cursor-pointer"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendar toggle */}
                <div className="flex-shrink-0 px-4 py-1.5 border-t border-border/10">
                  <button
                    onClick={() => setView('calendar')}
                    className="text-xs text-brand-cyan hover:text-brand-mint transition-colors cursor-pointer"
                  >
                    {t.calendar}
                  </button>
                </div>

                {/* Input */}
                <div className="flex-shrink-0 px-3 py-2.5 border-t border-border/20 safe-area-bottom">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.inputPlaceholder}
                      className="flex-1 px-3 py-2 rounded-xl border border-border/30 bg-foreground/[0.03] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand-mint/40"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-mint to-brand-cyan text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                      aria-label={t.send}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13a.5.5 0 01.64-.64L21 12l-17.09 9.51a.5.5 0 01-.64-.64L6 12zm0 0h9" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ── Calendar view ───────────────────── */
              <>
                <div className="flex-shrink-0 px-4 py-2 border-b border-border/10">
                  <button
                    onClick={() => setView('chat')}
                    className="text-xs text-brand-cyan hover:text-brand-mint transition-colors cursor-pointer"
                  >
                    {t.backToChat}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
                  <h4 className="text-sm font-semibold mb-3">{t.calendarTitle}</h4>
                  <PublicCalendar compact />
                </div>
              </>
            )}

            {/* ── Footer / powered by ──────────────── */}
            <div className="flex-shrink-0 px-4 py-2 border-t border-border/10 text-center safe-area-bottom">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 leading-tight">
                {t.powered}
                <br />
                {t.model}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
