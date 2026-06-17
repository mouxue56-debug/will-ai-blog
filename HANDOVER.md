# Handover — will-ai-lab

> Living document for AI agent handoff. Update at the end of every working session.
> **Last updated:** 2026-04-28 (Sonnet round-2 final state) — pending codex validation 2026-05-02

---

## At a glance

| Field | Value |
|---|---|
| Production URL | https://aiblog.fuluckai.com |
| Framework | Next.js 15.5.13 (App Router) |
| Locales | zh / ja / en (via `next-intl`) |
| Hosting | Vercel (`projectId: prj_HjBmJbCl7cA0lPDdvCpMRg3bcQLm`) |
| Repo | https://github.com/mouxue56-debug/will-ai-blog |
| Default branch | `main` |
| Current main tip | `e212712 Merge pull request #1 from mouxue56-debug/feat/icecream-refresh` |

---

## Production status (verified 2026-04-28)

`curl -sI https://aiblog.fuluckai.com/zh` returns:

```
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
server: Vercel
```

**Outstanding production smell**: `x-powered-by: Next.js` was still present at last check — fix is in PR #2 (open, not merged).

---

## Git state

### Branch map

```
main                            e212712  ← origin/main, deployed to production
├─ feat/icecream-refresh        669f729  (merged into main via PR #1; same tip as round-2)
├─ chore/sonnet-polish-round-2  669f729  (Apr 28 Sonnet 4h loop, ~56 commits + 4 opus)
├─ chore/website-debug-polish   b05acb8  (Apr 25 GLM 4h loop, 63 commits) — orphan, content in main
├─ fix/disable-powered-by-header fe59d67 ← currently checked out, PR #2 OPEN
├─ candy-v1                     9430034  (older; pre-icecream)
├─ feat/glass-candy-v2          3b65842  (older; rolled back, see vault)
└─ ice-cream-redesign           9430034  (ahead 8 / behind 194 vs main)
```

### Open PRs

| # | Title | Branch | State | Date |
|---|---|---|---|---|
| 1 | Polish + 端到端 opus 修复 + Sonnet round-2 (159 commits) | `feat/icecream-refresh` | **MERGED** | 2026-04-28 |
| 2 | fix(security): drop X-Powered-By header | `fix/disable-powered-by-header` | **OPEN** | 2026-04-28 |

### Recent main history (last 8)

```
e212712  Merge pull request #1 from mouxue56-debug/feat/icecream-refresh
669f729  sonnet(next/image sizes hint completeness): add sizes to profile portrait
d131475  sonnet(BlogCard hover polish): make card glow color category-aware
f92e6fc  sonnet(Error boundary coverage on /debate /blog): replace hardcoded ternaries with tBlog('back')
d947baa  sonnet(loading state UX on slow networks): add shimmer skeleton for /timeline route
d7f939b  sonnet(API route input validation): cap GET /api/news limit at 100, guard NaN
669f729..(many sonnet/opus commits — see PR #1 for full list)
9f86474  opus polish: img→Image, untrack glm tooling, pin lockfile root
eab9bcb  merge: integrate chore/website-debug-polish (63 GLM polish + 6 earlier polish commits)
```

### Uncommitted local changes (as of handoff)

```
M src/app/api/daily-report/route.ts
```

**Diff summary**: removes `fs/path/os` imports, rewrites `generateTrilingualTitles` to drop the `~/.openclaw/openclaw.json` config-file lookup. Looks like a refactor to switch from filesystem config → env var. **Not authored by this session's loop; investigate before committing.** Likely Will's manual edit or another agent's WIP.

---

## Project structure

