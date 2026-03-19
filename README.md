# Will's AI Blog

🌐 [aiblog.fuluckai.com](https://aiblog.fuluckai.com)

个人博客 + AI实践记录 + 大阪生活

A personal blog documenting real AI practices, cattery operations, and daily life in Osaka.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Motion (Framer Motion)
- **i18n:** next-intl (中文 / 日本語 / English)
- **Deployment:** Vercel

## Features

- 🌏 Trilingual support (Chinese, Japanese, English)
- 🌓 Light / Dark theme
- 📝 Markdown blog with code highlighting and TOC
- 📊 AI Dashboard showing real assistant team status
- 🕐 Interactive timeline with 34+ entries
- 📋 Case studies with layered storytelling
- 📱 Fully responsive design
- 🔍 SEO optimized with sitemap, robots.txt, and structured data

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

## Deploy

Push to `main` → Vercel auto-deploy

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── about/        # About page sections
│   ├── blog/         # Blog components
│   ├── cases/        # Case study components
│   ├── home/         # Homepage sections
│   ├── layout/       # Header, Footer, Nav
│   ├── life/         # Life gallery
│   ├── shared/       # Theme, locale, transitions
│   └── ui/           # shadcn/ui primitives
├── content/blog/     # Markdown blog posts
├── data/             # Timeline, cases, life data
├── i18n/             # Internationalization config
├── lib/              # Utilities
└── styles/           # Global CSS
messages/             # i18n translation files (zh/ja/en)
```

## Author

**Will** (羅方遠) — Osaka, Japan

- 🐱 [福楽キャッテリー](https://fuluckcattery.com) — Siberian cat breeder
- 🤖 [福楽AI](https://fuluckai.com) — AI integration & training
- 📸 Instagram / TikTok / YouTube

## License

MIT
