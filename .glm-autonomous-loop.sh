#!/bin/bash
# 4-hour autonomous improvement loop for will-ai-lab
# Worker: GLM-5.1 via Infini-AI Claude-compatible endpoint (CodingPlan)
# Orchestrator: this script (no Opus tokens used during the loop)
#
# Design:
#   - Runs ONE GLM task at a time (low concurrency, gentle on API)
#   - Each task gets ~12 min budget (perl alarm)
#   - GLM picks ONE small improvement per task from a rotating focus area
#   - Local commits only, never pushes (safety)
#   - User authorized --dangerously-skip-permissions on 2026-04-22

set -u

PROJECT="/Users/lauralyu/projects/will-ai-lab"
LOG="$PROJECT/.glm-autonomous.log"
STATUS="$PROJECT/.glm-autonomous.status"
DURATION_HOURS=4
DEADLINE=$(($(date +%s) + DURATION_HOURS * 3600))
TASK_NUM=0

AREAS=(
  "loading skeleton consistency across routes"
  "hover micro-interactions on glass-cards"
  "mobile responsive issues on /zh homepage"
  "TypeScript any usage and type safety"
  "lint warnings (next/image, unused imports)"
  "i18n key consistency between zh/en/ja"
  "accessibility — aria-labels and focus rings"
  "dead code and unused exports"
  "component prop type tightening"
  "subtle dark-mode contrast fixes"
  "console.log cleanup in production code"
  "missing error boundaries on data fetch"
  "blog detail reading flow polish"
  "navigation/header smoothness"
  "footer polish and link audit"
  "404/not-found page visual"
  "OG/SEO metadata gaps"
  "image alt text quality"
  "CSS animation prefers-reduced-motion coverage"
  "duplicate code in home components"
  "API route input validation"
  "loading state UX on slow networks"
  "Error boundary coverage on /debate /blog"
  "BlogCard hover polish"
)

cd "$PROJECT" || exit 1

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "" >> "$LOG"
echo "############################################################" >> "$LOG"
echo "[$(date)] LOOP START — branch=$CURRENT_BRANCH duration=${DURATION_HOURS}h" >> "$LOG"
echo "[$(date)] Deadline: $(date -r $DEADLINE 2>/dev/null || date)" >> "$LOG"
echo "############################################################" >> "$LOG"

while [ $(date +%s) -lt $DEADLINE ]; do
  TASK_NUM=$((TASK_NUM + 1))
  AREA="${AREAS[$((TASK_NUM % ${#AREAS[@]}))]}"
  REMAINING=$((DEADLINE - $(date +%s)))
  REMAINING_MIN=$((REMAINING / 60))

  echo "" >> "$LOG"
  echo "============================================================" >> "$LOG"
  echo "TASK #$TASK_NUM — $(date) — focus: $AREA — ${REMAINING_MIN}m left" >> "$LOG"
  echo "============================================================" >> "$LOG"

  printf 'task=%d area=%q remaining_min=%d ts=%s\n' "$TASK_NUM" "$AREA" "$REMAINING_MIN" "$(date)" > "$STATUS"

  PROMPT="You are an autonomous code-improvement worker for the Next.js 15 site at $PROJECT.
Site: Will's AI Blog (https://aiblog.fuluckai.com), Dior dark aesthetic (cyan #00D4FF + mint + pink), 3 locales (zh/en/ja).

FOCUS AREA THIS TASK: $AREA

Rules:
1. Read enough files to understand current state (Glob/Grep/Read).
2. Identify ONE small, low-risk improvement in the focus area. If nothing meaningful, output 'NOOP: <reason>' and exit.
3. Make changes via Edit. Touch at most 3 files.
4. Run 'npm run build' to verify no compile errors.
5. If build passes AND change is meaningful, run: git add <files> && git commit -m 'glm($AREA): <one-line summary>' (one HEREDOC line is fine).
6. Do NOT push. Do NOT touch .env, vercel config, package.json deps, or anything in node_modules/.next/.git.
7. Do NOT run 'vercel deploy'. Do NOT run 'git push'.
8. Stay on the current branch ($CURRENT_BRANCH).
9. If build fails, revert with 'git checkout -- <files>' and output 'BUILD_FAIL: <reason>'.
10. Skip files .env*, .glm-autonomous.*, .planning/, scripts/secrets.

End your run with one of: 'COMMITTED: <summary>' / 'NOOP: <reason>' / 'BUILD_FAIL: <reason>'."

  perl -e 'alarm shift; exec @ARGV' 720 \
    env -i HOME="$HOME" PATH="$PATH" \
    ANTHROPIC_BASE_URL="https://cloud.infini-ai.com/maas/coding" \
    ANTHROPIC_AUTH_TOKEN="sk-cp-w3yxardn2uct62uy" \
    /Users/lauralyu/.local/bin/claude -p \
      --model glm-5.1 \
      --max-turns 60 \
      --permission-mode bypassPermissions \
      --dangerously-skip-permissions \
      "$PROMPT" >> "$LOG" 2>&1

  EXIT=$?
  echo "" >> "$LOG"
  echo "[task #$TASK_NUM exit=$EXIT @ $(date)]" >> "$LOG"

  sleep 20
done

echo "" >> "$LOG"
echo "############################################################" >> "$LOG"
echo "[$(date)] LOOP COMPLETE — $TASK_NUM tasks executed" >> "$LOG"
echo "############################################################" >> "$LOG"
printf 'task=DONE total_tasks=%d ts=%s\n' "$TASK_NUM" "$(date)" > "$STATUS"