```
will-ai-lab/
├── HANDOVER.md           ← THIS FILE
├── AGENTS.md             ← AI team self-check guide (2.4KB)
├── README.md             ← user-facing readme (2.1KB)
├── next.config.ts        ← security headers, image domains, MDX, next-intl
├── package.json          ← 21 deps, 12 devDeps (after recharts/tw-animate cleanup)
├── messages/
│   ├── en.json           ← 488 keys
│   ├── zh.json           ← 488 keys (perfect parity with en)
│   └── ja.json           ← 488 keys (perfect parity with en)
└── src/
    ├── app/
    │   ├── [locale]/                      ← all user-facing routes (i18n routed)
    │   │   ├── about/      admin/         ai-join/   auth/
    │   │   ├── blog/       cases/         cattery/   debate/
    │   │   ├── learning/   life/          news/      social/
    │   │   ├── timeline/   feed.xml/
    │   │   ├── error.tsx   loading.tsx    not-found.tsx
    │   │   ├── layout.tsx  page.tsx
    │   ├── api/                           ← 17 API routes (see below)
    │   ├── auth/signin/                   ← (excluded from sitemap intentionally)
    │   ├── feed.xml/  llms.txt/
    │   ├── not-found.tsx                  ← root 404 (no-next-intl SSG-safe)
    │   ├── robots.ts  sitemap.ts          ← SEO files
    │   └── layout.tsx
    ├── components/
    │   ├── about/    admin/    blog/     ← blog/enhanced/ for MDX layout
    │   ├── cases/    debate/   home/
    │   ├── layout/   learning/ life/
    │   ├── shared/   social/   timeline/
    │   └── ui/                             ← ui/aceternity/ for shadcn primitives
    ├── content/blog/                       ← markdown + MDX articles
    ├── content/digest/
    ├── data/                               ← static data (cases, etc)
    ├── i18n/                               ← next-intl routing config
    ├── lib/                                ← utilities (blog, supabase, locale, seo)
    │   ├── blog.ts        blog-types.ts
    │   ├── locale.ts      seo.ts
    │   ├── supabase.ts    storage.ts
    │   ├── timeline-data.ts
    │   └── ...
    └── styles/                             ← globals.css imported via app/layout.tsx
```

### API routes (17)

```
/api/admin/comments
/api/ai-agents/register
/api/auth/[...nextauth]
/api/comments/[id]
/api/comments
/api/daily-digest
/api/daily-report                          ← uncommitted edit pending
/api/debate/opinion/[topicId]
/api/debate/opinion
/api/debate/spec
/api/debate/topics
/api/news-fetch
/api/news/[id]/comments
/api/news
/api/posts/[slug]
/api/posts
/api/setup                                 ← uses SUPABASE_SERVICE_ROLE_KEY (server-only)
```

### Key environment variables (deduce from grep)

```
NEXT_PUBLIC_SUPABASE_URL                   (client-safe)
SUPABASE_SERVICE_ROLE_KEY                  (server-only — never expose)
NEXTAUTH_*                                 (next-auth v5 beta config)
```

`/api/setup` reads service role; `src/lib/supabase.ts` initializes a single `supabaseAdmin` client. Server components (`debate/page.tsx`, `TodayFeedTeaser.tsx`) import `supabaseAdmin`. **All current usages are server-side. No client leak detected.**

---

## What was just done (Apr 25 → Apr 28 sessions)

Three phases, all merged to main via PR #1:

1. **Apr 25 — GLM-5.1 4h autonomous loop** (`chore/website-debug-polish`)
   - Worker: Claude Sonnet API compat shim → GLM-5.1 via Infini-AI CodingPlan
   - 63 commits before 5h quota wall
   - Focus: a11y, i18n, dead code, error boundaries, dark-mode contrast, OG/SEO

2. **Apr 28 — Opus end-to-end fixes** (`feat/icecream-refresh`)
   - 5 `<img>` → `next/image` with `fill` + `sizes` + `unoptimized` passthrough for external URLs
   - `outputFileTracingRoot` pinned (was picking up `$HOME/package-lock.json`)
   - Untracked `.glm-*` / `.sonnet-*` / `public/grid-trade-*.html`
   - Resolved `not-found.tsx` merge conflict (kept GLM dark luxury visual + Will's no-next-intl SSG-safe approach)

3. **Apr 28 — Sonnet round-2 4h autonomous loop** (`chore/sonnet-polish-round-2`)
   - Worker: Claude Sonnet via `claude -p --model sonnet`
   - 114 tasks, ~56 commits + 4 opus cross-cutting commits
   - Auto-stopped at 5h sliding window (22:00 JST), resumed after reset
   - **Real bug fixes** (not just polish):
     - `debate/page.tsx`: Supabase query was destructuring only `data` — `error` field never captured, so `debate/error.tsx` was permanently dead. Fixed: capture `topicsError`, log, throw.
     - `TodayFeedTeaser.tsx`: same silent failure pattern.
     - `extractHeadings`: regex picked up `##` inside fenced markdown code blocks (confirmed in `swarm-v62-evolution.md`), creating phantom TOC entries. Now tracks fence state line-by-line.
     - `life-grid.tsx`: Tailwind `hover:scale-[1.02]` was overriding `.glass-card:hover` lift transform via cascade.
     - mobile nav glow: missing baseline `drop-shadow(0 0 0)` so CSS transition had no `from` state.
     - footer `aria-label="Sites"` was shadowing the entire `<footer>` contentinfo role.
   - Production hardening (4 opus commits):
     - 5 security headers: HSTS (2y, preload), X-Frame, nosniff, Referrer-Policy, Permissions-Policy
     - `recharts` removed (8.4MB, 0 imports)
     - `npm audit fix`: 3 high vulns cleared (picomatch ReDoS×2 + method injection); 5 moderate remain (next/next-auth peer-dep chain)
     - Sitemap: added `/learning` + `/ai-join` (were unindexed)

---

## Verification checklist (for fresh agents)

Run these to confirm the merged state matches what's claimed.

### 1. Build & lint health
```bash
cd /Users/lauralyu/projects/will-ai-lab
npm run build              # Expect: 80+ routes compile, exit 0
npm run lint               # Expect: ✔ No ESLint warnings or errors
```

### 2. i18n parity (488/488/488)
```bash
node -e "const fs=require('fs');for(const l of['en','zh','ja']){const j=JSON.parse(fs.readFileSync('messages/'+l+'.json'));function f(o){let n=0;for(const k in o){if(o[k]&&typeof o[k]==='object')n+=f(o[k]);else n++;}return n;}console.log(l,f(j));}"
# Expect: en 488, zh 488, ja 488
```

### 3. Production headers
```bash
curl -sI https://aiblog.fuluckai.com/zh | grep -iE "strict|x-frame|x-content|referrer|permissions|powered"
# Expect 5 security headers present.
# Expect x-powered-by: Next.js STILL PRESENT (PR #2 unmerged) — until PR #2 ships.
```

### 4. Loop artifacts properly ignored
```bash
git ls-files | grep -E "\.glm-|\.sonnet-|grid-trade"
# Expect: empty (all gitignored)
```

### 5. Service role key never client-side
```bash
grep -rn "SUPABASE_SERVICE_ROLE\|service_role" src/ | grep -v "src/lib/supabase.ts" | grep -v "src/app/api/" | grep -v "src/app/\[locale\]/debate/page.tsx" | grep -v "TodayFeedTeaser.tsx"
# Expect: empty (only server-side files use it)
```

### 6. Round-2 commits actually in main
```bash
git log origin/main --oneline | grep -cE "^[0-9a-f]+ (sonnet|opus)\("
# Expect: ~60 (sonnet round-2 56 + opus 4)
```

### 7. Real bug fix landed: debate Supabase error capture
```bash
grep -A2 "from('daily_reports')" src/app/[locale]/debate/page.tsx
# Expect: should destructure { data, error: topicsError }, not just { data }
```

### 8. Image optimization in cover containers
```bash
grep -l "import Image from 'next/image'" src/components/blog/*.tsx src/components/cases/*.tsx
# Expect: blog-card.tsx, blog-detail.tsx, case-card.tsx, case-detail.tsx
```

### 9. PR #2 still open (X-Powered-By fix waiting)
```bash
gh pr view 2 --json state,mergeable
# Expect: state=OPEN, mergeable=MERGEABLE
```

---

## Known TODO / Open items

| Priority | Item | Where | Notes |
|---|---|---|---|
| **P0** | Decide on uncommitted `daily-report/route.ts` change | `src/app/api/daily-report/route.ts` | Removes filesystem config lookup, switches to env var. Need to confirm intent with Will before committing/reverting. |
| **P0** | Merge PR #2 to remove `x-powered-by: Next.js` | https://github.com/mouxue56-debug/will-ai-blog/pull/2 | 1-line config, build verified. Hook blocked direct merge — Will needs to click. |
| P1 | CSP (Content-Security-Policy) header | `next.config.ts` | Deferred from round-2 opus — needs per-script audit (motion, next-intl, supabase, vercel/analytics) before turning on. |
| P1 | Resolve 5 remaining moderate npm vulns | `package.json` | Tied to next/next-auth/next-intl peer-dep chain. `npm audit fix --force` would break things — wait for upstream. |
| P2 | `next lint` is deprecated in Next 16 | `package.json` script | Migrate to ESLint CLI: `npx @next/codemod@canary next-lint-to-eslint-cli .` |
| P2 | Bundle analyzer pass | n/a | Run `@next/bundle-analyzer` once to find further dead code beyond what static grep caught. |
| P3 | RLS audit on Supabase tables | external | Service role bypasses RLS. Confirm no public route reads sensitive tables via service key. |
| P3 | Test suite | n/a | No tests currently. Vitest / Playwright would help future agents validate without manual curl. |

---

## How to continue (for next agent)

### If the task is "merge PR #2"
- The agent harness's permission hook blocks direct main pushes and `gh pr merge` of default-branch PRs.
- Either: (a) ask Will to click Merge in browser, or (b) Will explicitly authorizes "merge PR #2 to main / production deploy" in chat.

### If the task is "more polish"
- The Sonnet 4h loop is at `.sonnet-autonomous-loop.sh` (gitignored, lives only on this machine).
- 30 rotating focus areas, runs `claude -p --model sonnet`. Branches off whatever is checked out.
- Round-3 should branch off `main` (not round-2 again) to avoid redoing finished work.
- `claude -p --model sonnet` uses the user's Claude Max quota (5h sliding window). Round-2 hit the wall once.

### If the task is "validate this handover"
- Run all 9 verification commands above.
- Compare results to claimed values. Report mismatches.
- Pay special attention to (1) silent failures Sonnet caught — re-grep to confirm fix really lives in main; (2) the uncommitted `daily-report/route.ts` change — needs Will's input.

### If something is broken
- Roll back: `git revert -m 1 e212712` reverses the entire PR #1 merge. main returns to pre-Apr-28 state.
- All 159 commits remain on `feat/icecream-refresh` for re-cherry-picking.

---

## Worker history (sessions touching this repo)

| Date | Worker | Branch | Commits | Outcome |
|---|---|---|---|---|
| Apr 19 | Opus (manual) | `feat/icecream-refresh` (init) | rollback from candy-v3 | Direction lock: Dior dark, no candy/cream/masonry |
| Apr 21–24 | Opus + manual | various polish | route-scoped loading, breathing gradients, hero/CTA glow, blog StickyNav | merged into icecream tip |
| Apr 25 12:18–15:24 JST | GLM-5.1 (4h loop) | `chore/website-debug-polish` | 63 | hit 5h CodingPlan quota |
| Apr 25 16:18 | Opus | `chore/website-debug-polish` | merge + opus polish | 5×img→Image, untrack tooling, lockfile pin |
| Apr 28 12:14 JST | Opus | `feat/icecream-refresh` | 1 (merge commit `eab9bcb`) | merged GLM into icecream tip + resolved not-found.tsx conflict |
| Apr 28 18:18–22:21 JST | Sonnet (4h loop) | `chore/sonnet-polish-round-2` | ~56 | hit Claude Max sliding window once at 22:00, resumed |
| Apr 28 (concurrent) | Opus | `chore/sonnet-polish-round-2` | 4 | security headers, recharts removal, sitemap fix, gitignore |
| Apr 28 22:30 JST | Opus | merged via PR #1 | (merge) | 159 commits land on main, Vercel deploys |
| Apr 28 22:53 JST | Opus | `fix/disable-powered-by-header` | 1 | PR #2 opened, awaiting merge |

---

## Files an agent should read first

1. `HANDOVER.md` (this file)
2. `AGENTS.md` (AI team self-check guide)
3. `README.md` (user-facing project description)
4. `next.config.ts` (security headers, MDX, i18n plugin order)
5. `src/i18n/request.ts` + `src/i18n/routing.ts` (i18n config)
6. `src/lib/supabase.ts` (service role gating)
7. The current branch's most recent 10 commits (`git log --oneline -10`)
